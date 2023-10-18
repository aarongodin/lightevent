package validation

import (
	"context"
	"regexp"
	"strings"
)

type contextKey int

const (
	keyArgument contextKey = iota + 1
	keyStringInput
)

var alphaNum = regexp.MustCompile("^[a-zA-Z0-9-_]+$")

type Validator interface {
	Validate(ctx context.Context, input any) (context.Context, error)
}

type ErrValidationFailed struct {
	Argument string
	Reason   string
}

func (e ErrValidationFailed) Error() string {
	return e.Reason
}

// NewContext creates a new context.Context for carrying information about
// the validation process.
func NewContext(ctx context.Context, argument string) context.Context {
	if ctx == nil {
		ctx = context.Background()
	}
	return context.WithValue(ctx, keyArgument, argument)
}

func getArgument(ctx context.Context) string {
	v, ok := ctx.Value(keyArgument).(string)
	if !ok {
		return ""
	}
	return v
}

func getString(ctx context.Context) string {
	v, ok := ctx.Value(keyStringInput).(string)
	if !ok {
		return ""
	}
	return v
}

type String struct{}

func (v String) Validate(ctx context.Context, input any) (context.Context, error) {
	s, ok := input.(string)
	if !ok {
		return ctx, ErrValidationFailed{getArgument(ctx), "must be a string"}
	}
	return context.WithValue(ctx, keyStringInput, s), nil
}

type StringNotBlank struct{}

func (v StringNotBlank) Validate(ctx context.Context, _ any) (context.Context, error) {
	if strings.TrimSpace(getString(ctx)) == "" {
		return ctx, ErrValidationFailed{getArgument(ctx), "must not be blank"}
	}
	return ctx, nil
}

type StringAlphanumeric struct{}

func (v StringAlphanumeric) Validate(ctx context.Context, _ any) (context.Context, error) {
	if !alphaNum.MatchString(getString(ctx)) {
		return ctx, ErrValidationFailed{getArgument(ctx), "must be alphanumeric"}
	}
	return ctx, nil
}

type Waterfall []Validator

func (w Waterfall) Validate(ctx context.Context, input any) (context.Context, error) {
	var err error
	for _, v := range w {
		if ctx, err = v.Validate(ctx, input); err != nil {
			return ctx, err
		}
	}
	return ctx, nil
}

var NameValidator = Waterfall{
	String{},
	StringNotBlank{},
	StringAlphanumeric{},
}

var TitleValidator = Waterfall{
	String{},
	StringNotBlank{},
}
