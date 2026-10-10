package server

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/rs/zerolog/log"
)

const (
	// verificationCodeLength is the number of base32 characters in an emailed code (40 bits).
	verificationCodeLength = 8
	// maxVerificationAttempts is the number of codes that may be tried against one verification.
	maxVerificationAttempts = 5
	// maxVerificationsPerEmail limits how many codes are sent to one address per verificationWindow.
	maxVerificationsPerEmail = 5
	verificationWindow       = time.Hour
)

var errInvalidCode = newError(connect.CodeInvalidArgument, "the code is invalid or has expired; request a new code")

func (s *Server) BeginVerification(ctx context.Context, req *connect.Request[lighteventv1.BeginVerificationRequest]) (*connect.Response[lighteventv1.BeginVerificationResponse], error) {
	addr, err := model.Email("email", req.Msg.Email)
	if err != nil {
		return nil, errorResponse(ctx, err, "verification")
	}
	if !s.verifyIPLimit.Allow("begin:" + access.ClientIP(ctx)) {
		return nil, newError(connect.CodeResourceExhausted, "too many requests; try again later")
	}

	now := s.Now()
	recent, err := s.q.CountRecentVerifications(ctx, storage.CountRecentVerificationsParams{Email: addr, CreatedAt: now.Add(-verificationWindow)})
	if err != nil {
		return nil, errorResponse(ctx, err, "verification")
	}
	if recent >= maxVerificationsPerEmail {
		return nil, newError(connect.CodeResourceExhausted, "too many codes requested for this email address; try again later")
	}

	// A new key and code are generated for every request; existing verifications are never handed out.
	key := secret.Token(32)
	code := secret.Code(verificationCodeLength)
	rec, err := s.q.CreateVerification(ctx, storage.CreateVerificationParams{
		KeyHash:   secret.Hash(key),
		Email:     addr,
		CodeHash:  secret.Hash(code),
		CreatedAt: now,
		ExpiresAt: now.Add(s.rc.VerificationTTL),
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "verification")
	}

	if err := s.notifier.SendVerificationCode(ctx, s.branding(ctx), addr, code, s.rc.VerificationTTL); err != nil {
		log.Ctx(ctx).Error().Err(err).Msg("error sending verification email")
		if err := s.q.CompleteVerification(ctx, storage.CompleteVerificationParams{ID: rec.ID, CompletedAt: sql.NullTime{Time: now, Valid: true}}); err != nil {
			log.Ctx(ctx).Error().Err(err).Msg("error invalidating unsent verification")
		}
		if errors.Is(err, email.ErrDisabled) {
			return nil, newError(connect.CodeUnavailable, "email is not configured on this server")
		}
		return nil, newError(connect.CodeUnavailable, "the verification email could not be sent; try again later")
	}

	return connect.NewResponse(&lighteventv1.BeginVerificationResponse{Key: key}), nil
}

func (s *Server) CompleteVerification(ctx context.Context, req *connect.Request[lighteventv1.CompleteVerificationRequest]) (*connect.Response[lighteventv1.CompleteVerificationResponse], error) {
	if !s.verifyIPLimit.Allow("complete:" + access.ClientIP(ctx)) {
		return nil, newError(connect.CodeResourceExhausted, "too many requests; try again later")
	}
	if req.Msg.Key == "" || req.Msg.Code == "" {
		return nil, errInvalidCode
	}

	now := s.Now()
	v, err := s.q.GetVerificationByKeyHash(ctx, secret.Hash(req.Msg.Key))
	if err != nil {
		if isNoRows(err) {
			return nil, errInvalidCode
		}
		return nil, errorResponse(ctx, err, "verification")
	}
	if v.CompletedAt.Valid || !v.ExpiresAt.After(now) || v.Attempts >= maxVerificationAttempts {
		return nil, errInvalidCode
	}
	// Count the attempt before comparing so that concurrent guesses are also limited.
	if v, err = s.q.IncrementVerificationAttempts(ctx, v.ID); err != nil {
		return nil, errorResponse(ctx, err, "verification")
	}
	if v.Attempts > maxVerificationAttempts || !secret.EqualHash(v.CodeHash, secret.Hash(secret.NormalizeCode(req.Msg.Code))) {
		return nil, errInvalidCode
	}

	var (
		member storage.Member
		token  string
	)
	err = s.store.WithTx(ctx, func(q *storage.Queries) error {
		if err := q.CompleteVerification(ctx, storage.CompleteVerificationParams{ID: v.ID, CompletedAt: sql.NullTime{Time: now, Valid: true}}); err != nil {
			return err
		}
		member, err = q.GetMemberByEmail(ctx, v.Email)
		switch {
		case isNoRows(err):
			member, err = q.CreateMember(ctx, storage.CreateMemberParams{Uid: secret.UID(), Email: v.Email, Verified: 1, CreatedAt: now})
			if err != nil {
				return err
			}
		case err != nil:
			return err
		case !storage.IntToBool(member.Verified):
			if member, err = q.SetMemberVerified(ctx, storage.SetMemberVerifiedParams{ID: member.ID, UpdatedAt: sql.NullTime{Time: now, Valid: true}}); err != nil {
				return err
			}
		}
		token, _, err = access.CreateSession(ctx, q, access.SessionKindMember, member.Uid, now, s.rc.SessionMaxAge)
		return err
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "verification")
	}

	resp := connect.NewResponse(&lighteventv1.CompleteVerificationResponse{Member: translateMember(member)})
	resp.Header().Add("Set-Cookie", access.NewSessionCookie(access.SessionKindMember, token, s.rc.SessionMaxAge, s.rc.CookieSecure).String())
	return resp, nil
}

// currentMember loads the member authenticated on the request.
func (s *Server) currentMember(ctx context.Context) (storage.Member, error) {
	id := identity(ctx)
	if id.Scheme != access.SchemeMember {
		return storage.Member{}, newError(connect.CodePermissionDenied, "a member session is required")
	}
	return s.q.GetMemberByID(ctx, id.SubjectID)
}

func (s *Server) Register(ctx context.Context, req *connect.Request[lighteventv1.RegisterRequest]) (*connect.Response[lighteventv1.RegisterResponse], error) {
	member, err := s.currentMember(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}

	if req.Msg.FirstName != nil || req.Msg.LastName != nil {
		params := storage.UpdateMemberParams{
			ID: member.ID, Email: member.Email, FirstName: member.FirstName, LastName: member.LastName,
			UpdatedAt: sql.NullTime{Time: s.Now(), Valid: true},
		}
		if req.Msg.FirstName != nil {
			if params.FirstName, err = model.PersonName("first_name", *req.Msg.FirstName); err != nil {
				return nil, errorResponse(ctx, err, "member")
			}
		}
		if req.Msg.LastName != nil {
			if params.LastName, err = model.PersonName("last_name", *req.Msg.LastName); err != nil {
				return nil, errorResponse(ctx, err, "member")
			}
		}
		if member, err = s.q.UpdateMember(ctx, params); err != nil {
			return nil, errorResponse(ctx, err, "member")
		}
	}

	created, err := s.createRegistration(ctx, member, req.Msg.Registration, registrationRules{selfService: true})
	if err != nil {
		return nil, errorResponse(ctx, err, "registration")
	}
	s.notifier.RegistrationConfirmed(s.branding(ctx), notificationFor(created.member, created.event, created.date, created.reg.ConfCode))
	return connect.NewResponse(&lighteventv1.RegisterResponse{Registration: created.proto()}), nil
}

func (s *Server) ListMyRegistrations(ctx context.Context, _ *connect.Request[lighteventv1.ListMyRegistrationsRequest]) (*connect.Response[lighteventv1.ListMyRegistrationsResponse], error) {
	member, err := s.currentMember(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	regs, err := s.memberRegistrations(ctx, member)
	if err != nil {
		return nil, errorResponse(ctx, err, "registrations")
	}
	return connect.NewResponse(&lighteventv1.ListMyRegistrationsResponse{Registrations: regs}), nil
}

func (s *Server) CancelMyRegistration(ctx context.Context, req *connect.Request[lighteventv1.CancelMyRegistrationRequest]) (*connect.Response[lighteventv1.CancelMyRegistrationResponse], error) {
	member, err := s.currentMember(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	rec, err := s.q.GetActiveRegistrationByConfCode(ctx, normalizeConfCode(req.Msg.ConfCode))
	if err != nil {
		return nil, errorResponse(ctx, err, "registration")
	}
	if rec.MemberID != member.ID {
		return nil, notFound("registration")
	}
	if rec.EventDateID.Valid {
		date, err := s.q.GetEventDateByID(ctx, rec.EventDateID.Int64)
		if err != nil {
			return nil, errorResponse(ctx, err, "registration")
		}
		if !date.Value.After(s.Now()) {
			return nil, newError(connect.CodeFailedPrecondition, "registrations for past dates cannot be cancelled")
		}
	}
	if err := s.cancelRegistration(ctx, rec, true); err != nil {
		return nil, errorResponse(ctx, err, "registration")
	}
	return connect.NewResponse(&lighteventv1.CancelMyRegistrationResponse{}), nil
}

func (s *Server) EndMemberSession(ctx context.Context, _ *connect.Request[lighteventv1.EndMemberSessionRequest]) (*connect.Response[lighteventv1.EndMemberSessionResponse], error) {
	if id := identity(ctx); id.SessionID != 0 {
		if err := s.q.DeleteSession(ctx, id.SessionID); err != nil {
			return nil, errorResponse(ctx, err, "session")
		}
	}
	resp := connect.NewResponse(&lighteventv1.EndMemberSessionResponse{})
	resp.Header().Add("Set-Cookie", access.ClearSessionCookie(access.SessionKindMember, s.rc.CookieSecure).String())
	return resp, nil
}
