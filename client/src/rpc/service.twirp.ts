import {
  TwirpContext,
  TwirpServer,
  RouterEvents,
  TwirpError,
  TwirpErrorCode,
  Interceptor,
  TwirpContentType,
  chainInterceptors,
} from "twirp-ts";
import {
  PingOptions,
  PingResult,
  ListEventsOptions,
  EventList,
  ListEventDatesOptions,
  EventDateList,
  ByName,
  Event,
  CancelEventDateOptions,
  EventDate,
  ListEventRegistrationsOptions,
  RegistrationList,
  ByConfCode,
  Registration,
  WriteableRegistration,
  DeleteRegistrationOptions,
  Result,
  WriteableMember,
  Member,
  ListMembersOptions,
  MemberList,
  GetMemberOptions,
  ListMemberRegistrationsOptions,
  MemberRegistrationList,
  WriteableUser,
  User,
  ListUsersOptions,
  UserList,
  ListSessionsOptions,
  SessionList,
  WriteableAPIKey,
  APIKeyWithSecret,
  ListSettingsOptions,
  SettingsList,
  UpdateSettingsOptions,
  BeginVerificationOptions,
  BeginVerificationResult,
  CompleteVerificationOptions,
  CompleteVerificationResult,
  RegisterOptions,
} from "./service";

//==================================//
//          Client Code             //
//==================================//

interface Rpc {
  request(
    service: string,
    method: string,
    contentType: "application/json" | "application/protobuf",
    data: object | Uint8Array
  ): Promise<object | Uint8Array>;
}

export interface LightEventClient {
  Ping(request: PingOptions): Promise<PingResult>;
  ListEvents(request: ListEventsOptions): Promise<EventList>;
  ListEventDates(request: ListEventDatesOptions): Promise<EventDateList>;
  GetEvent(request: ByName): Promise<Event>;
  CreateEvent(request: Event): Promise<Event>;
  UpdateEvent(request: Event): Promise<Event>;
  CancelEventDate(request: CancelEventDateOptions): Promise<EventDate>;
  ListEventRegistrations(
    request: ListEventRegistrationsOptions
  ): Promise<RegistrationList>;
  GetRegistration(request: ByConfCode): Promise<Registration>;
  CreateRegistration(request: WriteableRegistration): Promise<Registration>;
  DeleteRegistration(request: DeleteRegistrationOptions): Promise<Result>;
  CreateMember(request: WriteableMember): Promise<Member>;
  ListMembers(request: ListMembersOptions): Promise<MemberList>;
  GetMember(request: GetMemberOptions): Promise<Member>;
  UpdateMember(request: WriteableMember): Promise<Member>;
  ListMemberRegistrations(
    request: ListMemberRegistrationsOptions
  ): Promise<MemberRegistrationList>;
  CreateUser(request: WriteableUser): Promise<User>;
  UpdateUser(request: WriteableUser): Promise<User>;
  ListUsers(request: ListUsersOptions): Promise<UserList>;
  ListSessions(request: ListSessionsOptions): Promise<SessionList>;
  CreateAPIKey(request: WriteableAPIKey): Promise<APIKeyWithSecret>;
  ListSettings(request: ListSettingsOptions): Promise<SettingsList>;
  UpdateSettings(request: UpdateSettingsOptions): Promise<SettingsList>;
  BeginVerification(
    request: BeginVerificationOptions
  ): Promise<BeginVerificationResult>;
  CompleteVerification(
    request: CompleteVerificationOptions
  ): Promise<CompleteVerificationResult>;
  Register(request: RegisterOptions): Promise<Registration>;
}

export class LightEventClientJSON implements LightEventClient {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.Ping.bind(this);
    this.ListEvents.bind(this);
    this.ListEventDates.bind(this);
    this.GetEvent.bind(this);
    this.CreateEvent.bind(this);
    this.UpdateEvent.bind(this);
    this.CancelEventDate.bind(this);
    this.ListEventRegistrations.bind(this);
    this.GetRegistration.bind(this);
    this.CreateRegistration.bind(this);
    this.DeleteRegistration.bind(this);
    this.CreateMember.bind(this);
    this.ListMembers.bind(this);
    this.GetMember.bind(this);
    this.UpdateMember.bind(this);
    this.ListMemberRegistrations.bind(this);
    this.CreateUser.bind(this);
    this.UpdateUser.bind(this);
    this.ListUsers.bind(this);
    this.ListSessions.bind(this);
    this.CreateAPIKey.bind(this);
    this.ListSettings.bind(this);
    this.UpdateSettings.bind(this);
    this.BeginVerification.bind(this);
    this.CompleteVerification.bind(this);
    this.Register.bind(this);
  }
  Ping(request: PingOptions): Promise<PingResult> {
    const data = PingOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "Ping",
      "application/json",
      data as object
    );
    return promise.then((data) => PingResult.fromJSON(data as any));
  }

  ListEvents(request: ListEventsOptions): Promise<EventList> {
    const data = ListEventsOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "ListEvents",
      "application/json",
      data as object
    );
    return promise.then((data) => EventList.fromJSON(data as any));
  }

  ListEventDates(request: ListEventDatesOptions): Promise<EventDateList> {
    const data = ListEventDatesOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "ListEventDates",
      "application/json",
      data as object
    );
    return promise.then((data) => EventDateList.fromJSON(data as any));
  }

  GetEvent(request: ByName): Promise<Event> {
    const data = ByName.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "GetEvent",
      "application/json",
      data as object
    );
    return promise.then((data) => Event.fromJSON(data as any));
  }

  CreateEvent(request: Event): Promise<Event> {
    const data = Event.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "CreateEvent",
      "application/json",
      data as object
    );
    return promise.then((data) => Event.fromJSON(data as any));
  }

  UpdateEvent(request: Event): Promise<Event> {
    const data = Event.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "UpdateEvent",
      "application/json",
      data as object
    );
    return promise.then((data) => Event.fromJSON(data as any));
  }

  CancelEventDate(request: CancelEventDateOptions): Promise<EventDate> {
    const data = CancelEventDateOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "CancelEventDate",
      "application/json",
      data as object
    );
    return promise.then((data) => EventDate.fromJSON(data as any));
  }

  ListEventRegistrations(
    request: ListEventRegistrationsOptions
  ): Promise<RegistrationList> {
    const data = ListEventRegistrationsOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "ListEventRegistrations",
      "application/json",
      data as object
    );
    return promise.then((data) => RegistrationList.fromJSON(data as any));
  }

  GetRegistration(request: ByConfCode): Promise<Registration> {
    const data = ByConfCode.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "GetRegistration",
      "application/json",
      data as object
    );
    return promise.then((data) => Registration.fromJSON(data as any));
  }

  CreateRegistration(request: WriteableRegistration): Promise<Registration> {
    const data = WriteableRegistration.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "CreateRegistration",
      "application/json",
      data as object
    );
    return promise.then((data) => Registration.fromJSON(data as any));
  }

  DeleteRegistration(request: DeleteRegistrationOptions): Promise<Result> {
    const data = DeleteRegistrationOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "DeleteRegistration",
      "application/json",
      data as object
    );
    return promise.then((data) => Result.fromJSON(data as any));
  }

  CreateMember(request: WriteableMember): Promise<Member> {
    const data = WriteableMember.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "CreateMember",
      "application/json",
      data as object
    );
    return promise.then((data) => Member.fromJSON(data as any));
  }

  ListMembers(request: ListMembersOptions): Promise<MemberList> {
    const data = ListMembersOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "ListMembers",
      "application/json",
      data as object
    );
    return promise.then((data) => MemberList.fromJSON(data as any));
  }

  GetMember(request: GetMemberOptions): Promise<Member> {
    const data = GetMemberOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "GetMember",
      "application/json",
      data as object
    );
    return promise.then((data) => Member.fromJSON(data as any));
  }

  UpdateMember(request: WriteableMember): Promise<Member> {
    const data = WriteableMember.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "UpdateMember",
      "application/json",
      data as object
    );
    return promise.then((data) => Member.fromJSON(data as any));
  }

  ListMemberRegistrations(
    request: ListMemberRegistrationsOptions
  ): Promise<MemberRegistrationList> {
    const data = ListMemberRegistrationsOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "ListMemberRegistrations",
      "application/json",
      data as object
    );
    return promise.then((data) => MemberRegistrationList.fromJSON(data as any));
  }

  CreateUser(request: WriteableUser): Promise<User> {
    const data = WriteableUser.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "CreateUser",
      "application/json",
      data as object
    );
    return promise.then((data) => User.fromJSON(data as any));
  }

  UpdateUser(request: WriteableUser): Promise<User> {
    const data = WriteableUser.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "UpdateUser",
      "application/json",
      data as object
    );
    return promise.then((data) => User.fromJSON(data as any));
  }

  ListUsers(request: ListUsersOptions): Promise<UserList> {
    const data = ListUsersOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "ListUsers",
      "application/json",
      data as object
    );
    return promise.then((data) => UserList.fromJSON(data as any));
  }

  ListSessions(request: ListSessionsOptions): Promise<SessionList> {
    const data = ListSessionsOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "ListSessions",
      "application/json",
      data as object
    );
    return promise.then((data) => SessionList.fromJSON(data as any));
  }

  CreateAPIKey(request: WriteableAPIKey): Promise<APIKeyWithSecret> {
    const data = WriteableAPIKey.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "CreateAPIKey",
      "application/json",
      data as object
    );
    return promise.then((data) => APIKeyWithSecret.fromJSON(data as any));
  }

  ListSettings(request: ListSettingsOptions): Promise<SettingsList> {
    const data = ListSettingsOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "ListSettings",
      "application/json",
      data as object
    );
    return promise.then((data) => SettingsList.fromJSON(data as any));
  }

  UpdateSettings(request: UpdateSettingsOptions): Promise<SettingsList> {
    const data = UpdateSettingsOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "UpdateSettings",
      "application/json",
      data as object
    );
    return promise.then((data) => SettingsList.fromJSON(data as any));
  }

  BeginVerification(
    request: BeginVerificationOptions
  ): Promise<BeginVerificationResult> {
    const data = BeginVerificationOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "BeginVerification",
      "application/json",
      data as object
    );
    return promise.then((data) =>
      BeginVerificationResult.fromJSON(data as any)
    );
  }

  CompleteVerification(
    request: CompleteVerificationOptions
  ): Promise<CompleteVerificationResult> {
    const data = CompleteVerificationOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "CompleteVerification",
      "application/json",
      data as object
    );
    return promise.then((data) =>
      CompleteVerificationResult.fromJSON(data as any)
    );
  }

  Register(request: RegisterOptions): Promise<Registration> {
    const data = RegisterOptions.toJSON(request);
    const promise = this.rpc.request(
      "LightEvent",
      "Register",
      "application/json",
      data as object
    );
    return promise.then((data) => Registration.fromJSON(data as any));
  }
}

export class LightEventClientProtobuf implements LightEventClient {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.Ping.bind(this);
    this.ListEvents.bind(this);
    this.ListEventDates.bind(this);
    this.GetEvent.bind(this);
    this.CreateEvent.bind(this);
    this.UpdateEvent.bind(this);
    this.CancelEventDate.bind(this);
    this.ListEventRegistrations.bind(this);
    this.GetRegistration.bind(this);
    this.CreateRegistration.bind(this);
    this.DeleteRegistration.bind(this);
    this.CreateMember.bind(this);
    this.ListMembers.bind(this);
    this.GetMember.bind(this);
    this.UpdateMember.bind(this);
    this.ListMemberRegistrations.bind(this);
    this.CreateUser.bind(this);
    this.UpdateUser.bind(this);
    this.ListUsers.bind(this);
    this.ListSessions.bind(this);
    this.CreateAPIKey.bind(this);
    this.ListSettings.bind(this);
    this.UpdateSettings.bind(this);
    this.BeginVerification.bind(this);
    this.CompleteVerification.bind(this);
    this.Register.bind(this);
  }
  Ping(request: PingOptions): Promise<PingResult> {
    const data = PingOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "Ping",
      "application/protobuf",
      data
    );
    return promise.then((data) => PingResult.decode(data as Uint8Array));
  }

  ListEvents(request: ListEventsOptions): Promise<EventList> {
    const data = ListEventsOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "ListEvents",
      "application/protobuf",
      data
    );
    return promise.then((data) => EventList.decode(data as Uint8Array));
  }

  ListEventDates(request: ListEventDatesOptions): Promise<EventDateList> {
    const data = ListEventDatesOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "ListEventDates",
      "application/protobuf",
      data
    );
    return promise.then((data) => EventDateList.decode(data as Uint8Array));
  }

  GetEvent(request: ByName): Promise<Event> {
    const data = ByName.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "GetEvent",
      "application/protobuf",
      data
    );
    return promise.then((data) => Event.decode(data as Uint8Array));
  }

  CreateEvent(request: Event): Promise<Event> {
    const data = Event.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "CreateEvent",
      "application/protobuf",
      data
    );
    return promise.then((data) => Event.decode(data as Uint8Array));
  }

  UpdateEvent(request: Event): Promise<Event> {
    const data = Event.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "UpdateEvent",
      "application/protobuf",
      data
    );
    return promise.then((data) => Event.decode(data as Uint8Array));
  }

  CancelEventDate(request: CancelEventDateOptions): Promise<EventDate> {
    const data = CancelEventDateOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "CancelEventDate",
      "application/protobuf",
      data
    );
    return promise.then((data) => EventDate.decode(data as Uint8Array));
  }

  ListEventRegistrations(
    request: ListEventRegistrationsOptions
  ): Promise<RegistrationList> {
    const data = ListEventRegistrationsOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "ListEventRegistrations",
      "application/protobuf",
      data
    );
    return promise.then((data) => RegistrationList.decode(data as Uint8Array));
  }

  GetRegistration(request: ByConfCode): Promise<Registration> {
    const data = ByConfCode.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "GetRegistration",
      "application/protobuf",
      data
    );
    return promise.then((data) => Registration.decode(data as Uint8Array));
  }

  CreateRegistration(request: WriteableRegistration): Promise<Registration> {
    const data = WriteableRegistration.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "CreateRegistration",
      "application/protobuf",
      data
    );
    return promise.then((data) => Registration.decode(data as Uint8Array));
  }

  DeleteRegistration(request: DeleteRegistrationOptions): Promise<Result> {
    const data = DeleteRegistrationOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "DeleteRegistration",
      "application/protobuf",
      data
    );
    return promise.then((data) => Result.decode(data as Uint8Array));
  }

  CreateMember(request: WriteableMember): Promise<Member> {
    const data = WriteableMember.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "CreateMember",
      "application/protobuf",
      data
    );
    return promise.then((data) => Member.decode(data as Uint8Array));
  }

  ListMembers(request: ListMembersOptions): Promise<MemberList> {
    const data = ListMembersOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "ListMembers",
      "application/protobuf",
      data
    );
    return promise.then((data) => MemberList.decode(data as Uint8Array));
  }

  GetMember(request: GetMemberOptions): Promise<Member> {
    const data = GetMemberOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "GetMember",
      "application/protobuf",
      data
    );
    return promise.then((data) => Member.decode(data as Uint8Array));
  }

  UpdateMember(request: WriteableMember): Promise<Member> {
    const data = WriteableMember.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "UpdateMember",
      "application/protobuf",
      data
    );
    return promise.then((data) => Member.decode(data as Uint8Array));
  }

  ListMemberRegistrations(
    request: ListMemberRegistrationsOptions
  ): Promise<MemberRegistrationList> {
    const data = ListMemberRegistrationsOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "ListMemberRegistrations",
      "application/protobuf",
      data
    );
    return promise.then((data) =>
      MemberRegistrationList.decode(data as Uint8Array)
    );
  }

  CreateUser(request: WriteableUser): Promise<User> {
    const data = WriteableUser.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "CreateUser",
      "application/protobuf",
      data
    );
    return promise.then((data) => User.decode(data as Uint8Array));
  }

  UpdateUser(request: WriteableUser): Promise<User> {
    const data = WriteableUser.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "UpdateUser",
      "application/protobuf",
      data
    );
    return promise.then((data) => User.decode(data as Uint8Array));
  }

  ListUsers(request: ListUsersOptions): Promise<UserList> {
    const data = ListUsersOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "ListUsers",
      "application/protobuf",
      data
    );
    return promise.then((data) => UserList.decode(data as Uint8Array));
  }

  ListSessions(request: ListSessionsOptions): Promise<SessionList> {
    const data = ListSessionsOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "ListSessions",
      "application/protobuf",
      data
    );
    return promise.then((data) => SessionList.decode(data as Uint8Array));
  }

  CreateAPIKey(request: WriteableAPIKey): Promise<APIKeyWithSecret> {
    const data = WriteableAPIKey.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "CreateAPIKey",
      "application/protobuf",
      data
    );
    return promise.then((data) => APIKeyWithSecret.decode(data as Uint8Array));
  }

  ListSettings(request: ListSettingsOptions): Promise<SettingsList> {
    const data = ListSettingsOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "ListSettings",
      "application/protobuf",
      data
    );
    return promise.then((data) => SettingsList.decode(data as Uint8Array));
  }

  UpdateSettings(request: UpdateSettingsOptions): Promise<SettingsList> {
    const data = UpdateSettingsOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "UpdateSettings",
      "application/protobuf",
      data
    );
    return promise.then((data) => SettingsList.decode(data as Uint8Array));
  }

  BeginVerification(
    request: BeginVerificationOptions
  ): Promise<BeginVerificationResult> {
    const data = BeginVerificationOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "BeginVerification",
      "application/protobuf",
      data
    );
    return promise.then((data) =>
      BeginVerificationResult.decode(data as Uint8Array)
    );
  }

  CompleteVerification(
    request: CompleteVerificationOptions
  ): Promise<CompleteVerificationResult> {
    const data = CompleteVerificationOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "CompleteVerification",
      "application/protobuf",
      data
    );
    return promise.then((data) =>
      CompleteVerificationResult.decode(data as Uint8Array)
    );
  }

  Register(request: RegisterOptions): Promise<Registration> {
    const data = RegisterOptions.encode(request).finish();
    const promise = this.rpc.request(
      "LightEvent",
      "Register",
      "application/protobuf",
      data
    );
    return promise.then((data) => Registration.decode(data as Uint8Array));
  }
}

//==================================//
//          Server Code             //
//==================================//

export interface LightEventTwirp<T extends TwirpContext = TwirpContext> {
  Ping(ctx: T, request: PingOptions): Promise<PingResult>;
  ListEvents(ctx: T, request: ListEventsOptions): Promise<EventList>;
  ListEventDates(
    ctx: T,
    request: ListEventDatesOptions
  ): Promise<EventDateList>;
  GetEvent(ctx: T, request: ByName): Promise<Event>;
  CreateEvent(ctx: T, request: Event): Promise<Event>;
  UpdateEvent(ctx: T, request: Event): Promise<Event>;
  CancelEventDate(ctx: T, request: CancelEventDateOptions): Promise<EventDate>;
  ListEventRegistrations(
    ctx: T,
    request: ListEventRegistrationsOptions
  ): Promise<RegistrationList>;
  GetRegistration(ctx: T, request: ByConfCode): Promise<Registration>;
  CreateRegistration(
    ctx: T,
    request: WriteableRegistration
  ): Promise<Registration>;
  DeleteRegistration(
    ctx: T,
    request: DeleteRegistrationOptions
  ): Promise<Result>;
  CreateMember(ctx: T, request: WriteableMember): Promise<Member>;
  ListMembers(ctx: T, request: ListMembersOptions): Promise<MemberList>;
  GetMember(ctx: T, request: GetMemberOptions): Promise<Member>;
  UpdateMember(ctx: T, request: WriteableMember): Promise<Member>;
  ListMemberRegistrations(
    ctx: T,
    request: ListMemberRegistrationsOptions
  ): Promise<MemberRegistrationList>;
  CreateUser(ctx: T, request: WriteableUser): Promise<User>;
  UpdateUser(ctx: T, request: WriteableUser): Promise<User>;
  ListUsers(ctx: T, request: ListUsersOptions): Promise<UserList>;
  ListSessions(ctx: T, request: ListSessionsOptions): Promise<SessionList>;
  CreateAPIKey(ctx: T, request: WriteableAPIKey): Promise<APIKeyWithSecret>;
  ListSettings(ctx: T, request: ListSettingsOptions): Promise<SettingsList>;
  UpdateSettings(ctx: T, request: UpdateSettingsOptions): Promise<SettingsList>;
  BeginVerification(
    ctx: T,
    request: BeginVerificationOptions
  ): Promise<BeginVerificationResult>;
  CompleteVerification(
    ctx: T,
    request: CompleteVerificationOptions
  ): Promise<CompleteVerificationResult>;
  Register(ctx: T, request: RegisterOptions): Promise<Registration>;
}

export enum LightEventMethod {
  Ping = "Ping",
  ListEvents = "ListEvents",
  ListEventDates = "ListEventDates",
  GetEvent = "GetEvent",
  CreateEvent = "CreateEvent",
  UpdateEvent = "UpdateEvent",
  CancelEventDate = "CancelEventDate",
  ListEventRegistrations = "ListEventRegistrations",
  GetRegistration = "GetRegistration",
  CreateRegistration = "CreateRegistration",
  DeleteRegistration = "DeleteRegistration",
  CreateMember = "CreateMember",
  ListMembers = "ListMembers",
  GetMember = "GetMember",
  UpdateMember = "UpdateMember",
  ListMemberRegistrations = "ListMemberRegistrations",
  CreateUser = "CreateUser",
  UpdateUser = "UpdateUser",
  ListUsers = "ListUsers",
  ListSessions = "ListSessions",
  CreateAPIKey = "CreateAPIKey",
  ListSettings = "ListSettings",
  UpdateSettings = "UpdateSettings",
  BeginVerification = "BeginVerification",
  CompleteVerification = "CompleteVerification",
  Register = "Register",
}

export const LightEventMethodList = [
  LightEventMethod.Ping,
  LightEventMethod.ListEvents,
  LightEventMethod.ListEventDates,
  LightEventMethod.GetEvent,
  LightEventMethod.CreateEvent,
  LightEventMethod.UpdateEvent,
  LightEventMethod.CancelEventDate,
  LightEventMethod.ListEventRegistrations,
  LightEventMethod.GetRegistration,
  LightEventMethod.CreateRegistration,
  LightEventMethod.DeleteRegistration,
  LightEventMethod.CreateMember,
  LightEventMethod.ListMembers,
  LightEventMethod.GetMember,
  LightEventMethod.UpdateMember,
  LightEventMethod.ListMemberRegistrations,
  LightEventMethod.CreateUser,
  LightEventMethod.UpdateUser,
  LightEventMethod.ListUsers,
  LightEventMethod.ListSessions,
  LightEventMethod.CreateAPIKey,
  LightEventMethod.ListSettings,
  LightEventMethod.UpdateSettings,
  LightEventMethod.BeginVerification,
  LightEventMethod.CompleteVerification,
  LightEventMethod.Register,
];

export function createLightEventServer<T extends TwirpContext = TwirpContext>(
  service: LightEventTwirp<T>
) {
  return new TwirpServer<LightEventTwirp, T>({
    service,
    packageName: "",
    serviceName: "LightEvent",
    methodList: LightEventMethodList,
    matchRoute: matchLightEventRoute,
  });
}

function matchLightEventRoute<T extends TwirpContext = TwirpContext>(
  method: string,
  events: RouterEvents<T>
) {
  switch (method) {
    case "Ping":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, PingOptions, PingResult>[]
      ) => {
        ctx = { ...ctx, methodName: "Ping" };
        await events.onMatch(ctx);
        return handleLightEventPingRequest(ctx, service, data, interceptors);
      };
    case "ListEvents":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListEventsOptions, EventList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListEvents" };
        await events.onMatch(ctx);
        return handleLightEventListEventsRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListEventDates":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListEventDatesOptions, EventDateList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListEventDates" };
        await events.onMatch(ctx);
        return handleLightEventListEventDatesRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "GetEvent":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ByName, Event>[]
      ) => {
        ctx = { ...ctx, methodName: "GetEvent" };
        await events.onMatch(ctx);
        return handleLightEventGetEventRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CreateEvent":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, Event, Event>[]
      ) => {
        ctx = { ...ctx, methodName: "CreateEvent" };
        await events.onMatch(ctx);
        return handleLightEventCreateEventRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "UpdateEvent":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, Event, Event>[]
      ) => {
        ctx = { ...ctx, methodName: "UpdateEvent" };
        await events.onMatch(ctx);
        return handleLightEventUpdateEventRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CancelEventDate":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, CancelEventDateOptions, EventDate>[]
      ) => {
        ctx = { ...ctx, methodName: "CancelEventDate" };
        await events.onMatch(ctx);
        return handleLightEventCancelEventDateRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListEventRegistrations":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<
          T,
          ListEventRegistrationsOptions,
          RegistrationList
        >[]
      ) => {
        ctx = { ...ctx, methodName: "ListEventRegistrations" };
        await events.onMatch(ctx);
        return handleLightEventListEventRegistrationsRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "GetRegistration":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ByConfCode, Registration>[]
      ) => {
        ctx = { ...ctx, methodName: "GetRegistration" };
        await events.onMatch(ctx);
        return handleLightEventGetRegistrationRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CreateRegistration":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, WriteableRegistration, Registration>[]
      ) => {
        ctx = { ...ctx, methodName: "CreateRegistration" };
        await events.onMatch(ctx);
        return handleLightEventCreateRegistrationRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "DeleteRegistration":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, DeleteRegistrationOptions, Result>[]
      ) => {
        ctx = { ...ctx, methodName: "DeleteRegistration" };
        await events.onMatch(ctx);
        return handleLightEventDeleteRegistrationRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CreateMember":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, WriteableMember, Member>[]
      ) => {
        ctx = { ...ctx, methodName: "CreateMember" };
        await events.onMatch(ctx);
        return handleLightEventCreateMemberRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListMembers":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListMembersOptions, MemberList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListMembers" };
        await events.onMatch(ctx);
        return handleLightEventListMembersRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "GetMember":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, GetMemberOptions, Member>[]
      ) => {
        ctx = { ...ctx, methodName: "GetMember" };
        await events.onMatch(ctx);
        return handleLightEventGetMemberRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "UpdateMember":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, WriteableMember, Member>[]
      ) => {
        ctx = { ...ctx, methodName: "UpdateMember" };
        await events.onMatch(ctx);
        return handleLightEventUpdateMemberRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListMemberRegistrations":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<
          T,
          ListMemberRegistrationsOptions,
          MemberRegistrationList
        >[]
      ) => {
        ctx = { ...ctx, methodName: "ListMemberRegistrations" };
        await events.onMatch(ctx);
        return handleLightEventListMemberRegistrationsRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CreateUser":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, WriteableUser, User>[]
      ) => {
        ctx = { ...ctx, methodName: "CreateUser" };
        await events.onMatch(ctx);
        return handleLightEventCreateUserRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "UpdateUser":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, WriteableUser, User>[]
      ) => {
        ctx = { ...ctx, methodName: "UpdateUser" };
        await events.onMatch(ctx);
        return handleLightEventUpdateUserRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListUsers":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListUsersOptions, UserList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListUsers" };
        await events.onMatch(ctx);
        return handleLightEventListUsersRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListSessions":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListSessionsOptions, SessionList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListSessions" };
        await events.onMatch(ctx);
        return handleLightEventListSessionsRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CreateAPIKey":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, WriteableAPIKey, APIKeyWithSecret>[]
      ) => {
        ctx = { ...ctx, methodName: "CreateAPIKey" };
        await events.onMatch(ctx);
        return handleLightEventCreateAPIKeyRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListSettings":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListSettingsOptions, SettingsList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListSettings" };
        await events.onMatch(ctx);
        return handleLightEventListSettingsRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "UpdateSettings":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, UpdateSettingsOptions, SettingsList>[]
      ) => {
        ctx = { ...ctx, methodName: "UpdateSettings" };
        await events.onMatch(ctx);
        return handleLightEventUpdateSettingsRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "BeginVerification":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<
          T,
          BeginVerificationOptions,
          BeginVerificationResult
        >[]
      ) => {
        ctx = { ...ctx, methodName: "BeginVerification" };
        await events.onMatch(ctx);
        return handleLightEventBeginVerificationRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CompleteVerification":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<
          T,
          CompleteVerificationOptions,
          CompleteVerificationResult
        >[]
      ) => {
        ctx = { ...ctx, methodName: "CompleteVerification" };
        await events.onMatch(ctx);
        return handleLightEventCompleteVerificationRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "Register":
      return async (
        ctx: T,
        service: LightEventTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, RegisterOptions, Registration>[]
      ) => {
        ctx = { ...ctx, methodName: "Register" };
        await events.onMatch(ctx);
        return handleLightEventRegisterRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    default:
      events.onNotFound();
      const msg = `no handler found`;
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventPingRequest<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, PingOptions, PingResult>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventPingJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleLightEventPingProtobuf<T>(ctx, service, data, interceptors);
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventListEventsRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListEventsOptions, EventList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventListEventsJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventListEventsProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventListEventDatesRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListEventDatesOptions, EventDateList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventListEventDatesJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventListEventDatesProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventGetEventRequest<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByName, Event>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventGetEventJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleLightEventGetEventProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventCreateEventRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, Event, Event>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventCreateEventJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventCreateEventProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventUpdateEventRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, Event, Event>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventUpdateEventJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventUpdateEventProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventCancelEventDateRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, CancelEventDateOptions, EventDate>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventCancelEventDateJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventCancelEventDateProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventListEventRegistrationsRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    ListEventRegistrationsOptions,
    RegistrationList
  >[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventListEventRegistrationsJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventListEventRegistrationsProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventGetRegistrationRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByConfCode, Registration>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventGetRegistrationJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventGetRegistrationProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventCreateRegistrationRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableRegistration, Registration>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventCreateRegistrationJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventCreateRegistrationProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventDeleteRegistrationRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, DeleteRegistrationOptions, Result>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventDeleteRegistrationJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventDeleteRegistrationProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventCreateMemberRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableMember, Member>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventCreateMemberJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventCreateMemberProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventListMembersRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListMembersOptions, MemberList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventListMembersJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventListMembersProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventGetMemberRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, GetMemberOptions, Member>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventGetMemberJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleLightEventGetMemberProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventUpdateMemberRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableMember, Member>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventUpdateMemberJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventUpdateMemberProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventListMemberRegistrationsRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    ListMemberRegistrationsOptions,
    MemberRegistrationList
  >[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventListMemberRegistrationsJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventListMemberRegistrationsProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventCreateUserRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableUser, User>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventCreateUserJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventCreateUserProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventUpdateUserRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableUser, User>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventUpdateUserJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventUpdateUserProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventListUsersRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListUsersOptions, UserList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventListUsersJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleLightEventListUsersProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventListSessionsRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListSessionsOptions, SessionList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventListSessionsJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventListSessionsProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventCreateAPIKeyRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableAPIKey, APIKeyWithSecret>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventCreateAPIKeyJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventCreateAPIKeyProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventListSettingsRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListSettingsOptions, SettingsList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventListSettingsJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventListSettingsProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventUpdateSettingsRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, UpdateSettingsOptions, SettingsList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventUpdateSettingsJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventUpdateSettingsProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventBeginVerificationRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    BeginVerificationOptions,
    BeginVerificationResult
  >[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventBeginVerificationJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventBeginVerificationProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventCompleteVerificationRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    CompleteVerificationOptions,
    CompleteVerificationResult
  >[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventCompleteVerificationJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleLightEventCompleteVerificationProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleLightEventRegisterRequest<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, RegisterOptions, Registration>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleLightEventRegisterJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleLightEventRegisterProtobuf<T>(
        ctx,
        service,
        data,
        interceptors
      );
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}
async function handleLightEventPingJSON<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, PingOptions, PingResult>[]
) {
  let request: PingOptions;
  let response: PingResult;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = PingOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      PingOptions,
      PingResult
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.Ping(ctx, inputReq);
    });
  } else {
    response = await service.Ping(ctx, request!);
  }

  return JSON.stringify(PingResult.toJSON(response) as string);
}

async function handleLightEventListEventsJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListEventsOptions, EventList>[]
) {
  let request: ListEventsOptions;
  let response: EventList;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ListEventsOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListEventsOptions,
      EventList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListEvents(ctx, inputReq);
    });
  } else {
    response = await service.ListEvents(ctx, request!);
  }

  return JSON.stringify(EventList.toJSON(response) as string);
}

async function handleLightEventListEventDatesJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListEventDatesOptions, EventDateList>[]
) {
  let request: ListEventDatesOptions;
  let response: EventDateList;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ListEventDatesOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListEventDatesOptions,
      EventDateList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListEventDates(ctx, inputReq);
    });
  } else {
    response = await service.ListEventDates(ctx, request!);
  }

  return JSON.stringify(EventDateList.toJSON(response) as string);
}

async function handleLightEventGetEventJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByName, Event>[]
) {
  let request: ByName;
  let response: Event;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ByName.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ByName,
      Event
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.GetEvent(ctx, inputReq);
    });
  } else {
    response = await service.GetEvent(ctx, request!);
  }

  return JSON.stringify(Event.toJSON(response) as string);
}

async function handleLightEventCreateEventJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, Event, Event>[]
) {
  let request: Event;
  let response: Event;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = Event.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      Event,
      Event
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateEvent(ctx, inputReq);
    });
  } else {
    response = await service.CreateEvent(ctx, request!);
  }

  return JSON.stringify(Event.toJSON(response) as string);
}

async function handleLightEventUpdateEventJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, Event, Event>[]
) {
  let request: Event;
  let response: Event;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = Event.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      Event,
      Event
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateEvent(ctx, inputReq);
    });
  } else {
    response = await service.UpdateEvent(ctx, request!);
  }

  return JSON.stringify(Event.toJSON(response) as string);
}

async function handleLightEventCancelEventDateJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, CancelEventDateOptions, EventDate>[]
) {
  let request: CancelEventDateOptions;
  let response: EventDate;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = CancelEventDateOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      CancelEventDateOptions,
      EventDate
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CancelEventDate(ctx, inputReq);
    });
  } else {
    response = await service.CancelEventDate(ctx, request!);
  }

  return JSON.stringify(EventDate.toJSON(response) as string);
}

async function handleLightEventListEventRegistrationsJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    ListEventRegistrationsOptions,
    RegistrationList
  >[]
) {
  let request: ListEventRegistrationsOptions;
  let response: RegistrationList;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ListEventRegistrationsOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListEventRegistrationsOptions,
      RegistrationList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListEventRegistrations(ctx, inputReq);
    });
  } else {
    response = await service.ListEventRegistrations(ctx, request!);
  }

  return JSON.stringify(RegistrationList.toJSON(response) as string);
}

async function handleLightEventGetRegistrationJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByConfCode, Registration>[]
) {
  let request: ByConfCode;
  let response: Registration;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ByConfCode.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ByConfCode,
      Registration
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.GetRegistration(ctx, inputReq);
    });
  } else {
    response = await service.GetRegistration(ctx, request!);
  }

  return JSON.stringify(Registration.toJSON(response) as string);
}

async function handleLightEventCreateRegistrationJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableRegistration, Registration>[]
) {
  let request: WriteableRegistration;
  let response: Registration;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = WriteableRegistration.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableRegistration,
      Registration
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateRegistration(ctx, inputReq);
    });
  } else {
    response = await service.CreateRegistration(ctx, request!);
  }

  return JSON.stringify(Registration.toJSON(response) as string);
}

async function handleLightEventDeleteRegistrationJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, DeleteRegistrationOptions, Result>[]
) {
  let request: DeleteRegistrationOptions;
  let response: Result;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = DeleteRegistrationOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      DeleteRegistrationOptions,
      Result
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.DeleteRegistration(ctx, inputReq);
    });
  } else {
    response = await service.DeleteRegistration(ctx, request!);
  }

  return JSON.stringify(Result.toJSON(response) as string);
}

async function handleLightEventCreateMemberJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableMember, Member>[]
) {
  let request: WriteableMember;
  let response: Member;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = WriteableMember.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableMember,
      Member
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateMember(ctx, inputReq);
    });
  } else {
    response = await service.CreateMember(ctx, request!);
  }

  return JSON.stringify(Member.toJSON(response) as string);
}

async function handleLightEventListMembersJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListMembersOptions, MemberList>[]
) {
  let request: ListMembersOptions;
  let response: MemberList;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ListMembersOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListMembersOptions,
      MemberList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListMembers(ctx, inputReq);
    });
  } else {
    response = await service.ListMembers(ctx, request!);
  }

  return JSON.stringify(MemberList.toJSON(response) as string);
}

async function handleLightEventGetMemberJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, GetMemberOptions, Member>[]
) {
  let request: GetMemberOptions;
  let response: Member;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = GetMemberOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      GetMemberOptions,
      Member
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.GetMember(ctx, inputReq);
    });
  } else {
    response = await service.GetMember(ctx, request!);
  }

  return JSON.stringify(Member.toJSON(response) as string);
}

async function handleLightEventUpdateMemberJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableMember, Member>[]
) {
  let request: WriteableMember;
  let response: Member;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = WriteableMember.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableMember,
      Member
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateMember(ctx, inputReq);
    });
  } else {
    response = await service.UpdateMember(ctx, request!);
  }

  return JSON.stringify(Member.toJSON(response) as string);
}

async function handleLightEventListMemberRegistrationsJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    ListMemberRegistrationsOptions,
    MemberRegistrationList
  >[]
) {
  let request: ListMemberRegistrationsOptions;
  let response: MemberRegistrationList;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ListMemberRegistrationsOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListMemberRegistrationsOptions,
      MemberRegistrationList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListMemberRegistrations(ctx, inputReq);
    });
  } else {
    response = await service.ListMemberRegistrations(ctx, request!);
  }

  return JSON.stringify(MemberRegistrationList.toJSON(response) as string);
}

async function handleLightEventCreateUserJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableUser, User>[]
) {
  let request: WriteableUser;
  let response: User;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = WriteableUser.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableUser,
      User
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateUser(ctx, inputReq);
    });
  } else {
    response = await service.CreateUser(ctx, request!);
  }

  return JSON.stringify(User.toJSON(response) as string);
}

async function handleLightEventUpdateUserJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableUser, User>[]
) {
  let request: WriteableUser;
  let response: User;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = WriteableUser.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableUser,
      User
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateUser(ctx, inputReq);
    });
  } else {
    response = await service.UpdateUser(ctx, request!);
  }

  return JSON.stringify(User.toJSON(response) as string);
}

async function handleLightEventListUsersJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListUsersOptions, UserList>[]
) {
  let request: ListUsersOptions;
  let response: UserList;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ListUsersOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListUsersOptions,
      UserList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListUsers(ctx, inputReq);
    });
  } else {
    response = await service.ListUsers(ctx, request!);
  }

  return JSON.stringify(UserList.toJSON(response) as string);
}

async function handleLightEventListSessionsJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListSessionsOptions, SessionList>[]
) {
  let request: ListSessionsOptions;
  let response: SessionList;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ListSessionsOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListSessionsOptions,
      SessionList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListSessions(ctx, inputReq);
    });
  } else {
    response = await service.ListSessions(ctx, request!);
  }

  return JSON.stringify(SessionList.toJSON(response) as string);
}

async function handleLightEventCreateAPIKeyJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableAPIKey, APIKeyWithSecret>[]
) {
  let request: WriteableAPIKey;
  let response: APIKeyWithSecret;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = WriteableAPIKey.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableAPIKey,
      APIKeyWithSecret
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateAPIKey(ctx, inputReq);
    });
  } else {
    response = await service.CreateAPIKey(ctx, request!);
  }

  return JSON.stringify(APIKeyWithSecret.toJSON(response) as string);
}

async function handleLightEventListSettingsJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListSettingsOptions, SettingsList>[]
) {
  let request: ListSettingsOptions;
  let response: SettingsList;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = ListSettingsOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListSettingsOptions,
      SettingsList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListSettings(ctx, inputReq);
    });
  } else {
    response = await service.ListSettings(ctx, request!);
  }

  return JSON.stringify(SettingsList.toJSON(response) as string);
}

async function handleLightEventUpdateSettingsJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, UpdateSettingsOptions, SettingsList>[]
) {
  let request: UpdateSettingsOptions;
  let response: SettingsList;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = UpdateSettingsOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      UpdateSettingsOptions,
      SettingsList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateSettings(ctx, inputReq);
    });
  } else {
    response = await service.UpdateSettings(ctx, request!);
  }

  return JSON.stringify(SettingsList.toJSON(response) as string);
}

async function handleLightEventBeginVerificationJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    BeginVerificationOptions,
    BeginVerificationResult
  >[]
) {
  let request: BeginVerificationOptions;
  let response: BeginVerificationResult;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = BeginVerificationOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      BeginVerificationOptions,
      BeginVerificationResult
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.BeginVerification(ctx, inputReq);
    });
  } else {
    response = await service.BeginVerification(ctx, request!);
  }

  return JSON.stringify(BeginVerificationResult.toJSON(response) as string);
}

async function handleLightEventCompleteVerificationJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    CompleteVerificationOptions,
    CompleteVerificationResult
  >[]
) {
  let request: CompleteVerificationOptions;
  let response: CompleteVerificationResult;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = CompleteVerificationOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      CompleteVerificationOptions,
      CompleteVerificationResult
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CompleteVerification(ctx, inputReq);
    });
  } else {
    response = await service.CompleteVerification(ctx, request!);
  }

  return JSON.stringify(CompleteVerificationResult.toJSON(response) as string);
}

async function handleLightEventRegisterJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, RegisterOptions, Registration>[]
) {
  let request: RegisterOptions;
  let response: Registration;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = RegisterOptions.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      RegisterOptions,
      Registration
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.Register(ctx, inputReq);
    });
  } else {
    response = await service.Register(ctx, request!);
  }

  return JSON.stringify(Registration.toJSON(response) as string);
}
async function handleLightEventPingProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, PingOptions, PingResult>[]
) {
  let request: PingOptions;
  let response: PingResult;

  try {
    request = PingOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      PingOptions,
      PingResult
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.Ping(ctx, inputReq);
    });
  } else {
    response = await service.Ping(ctx, request!);
  }

  return Buffer.from(PingResult.encode(response).finish());
}

async function handleLightEventListEventsProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListEventsOptions, EventList>[]
) {
  let request: ListEventsOptions;
  let response: EventList;

  try {
    request = ListEventsOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListEventsOptions,
      EventList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListEvents(ctx, inputReq);
    });
  } else {
    response = await service.ListEvents(ctx, request!);
  }

  return Buffer.from(EventList.encode(response).finish());
}

async function handleLightEventListEventDatesProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListEventDatesOptions, EventDateList>[]
) {
  let request: ListEventDatesOptions;
  let response: EventDateList;

  try {
    request = ListEventDatesOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListEventDatesOptions,
      EventDateList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListEventDates(ctx, inputReq);
    });
  } else {
    response = await service.ListEventDates(ctx, request!);
  }

  return Buffer.from(EventDateList.encode(response).finish());
}

async function handleLightEventGetEventProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByName, Event>[]
) {
  let request: ByName;
  let response: Event;

  try {
    request = ByName.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ByName,
      Event
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.GetEvent(ctx, inputReq);
    });
  } else {
    response = await service.GetEvent(ctx, request!);
  }

  return Buffer.from(Event.encode(response).finish());
}

async function handleLightEventCreateEventProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, Event, Event>[]
) {
  let request: Event;
  let response: Event;

  try {
    request = Event.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      Event,
      Event
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateEvent(ctx, inputReq);
    });
  } else {
    response = await service.CreateEvent(ctx, request!);
  }

  return Buffer.from(Event.encode(response).finish());
}

async function handleLightEventUpdateEventProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, Event, Event>[]
) {
  let request: Event;
  let response: Event;

  try {
    request = Event.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      Event,
      Event
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateEvent(ctx, inputReq);
    });
  } else {
    response = await service.UpdateEvent(ctx, request!);
  }

  return Buffer.from(Event.encode(response).finish());
}

async function handleLightEventCancelEventDateProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, CancelEventDateOptions, EventDate>[]
) {
  let request: CancelEventDateOptions;
  let response: EventDate;

  try {
    request = CancelEventDateOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      CancelEventDateOptions,
      EventDate
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CancelEventDate(ctx, inputReq);
    });
  } else {
    response = await service.CancelEventDate(ctx, request!);
  }

  return Buffer.from(EventDate.encode(response).finish());
}

async function handleLightEventListEventRegistrationsProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    ListEventRegistrationsOptions,
    RegistrationList
  >[]
) {
  let request: ListEventRegistrationsOptions;
  let response: RegistrationList;

  try {
    request = ListEventRegistrationsOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListEventRegistrationsOptions,
      RegistrationList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListEventRegistrations(ctx, inputReq);
    });
  } else {
    response = await service.ListEventRegistrations(ctx, request!);
  }

  return Buffer.from(RegistrationList.encode(response).finish());
}

async function handleLightEventGetRegistrationProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByConfCode, Registration>[]
) {
  let request: ByConfCode;
  let response: Registration;

  try {
    request = ByConfCode.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ByConfCode,
      Registration
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.GetRegistration(ctx, inputReq);
    });
  } else {
    response = await service.GetRegistration(ctx, request!);
  }

  return Buffer.from(Registration.encode(response).finish());
}

async function handleLightEventCreateRegistrationProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableRegistration, Registration>[]
) {
  let request: WriteableRegistration;
  let response: Registration;

  try {
    request = WriteableRegistration.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableRegistration,
      Registration
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateRegistration(ctx, inputReq);
    });
  } else {
    response = await service.CreateRegistration(ctx, request!);
  }

  return Buffer.from(Registration.encode(response).finish());
}

async function handleLightEventDeleteRegistrationProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, DeleteRegistrationOptions, Result>[]
) {
  let request: DeleteRegistrationOptions;
  let response: Result;

  try {
    request = DeleteRegistrationOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      DeleteRegistrationOptions,
      Result
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.DeleteRegistration(ctx, inputReq);
    });
  } else {
    response = await service.DeleteRegistration(ctx, request!);
  }

  return Buffer.from(Result.encode(response).finish());
}

async function handleLightEventCreateMemberProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableMember, Member>[]
) {
  let request: WriteableMember;
  let response: Member;

  try {
    request = WriteableMember.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableMember,
      Member
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateMember(ctx, inputReq);
    });
  } else {
    response = await service.CreateMember(ctx, request!);
  }

  return Buffer.from(Member.encode(response).finish());
}

async function handleLightEventListMembersProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListMembersOptions, MemberList>[]
) {
  let request: ListMembersOptions;
  let response: MemberList;

  try {
    request = ListMembersOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListMembersOptions,
      MemberList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListMembers(ctx, inputReq);
    });
  } else {
    response = await service.ListMembers(ctx, request!);
  }

  return Buffer.from(MemberList.encode(response).finish());
}

async function handleLightEventGetMemberProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, GetMemberOptions, Member>[]
) {
  let request: GetMemberOptions;
  let response: Member;

  try {
    request = GetMemberOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      GetMemberOptions,
      Member
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.GetMember(ctx, inputReq);
    });
  } else {
    response = await service.GetMember(ctx, request!);
  }

  return Buffer.from(Member.encode(response).finish());
}

async function handleLightEventUpdateMemberProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableMember, Member>[]
) {
  let request: WriteableMember;
  let response: Member;

  try {
    request = WriteableMember.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableMember,
      Member
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateMember(ctx, inputReq);
    });
  } else {
    response = await service.UpdateMember(ctx, request!);
  }

  return Buffer.from(Member.encode(response).finish());
}

async function handleLightEventListMemberRegistrationsProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    ListMemberRegistrationsOptions,
    MemberRegistrationList
  >[]
) {
  let request: ListMemberRegistrationsOptions;
  let response: MemberRegistrationList;

  try {
    request = ListMemberRegistrationsOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListMemberRegistrationsOptions,
      MemberRegistrationList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListMemberRegistrations(ctx, inputReq);
    });
  } else {
    response = await service.ListMemberRegistrations(ctx, request!);
  }

  return Buffer.from(MemberRegistrationList.encode(response).finish());
}

async function handleLightEventCreateUserProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableUser, User>[]
) {
  let request: WriteableUser;
  let response: User;

  try {
    request = WriteableUser.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableUser,
      User
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateUser(ctx, inputReq);
    });
  } else {
    response = await service.CreateUser(ctx, request!);
  }

  return Buffer.from(User.encode(response).finish());
}

async function handleLightEventUpdateUserProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableUser, User>[]
) {
  let request: WriteableUser;
  let response: User;

  try {
    request = WriteableUser.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableUser,
      User
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateUser(ctx, inputReq);
    });
  } else {
    response = await service.UpdateUser(ctx, request!);
  }

  return Buffer.from(User.encode(response).finish());
}

async function handleLightEventListUsersProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListUsersOptions, UserList>[]
) {
  let request: ListUsersOptions;
  let response: UserList;

  try {
    request = ListUsersOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListUsersOptions,
      UserList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListUsers(ctx, inputReq);
    });
  } else {
    response = await service.ListUsers(ctx, request!);
  }

  return Buffer.from(UserList.encode(response).finish());
}

async function handleLightEventListSessionsProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListSessionsOptions, SessionList>[]
) {
  let request: ListSessionsOptions;
  let response: SessionList;

  try {
    request = ListSessionsOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListSessionsOptions,
      SessionList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListSessions(ctx, inputReq);
    });
  } else {
    response = await service.ListSessions(ctx, request!);
  }

  return Buffer.from(SessionList.encode(response).finish());
}

async function handleLightEventCreateAPIKeyProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableAPIKey, APIKeyWithSecret>[]
) {
  let request: WriteableAPIKey;
  let response: APIKeyWithSecret;

  try {
    request = WriteableAPIKey.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      WriteableAPIKey,
      APIKeyWithSecret
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CreateAPIKey(ctx, inputReq);
    });
  } else {
    response = await service.CreateAPIKey(ctx, request!);
  }

  return Buffer.from(APIKeyWithSecret.encode(response).finish());
}

async function handleLightEventListSettingsProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListSettingsOptions, SettingsList>[]
) {
  let request: ListSettingsOptions;
  let response: SettingsList;

  try {
    request = ListSettingsOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      ListSettingsOptions,
      SettingsList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.ListSettings(ctx, inputReq);
    });
  } else {
    response = await service.ListSettings(ctx, request!);
  }

  return Buffer.from(SettingsList.encode(response).finish());
}

async function handleLightEventUpdateSettingsProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, UpdateSettingsOptions, SettingsList>[]
) {
  let request: UpdateSettingsOptions;
  let response: SettingsList;

  try {
    request = UpdateSettingsOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      UpdateSettingsOptions,
      SettingsList
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateSettings(ctx, inputReq);
    });
  } else {
    response = await service.UpdateSettings(ctx, request!);
  }

  return Buffer.from(SettingsList.encode(response).finish());
}

async function handleLightEventBeginVerificationProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    BeginVerificationOptions,
    BeginVerificationResult
  >[]
) {
  let request: BeginVerificationOptions;
  let response: BeginVerificationResult;

  try {
    request = BeginVerificationOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      BeginVerificationOptions,
      BeginVerificationResult
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.BeginVerification(ctx, inputReq);
    });
  } else {
    response = await service.BeginVerification(ctx, request!);
  }

  return Buffer.from(BeginVerificationResult.encode(response).finish());
}

async function handleLightEventCompleteVerificationProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    CompleteVerificationOptions,
    CompleteVerificationResult
  >[]
) {
  let request: CompleteVerificationOptions;
  let response: CompleteVerificationResult;

  try {
    request = CompleteVerificationOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      CompleteVerificationOptions,
      CompleteVerificationResult
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.CompleteVerification(ctx, inputReq);
    });
  } else {
    response = await service.CompleteVerification(ctx, request!);
  }

  return Buffer.from(CompleteVerificationResult.encode(response).finish());
}

async function handleLightEventRegisterProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: LightEventTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, RegisterOptions, Registration>[]
) {
  let request: RegisterOptions;
  let response: Registration;

  try {
    request = RegisterOptions.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      RegisterOptions,
      Registration
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.Register(ctx, inputReq);
    });
  } else {
    response = await service.Register(ctx, request!);
  }

  return Buffer.from(Registration.encode(response).finish());
}
