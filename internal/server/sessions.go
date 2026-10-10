package server

import (
	"context"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) ListSessions(ctx context.Context, req *connect.Request[lighteventv1.ListSessionsRequest]) (*connect.Response[lighteventv1.ListSessionsResponse], error) {
	if k := req.Msg.Kind; k != "" && k != access.SessionKindUser && k != access.SessionKindMember {
		return nil, newError(connect.CodeInvalidArgument, "kind: must be \"user\", \"member\" or empty")
	}
	recs, err := s.q.ListActiveSessions(ctx, storage.ListActiveSessionsParams{Now: s.Now(), Kind: req.Msg.Kind, SubjectUid: req.Msg.SubjectUid})
	if err != nil {
		return nil, errorResponse(ctx, err, "sessions")
	}

	current := identity(ctx).SessionID
	names := map[string]string{}
	sessions := make([]*lighteventv1.Session, 0, len(recs))
	for _, rec := range recs {
		key := rec.Kind + ":" + rec.SubjectUid
		name, ok := names[key]
		if !ok {
			name = s.subjectName(ctx, rec)
			names[key] = name
		}
		sessions = append(sessions, &lighteventv1.Session{
			Uid:         rec.Uid,
			Kind:        rec.Kind,
			SubjectUid:  rec.SubjectUid,
			SubjectName: name,
			CreatedAt:   formatTime(rec.CreatedAt),
			ExpiresAt:   formatTime(rec.ExpiresAt),
			Current:     rec.ID == current,
		})
	}
	return connect.NewResponse(&lighteventv1.ListSessionsResponse{Sessions: sessions}), nil
}

// subjectName resolves the username or member email of a session. Missing subjects yield an empty name.
func (s *Server) subjectName(ctx context.Context, rec storage.Session) string {
	if rec.Kind == access.SessionKindMember {
		if m, err := s.q.GetMemberByUID(ctx, rec.SubjectUid); err == nil {
			return m.Email
		}
		return ""
	}
	if u, err := s.q.GetUserByUID(ctx, rec.SubjectUid); err == nil {
		return u.Username
	}
	return ""
}

func (s *Server) RevokeSession(ctx context.Context, req *connect.Request[lighteventv1.RevokeSessionRequest]) (*connect.Response[lighteventv1.RevokeSessionResponse], error) {
	rec, err := s.q.GetSessionByUID(ctx, req.Msg.Uid)
	if err != nil {
		return nil, errorResponse(ctx, err, "session")
	}
	if err := s.q.DeleteSession(ctx, rec.ID); err != nil {
		return nil, errorResponse(ctx, err, "session")
	}
	return connect.NewResponse(&lighteventv1.RevokeSessionResponse{}), nil
}
