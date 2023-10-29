package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) DeleteRegistration(ctx context.Context, message *service.DeleteRegistrationOptions) (*service.Result, error) {
	if err := s.queries.DeleteRegistrationByConfCode(ctx, message.ConfCode); err != nil {
		return nil, errorResponse(err, "registration")
	}

	return &service.Result{
		Message: "Registration deleted",
	}, nil
}
