package access

import (
	"context"
	"errors"
	"path"

	"connectrpc.com/connect"
)

// Interceptor authenticates and authorizes every RPC according to Policy.
type Interceptor struct {
	auth   *Authenticator
	policy map[string]Allow
}

// NewInterceptor returns an interceptor enforcing the given policy.
func NewInterceptor(auth *Authenticator, policy map[string]Allow) *Interceptor {
	return &Interceptor{auth: auth, policy: policy}
}

func (i *Interceptor) WrapUnary(next connect.UnaryFunc) connect.UnaryFunc {
	return func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
		method := path.Base(req.Spec().Procedure)
		allow, ok := i.policy[method]
		if !ok {
			return nil, connect.NewError(connect.CodePermissionDenied, errors.New("access to this procedure is not configured"))
		}
		id, err := i.auth.Authenticate(ctx, req.Header(), allow)
		if err != nil {
			return nil, err
		}
		return next(WithIdentity(ctx, id), req)
	}
}

func (i *Interceptor) WrapStreamingClient(next connect.StreamingClientFunc) connect.StreamingClientFunc {
	return next
}

// WrapStreamingHandler rejects streaming calls; the service does not define any.
func (i *Interceptor) WrapStreamingHandler(connect.StreamingHandlerFunc) connect.StreamingHandlerFunc {
	return func(context.Context, connect.StreamingHandlerConn) error {
		return connect.NewError(connect.CodeUnimplemented, errors.New("streaming is not supported"))
	}
}
