package email

var (
	TemplateMemberEmailVerification = "member_email_verification"
	TemplateMemberWelcome           = "member_welcome"
)

type TemplatedEmail struct {
	Name string
	Data map[string]any
}

func (t TemplatedEmail) Render() (string, error) {
	return "", nil
}

func EmailSubject(templateName string) string {
	switch templateName {
	case TemplateMemberEmailVerification:
		return "Login Link"
	case TemplateMemberWelcome:
		return "Welcome!"
	}
	return ""
}
