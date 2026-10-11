package access

import (
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"google.golang.org/protobuf/reflect/protoreflect"
)

// Allow is a set of schemes permitted to call an RPC.
type Allow uint8

const (
	AllowAnonymous Allow = 1 << iota
	AllowMember
	AllowUser
	AllowAPIKey

	allowAdmin         = AllowUser | AllowAPIKey
	allowAuthenticated = AllowMember | AllowUser | AllowAPIKey
	allowEveryone      = AllowAnonymous | allowAuthenticated
)

// Has reports whether the set permits the scheme.
func (a Allow) Has(s Scheme) bool {
	switch s {
	case SchemeAnonymous:
		return a&AllowAnonymous != 0
	case SchemeMember:
		return a&AllowMember != 0
	case SchemeUser:
		return a&AllowUser != 0
	case SchemeAPIKey:
		return a&AllowAPIKey != 0
	}
	return false
}

// Policy maps RPC method names to the schemes allowed to call them. RPCs missing from this map are denied.
var Policy = map[string]Allow{
	"Ping": allowAuthenticated,

	// Public catalog. Handlers restrict anonymous and member callers to visible events.
	"ListEvents": allowEveryone,
	"GetEvent":   allowEveryone,

	"CreateEvent":            allowAdmin,
	"UpdateEvent":            allowAdmin,
	"SetEventArchived":       allowAdmin,
	"DeleteEvent":            allowAdmin,
	"CancelEventDate":        allowAdmin,
	"ListUpcomingEventDates": allowAdmin,

	// Tags are public; the handler only counts events for administrators.
	"ListTags":  allowEveryone,
	"CreateTag": allowAdmin,
	"UpdateTag": allowAdmin,
	"DeleteTag": allowAdmin,

	"ListEventRegistrations": allowAdmin,
	// Members may only read their own registrations; enforced in the handler.
	"GetRegistration":    allowAuthenticated,
	"CreateRegistration": allowAdmin,
	"DeleteRegistration": allowAdmin,

	"CreateMember":            allowAdmin,
	"ListMembers":             allowAdmin,
	"GetMember":               allowAdmin,
	"UpdateMember":            allowAdmin,
	"DeleteMember":            allowAdmin,
	"ListMemberRegistrations": allowAdmin,

	"CreateUser":      allowAdmin,
	"UpdateUser":      allowAdmin,
	"SetUserPassword": allowAdmin,
	"ListUsers":       allowAdmin,
	"DeleteUser":      allowAdmin,

	"ListSessions":  allowAdmin,
	"RevokeSession": allowAdmin,

	"CreateAPIKey": allowAdmin,
	"ListAPIKeys":  allowAdmin,
	"DeleteAPIKey": allowAdmin,

	"GetSettings":    allowAdmin,
	"UpdateSettings": allowAdmin,

	"GetClientSettings":    allowAdmin,
	"UpdateClientSettings": allowAdmin,
	"GetClientConfig":      allowEveryone,

	"BeginVerification":    allowEveryone,
	"CompleteVerification": allowEveryone,

	"GetMyProfile":         AllowMember,
	"Register":             AllowMember,
	"ListMyRegistrations":  AllowMember,
	"CancelMyRegistration": AllowMember,
	"EndMemberSession":     AllowMember,
}

// ServiceMethods returns the method names of the LightEventService, for verifying policy coverage.
func ServiceMethods() []string {
	svc := lighteventv1.File_lightevent_v1_service_proto.Services().ByName(protoreflect.Name("LightEventService"))
	methods := svc.Methods()
	names := make([]string, 0, methods.Len())
	for i := 0; i < methods.Len(); i++ {
		names = append(names, string(methods.Get(i).Name()))
	}
	return names
}
