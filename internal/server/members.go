package server

import (
	"context"
	"database/sql"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) CreateMember(ctx context.Context, req *connect.Request[lighteventv1.CreateMemberRequest]) (*connect.Response[lighteventv1.CreateMemberResponse], error) {
	email, err := model.Email("email", req.Msg.Email)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	first, err := model.PersonName("first_name", req.Msg.FirstName)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	last, err := model.PersonName("last_name", req.Msg.LastName)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	// Members created by administrators are trusted and considered verified.
	rec, err := s.q.CreateMember(ctx, storage.CreateMemberParams{
		Uid: secret.UID(), Email: email, Verified: 1, FirstName: first, LastName: last, CreatedAt: s.Now(),
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	return connect.NewResponse(&lighteventv1.CreateMemberResponse{Member: translateMember(rec)}), nil
}

func (s *Server) ListMembers(ctx context.Context, req *connect.Request[lighteventv1.ListMembersRequest]) (*connect.Response[lighteventv1.ListMembersResponse], error) {
	recs, err := s.q.ListMembers(ctx, storage.ListMembersParams{
		Search: req.Msg.Search, Limit: pageLimit(req.Msg.Limit, 50, 200), Offset: pageOffset(req.Msg.Offset),
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "members")
	}
	total, err := s.q.CountMembers(ctx, req.Msg.Search)
	if err != nil {
		return nil, errorResponse(ctx, err, "members")
	}
	members := make([]*lighteventv1.Member, 0, len(recs))
	for _, rec := range recs {
		members = append(members, translateMember(rec))
	}
	return connect.NewResponse(&lighteventv1.ListMembersResponse{Members: members, Total: int32(total)}), nil
}

func (s *Server) GetMember(ctx context.Context, req *connect.Request[lighteventv1.GetMemberRequest]) (*connect.Response[lighteventv1.GetMemberResponse], error) {
	rec, err := s.q.GetMemberByUID(ctx, req.Msg.Uid)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	return connect.NewResponse(&lighteventv1.GetMemberResponse{Member: translateMember(rec)}), nil
}

func (s *Server) UpdateMember(ctx context.Context, req *connect.Request[lighteventv1.UpdateMemberRequest]) (*connect.Response[lighteventv1.UpdateMemberResponse], error) {
	rec, err := s.q.GetMemberByUID(ctx, req.Msg.Uid)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	params := storage.UpdateMemberParams{
		ID: rec.ID, Email: rec.Email, FirstName: rec.FirstName, LastName: rec.LastName,
		UpdatedAt: sql.NullTime{Time: s.Now(), Valid: true},
	}
	if req.Msg.Email != nil {
		if params.Email, err = model.Email("email", *req.Msg.Email); err != nil {
			return nil, errorResponse(ctx, err, "member")
		}
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
	updated, err := s.q.UpdateMember(ctx, params)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	return connect.NewResponse(&lighteventv1.UpdateMemberResponse{Member: translateMember(updated)}), nil
}

func (s *Server) DeleteMember(ctx context.Context, req *connect.Request[lighteventv1.DeleteMemberRequest]) (*connect.Response[lighteventv1.DeleteMemberResponse], error) {
	err := s.store.WithTx(ctx, func(q *storage.Queries) error {
		rec, err := q.GetMemberByUID(ctx, req.Msg.Uid)
		if err != nil {
			return err
		}
		if err := q.DeleteRegistrationsByMember(ctx, rec.ID); err != nil {
			return err
		}
		if err := q.DeleteSessionsBySubject(ctx, storage.DeleteSessionsBySubjectParams{Kind: access.SessionKindMember, SubjectUid: rec.Uid}); err != nil {
			return err
		}
		if err := q.DeleteVerificationsByEmail(ctx, rec.Email); err != nil {
			return err
		}
		return q.DeleteMember(ctx, rec.ID)
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	return connect.NewResponse(&lighteventv1.DeleteMemberResponse{}), nil
}

func (s *Server) ListMemberRegistrations(ctx context.Context, req *connect.Request[lighteventv1.ListMemberRegistrationsRequest]) (*connect.Response[lighteventv1.ListMemberRegistrationsResponse], error) {
	member, err := s.q.GetMemberByUID(ctx, req.Msg.MemberUid)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	regs, err := s.memberRegistrations(ctx, member)
	if err != nil {
		return nil, errorResponse(ctx, err, "registrations")
	}
	return connect.NewResponse(&lighteventv1.ListMemberRegistrationsResponse{Registrations: regs}), nil
}

func (s *Server) memberRegistrations(ctx context.Context, member storage.Member) ([]*lighteventv1.Registration, error) {
	recs, err := s.q.ListActiveRegistrationsByMember(ctx, member.ID)
	if err != nil {
		return nil, err
	}
	loader := newRegistrationLoader(s.q)
	loader.members[member.ID] = member
	return loader.translateAll(ctx, recs)
}
