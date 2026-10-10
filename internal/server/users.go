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

func (s *Server) CreateUser(ctx context.Context, req *connect.Request[lighteventv1.CreateUserRequest]) (*connect.Response[lighteventv1.CreateUserResponse], error) {
	params := storage.CreateUserParams{Uid: secret.UID(), CreatedAt: s.Now()}
	var err error
	if params.Username, err = model.Username("username", req.Msg.Username); err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	password, err := model.Password("password", req.Msg.Password)
	if err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	if params.FirstName, err = model.PersonName("first_name", req.Msg.FirstName); err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	if params.LastName, err = model.PersonName("last_name", req.Msg.LastName); err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	if params.Email, err = model.OptionalEmail("email", req.Msg.Email); err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	if params.PasswordHash, err = access.HashPassword(password); err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	rec, err := s.q.CreateUser(ctx, params)
	if err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	return connect.NewResponse(&lighteventv1.CreateUserResponse{User: translateUser(rec)}), nil
}

func (s *Server) UpdateUser(ctx context.Context, req *connect.Request[lighteventv1.UpdateUserRequest]) (*connect.Response[lighteventv1.UpdateUserResponse], error) {
	rec, err := s.q.GetUserByUID(ctx, req.Msg.Uid)
	if err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	params := storage.UpdateUserParams{
		ID: rec.ID, Username: rec.Username, FirstName: rec.FirstName, LastName: rec.LastName, Email: rec.Email,
		UpdatedAt: sql.NullTime{Time: s.Now(), Valid: true},
	}
	if req.Msg.Username != nil {
		if params.Username, err = model.Username("username", *req.Msg.Username); err != nil {
			return nil, errorResponse(ctx, err, "user")
		}
	}
	if req.Msg.FirstName != nil {
		if params.FirstName, err = model.PersonName("first_name", *req.Msg.FirstName); err != nil {
			return nil, errorResponse(ctx, err, "user")
		}
	}
	if req.Msg.LastName != nil {
		if params.LastName, err = model.PersonName("last_name", *req.Msg.LastName); err != nil {
			return nil, errorResponse(ctx, err, "user")
		}
	}
	if req.Msg.Email != nil {
		if params.Email, err = model.OptionalEmail("email", *req.Msg.Email); err != nil {
			return nil, errorResponse(ctx, err, "user")
		}
	}
	updated, err := s.q.UpdateUser(ctx, params)
	if err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	return connect.NewResponse(&lighteventv1.UpdateUserResponse{User: translateUser(updated)}), nil
}

func (s *Server) SetUserPassword(ctx context.Context, req *connect.Request[lighteventv1.SetUserPasswordRequest]) (*connect.Response[lighteventv1.SetUserPasswordResponse], error) {
	rec, err := s.q.GetUserByUID(ctx, req.Msg.Uid)
	if err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	password, err := model.Password("password", req.Msg.Password)
	if err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	id := identity(ctx)
	self := id.Scheme == access.SchemeUser && id.SubjectID == rec.ID
	if self && !access.CheckPassword(rec.PasswordHash, req.Msg.CurrentPassword) {
		return nil, newError(connect.CodeInvalidArgument, "current_password: is incorrect")
	}
	hash, err := access.HashPassword(password)
	if err != nil {
		return nil, errorResponse(ctx, err, "user")
	}

	err = s.store.WithTx(ctx, func(q *storage.Queries) error {
		if err := q.SetUserPasswordHash(ctx, storage.SetUserPasswordHashParams{
			ID: rec.ID, PasswordHash: hash, UpdatedAt: sql.NullTime{Time: s.Now(), Valid: true},
		}); err != nil {
			return err
		}
		// Sign the user out everywhere else; keep the session that made the change.
		if self {
			return q.DeleteOtherSessionsBySubject(ctx, storage.DeleteOtherSessionsBySubjectParams{
				Kind: access.SessionKindUser, SubjectUid: rec.Uid, ID: id.SessionID,
			})
		}
		return q.DeleteSessionsBySubject(ctx, storage.DeleteSessionsBySubjectParams{Kind: access.SessionKindUser, SubjectUid: rec.Uid})
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	return connect.NewResponse(&lighteventv1.SetUserPasswordResponse{}), nil
}

func (s *Server) ListUsers(ctx context.Context, _ *connect.Request[lighteventv1.ListUsersRequest]) (*connect.Response[lighteventv1.ListUsersResponse], error) {
	recs, err := s.q.ListUsers(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "users")
	}
	users := make([]*lighteventv1.User, 0, len(recs))
	for _, rec := range recs {
		users = append(users, translateUser(rec))
	}
	return connect.NewResponse(&lighteventv1.ListUsersResponse{Users: users}), nil
}

func (s *Server) DeleteUser(ctx context.Context, req *connect.Request[lighteventv1.DeleteUserRequest]) (*connect.Response[lighteventv1.DeleteUserResponse], error) {
	id := identity(ctx)
	err := s.store.WithTx(ctx, func(q *storage.Queries) error {
		rec, err := q.GetUserByUID(ctx, req.Msg.Uid)
		if err != nil {
			return err
		}
		if id.Scheme == access.SchemeUser && id.SubjectID == rec.ID {
			return newError(connect.CodeFailedPrecondition, "you cannot delete your own user")
		}
		count, err := q.CountUsers(ctx)
		if err != nil {
			return err
		}
		if count <= 1 {
			return newError(connect.CodeFailedPrecondition, "the last user cannot be deleted")
		}
		if err := q.DeleteSessionsBySubject(ctx, storage.DeleteSessionsBySubjectParams{Kind: access.SessionKindUser, SubjectUid: rec.Uid}); err != nil {
			return err
		}
		return q.DeleteUser(ctx, rec.ID)
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "user")
	}
	return connect.NewResponse(&lighteventv1.DeleteUserResponse{}), nil
}
