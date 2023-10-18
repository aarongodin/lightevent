package validation

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
)

func ValidateEvent(ctx context.Context, event *service.Event) error {
	if _, err := NameValidator.Validate(NewContext(ctx, "name"), event.Name); err != nil {
		return err
	}

	if _, err := TitleValidator.Validate(NewContext(ctx, "title"), event.Title); err != nil {
		return err
	}

	return nil
}
