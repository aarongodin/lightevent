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
  ByName,
  Event,
  ListEventRegistrationsOptions,
  RegistrationList,
  ByConfCode,
  Registration,
  WriteableRegistration,
  ListMembersOptions,
  MemberList,
  WriteableUser,
  User,
  ListUsersOptions,
  UserList,
  ListSessionsOptions,
  SessionList,
  BoolSetting,
  BeginVerificationOptions,
  BeginVerificationResult,
  CompleteVerificationOptions,
  CompleteVerificationResult,
  MemberRegistration,
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

export interface SpectralClient {
  Ping(request: PingOptions): Promise<PingResult>;
  ListEvents(request: ListEventsOptions): Promise<EventList>;
  GetEvent(request: ByName): Promise<Event>;
  CreateEvent(request: Event): Promise<Event>;
  UpdateEvent(request: Event): Promise<Event>;
  ListEventRegistrations(
    request: ListEventRegistrationsOptions
  ): Promise<RegistrationList>;
  GetRegistration(request: ByConfCode): Promise<Registration>;
  CreateRegistration(request: WriteableRegistration): Promise<Registration>;
  ListMembers(request: ListMembersOptions): Promise<MemberList>;
  CreateUser(request: WriteableUser): Promise<User>;
  ListUsers(request: ListUsersOptions): Promise<UserList>;
  ListSessions(request: ListSessionsOptions): Promise<SessionList>;
  GetBoolSetting(request: ByName): Promise<BoolSetting>;
  UpdateBoolSetting(request: BoolSetting): Promise<BoolSetting>;
  BeginVerification(
    request: BeginVerificationOptions
  ): Promise<BeginVerificationResult>;
  CompleteVerification(
    request: CompleteVerificationOptions
  ): Promise<CompleteVerificationResult>;
  Register(request: MemberRegistration): Promise<Registration>;
}

export class SpectralClientJSON implements SpectralClient {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.Ping.bind(this);
    this.ListEvents.bind(this);
    this.GetEvent.bind(this);
    this.CreateEvent.bind(this);
    this.UpdateEvent.bind(this);
    this.ListEventRegistrations.bind(this);
    this.GetRegistration.bind(this);
    this.CreateRegistration.bind(this);
    this.ListMembers.bind(this);
    this.CreateUser.bind(this);
    this.ListUsers.bind(this);
    this.ListSessions.bind(this);
    this.GetBoolSetting.bind(this);
    this.UpdateBoolSetting.bind(this);
    this.BeginVerification.bind(this);
    this.CompleteVerification.bind(this);
    this.Register.bind(this);
  }
  Ping(request: PingOptions): Promise<PingResult> {
    const data = PingOptions.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "Ping",
      "application/json",
      data as object
    );
    return promise.then((data) => PingResult.fromJSON(data as any));
  }

  ListEvents(request: ListEventsOptions): Promise<EventList> {
    const data = ListEventsOptions.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "ListEvents",
      "application/json",
      data as object
    );
    return promise.then((data) => EventList.fromJSON(data as any));
  }

  GetEvent(request: ByName): Promise<Event> {
    const data = ByName.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "GetEvent",
      "application/json",
      data as object
    );
    return promise.then((data) => Event.fromJSON(data as any));
  }

  CreateEvent(request: Event): Promise<Event> {
    const data = Event.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "CreateEvent",
      "application/json",
      data as object
    );
    return promise.then((data) => Event.fromJSON(data as any));
  }

  UpdateEvent(request: Event): Promise<Event> {
    const data = Event.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "UpdateEvent",
      "application/json",
      data as object
    );
    return promise.then((data) => Event.fromJSON(data as any));
  }

  ListEventRegistrations(
    request: ListEventRegistrationsOptions
  ): Promise<RegistrationList> {
    const data = ListEventRegistrationsOptions.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "ListEventRegistrations",
      "application/json",
      data as object
    );
    return promise.then((data) => RegistrationList.fromJSON(data as any));
  }

  GetRegistration(request: ByConfCode): Promise<Registration> {
    const data = ByConfCode.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "GetRegistration",
      "application/json",
      data as object
    );
    return promise.then((data) => Registration.fromJSON(data as any));
  }

  CreateRegistration(request: WriteableRegistration): Promise<Registration> {
    const data = WriteableRegistration.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "CreateRegistration",
      "application/json",
      data as object
    );
    return promise.then((data) => Registration.fromJSON(data as any));
  }

  ListMembers(request: ListMembersOptions): Promise<MemberList> {
    const data = ListMembersOptions.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "ListMembers",
      "application/json",
      data as object
    );
    return promise.then((data) => MemberList.fromJSON(data as any));
  }

  CreateUser(request: WriteableUser): Promise<User> {
    const data = WriteableUser.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "CreateUser",
      "application/json",
      data as object
    );
    return promise.then((data) => User.fromJSON(data as any));
  }

  ListUsers(request: ListUsersOptions): Promise<UserList> {
    const data = ListUsersOptions.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "ListUsers",
      "application/json",
      data as object
    );
    return promise.then((data) => UserList.fromJSON(data as any));
  }

  ListSessions(request: ListSessionsOptions): Promise<SessionList> {
    const data = ListSessionsOptions.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "ListSessions",
      "application/json",
      data as object
    );
    return promise.then((data) => SessionList.fromJSON(data as any));
  }

  GetBoolSetting(request: ByName): Promise<BoolSetting> {
    const data = ByName.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "GetBoolSetting",
      "application/json",
      data as object
    );
    return promise.then((data) => BoolSetting.fromJSON(data as any));
  }

  UpdateBoolSetting(request: BoolSetting): Promise<BoolSetting> {
    const data = BoolSetting.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "UpdateBoolSetting",
      "application/json",
      data as object
    );
    return promise.then((data) => BoolSetting.fromJSON(data as any));
  }

  BeginVerification(
    request: BeginVerificationOptions
  ): Promise<BeginVerificationResult> {
    const data = BeginVerificationOptions.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
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
      "Spectral",
      "CompleteVerification",
      "application/json",
      data as object
    );
    return promise.then((data) =>
      CompleteVerificationResult.fromJSON(data as any)
    );
  }

  Register(request: MemberRegistration): Promise<Registration> {
    const data = MemberRegistration.toJSON(request);
    const promise = this.rpc.request(
      "Spectral",
      "Register",
      "application/json",
      data as object
    );
    return promise.then((data) => Registration.fromJSON(data as any));
  }
}

export class SpectralClientProtobuf implements SpectralClient {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.Ping.bind(this);
    this.ListEvents.bind(this);
    this.GetEvent.bind(this);
    this.CreateEvent.bind(this);
    this.UpdateEvent.bind(this);
    this.ListEventRegistrations.bind(this);
    this.GetRegistration.bind(this);
    this.CreateRegistration.bind(this);
    this.ListMembers.bind(this);
    this.CreateUser.bind(this);
    this.ListUsers.bind(this);
    this.ListSessions.bind(this);
    this.GetBoolSetting.bind(this);
    this.UpdateBoolSetting.bind(this);
    this.BeginVerification.bind(this);
    this.CompleteVerification.bind(this);
    this.Register.bind(this);
  }
  Ping(request: PingOptions): Promise<PingResult> {
    const data = PingOptions.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "Ping",
      "application/protobuf",
      data
    );
    return promise.then((data) => PingResult.decode(data as Uint8Array));
  }

  ListEvents(request: ListEventsOptions): Promise<EventList> {
    const data = ListEventsOptions.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "ListEvents",
      "application/protobuf",
      data
    );
    return promise.then((data) => EventList.decode(data as Uint8Array));
  }

  GetEvent(request: ByName): Promise<Event> {
    const data = ByName.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "GetEvent",
      "application/protobuf",
      data
    );
    return promise.then((data) => Event.decode(data as Uint8Array));
  }

  CreateEvent(request: Event): Promise<Event> {
    const data = Event.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "CreateEvent",
      "application/protobuf",
      data
    );
    return promise.then((data) => Event.decode(data as Uint8Array));
  }

  UpdateEvent(request: Event): Promise<Event> {
    const data = Event.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "UpdateEvent",
      "application/protobuf",
      data
    );
    return promise.then((data) => Event.decode(data as Uint8Array));
  }

  ListEventRegistrations(
    request: ListEventRegistrationsOptions
  ): Promise<RegistrationList> {
    const data = ListEventRegistrationsOptions.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "ListEventRegistrations",
      "application/protobuf",
      data
    );
    return promise.then((data) => RegistrationList.decode(data as Uint8Array));
  }

  GetRegistration(request: ByConfCode): Promise<Registration> {
    const data = ByConfCode.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "GetRegistration",
      "application/protobuf",
      data
    );
    return promise.then((data) => Registration.decode(data as Uint8Array));
  }

  CreateRegistration(request: WriteableRegistration): Promise<Registration> {
    const data = WriteableRegistration.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "CreateRegistration",
      "application/protobuf",
      data
    );
    return promise.then((data) => Registration.decode(data as Uint8Array));
  }

  ListMembers(request: ListMembersOptions): Promise<MemberList> {
    const data = ListMembersOptions.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "ListMembers",
      "application/protobuf",
      data
    );
    return promise.then((data) => MemberList.decode(data as Uint8Array));
  }

  CreateUser(request: WriteableUser): Promise<User> {
    const data = WriteableUser.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "CreateUser",
      "application/protobuf",
      data
    );
    return promise.then((data) => User.decode(data as Uint8Array));
  }

  ListUsers(request: ListUsersOptions): Promise<UserList> {
    const data = ListUsersOptions.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "ListUsers",
      "application/protobuf",
      data
    );
    return promise.then((data) => UserList.decode(data as Uint8Array));
  }

  ListSessions(request: ListSessionsOptions): Promise<SessionList> {
    const data = ListSessionsOptions.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "ListSessions",
      "application/protobuf",
      data
    );
    return promise.then((data) => SessionList.decode(data as Uint8Array));
  }

  GetBoolSetting(request: ByName): Promise<BoolSetting> {
    const data = ByName.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "GetBoolSetting",
      "application/protobuf",
      data
    );
    return promise.then((data) => BoolSetting.decode(data as Uint8Array));
  }

  UpdateBoolSetting(request: BoolSetting): Promise<BoolSetting> {
    const data = BoolSetting.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
      "UpdateBoolSetting",
      "application/protobuf",
      data
    );
    return promise.then((data) => BoolSetting.decode(data as Uint8Array));
  }

  BeginVerification(
    request: BeginVerificationOptions
  ): Promise<BeginVerificationResult> {
    const data = BeginVerificationOptions.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
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
      "Spectral",
      "CompleteVerification",
      "application/protobuf",
      data
    );
    return promise.then((data) =>
      CompleteVerificationResult.decode(data as Uint8Array)
    );
  }

  Register(request: MemberRegistration): Promise<Registration> {
    const data = MemberRegistration.encode(request).finish();
    const promise = this.rpc.request(
      "Spectral",
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

export interface SpectralTwirp<T extends TwirpContext = TwirpContext> {
  Ping(ctx: T, request: PingOptions): Promise<PingResult>;
  ListEvents(ctx: T, request: ListEventsOptions): Promise<EventList>;
  GetEvent(ctx: T, request: ByName): Promise<Event>;
  CreateEvent(ctx: T, request: Event): Promise<Event>;
  UpdateEvent(ctx: T, request: Event): Promise<Event>;
  ListEventRegistrations(
    ctx: T,
    request: ListEventRegistrationsOptions
  ): Promise<RegistrationList>;
  GetRegistration(ctx: T, request: ByConfCode): Promise<Registration>;
  CreateRegistration(
    ctx: T,
    request: WriteableRegistration
  ): Promise<Registration>;
  ListMembers(ctx: T, request: ListMembersOptions): Promise<MemberList>;
  CreateUser(ctx: T, request: WriteableUser): Promise<User>;
  ListUsers(ctx: T, request: ListUsersOptions): Promise<UserList>;
  ListSessions(ctx: T, request: ListSessionsOptions): Promise<SessionList>;
  GetBoolSetting(ctx: T, request: ByName): Promise<BoolSetting>;
  UpdateBoolSetting(ctx: T, request: BoolSetting): Promise<BoolSetting>;
  BeginVerification(
    ctx: T,
    request: BeginVerificationOptions
  ): Promise<BeginVerificationResult>;
  CompleteVerification(
    ctx: T,
    request: CompleteVerificationOptions
  ): Promise<CompleteVerificationResult>;
  Register(ctx: T, request: MemberRegistration): Promise<Registration>;
}

export enum SpectralMethod {
  Ping = "Ping",
  ListEvents = "ListEvents",
  GetEvent = "GetEvent",
  CreateEvent = "CreateEvent",
  UpdateEvent = "UpdateEvent",
  ListEventRegistrations = "ListEventRegistrations",
  GetRegistration = "GetRegistration",
  CreateRegistration = "CreateRegistration",
  ListMembers = "ListMembers",
  CreateUser = "CreateUser",
  ListUsers = "ListUsers",
  ListSessions = "ListSessions",
  GetBoolSetting = "GetBoolSetting",
  UpdateBoolSetting = "UpdateBoolSetting",
  BeginVerification = "BeginVerification",
  CompleteVerification = "CompleteVerification",
  Register = "Register",
}

export const SpectralMethodList = [
  SpectralMethod.Ping,
  SpectralMethod.ListEvents,
  SpectralMethod.GetEvent,
  SpectralMethod.CreateEvent,
  SpectralMethod.UpdateEvent,
  SpectralMethod.ListEventRegistrations,
  SpectralMethod.GetRegistration,
  SpectralMethod.CreateRegistration,
  SpectralMethod.ListMembers,
  SpectralMethod.CreateUser,
  SpectralMethod.ListUsers,
  SpectralMethod.ListSessions,
  SpectralMethod.GetBoolSetting,
  SpectralMethod.UpdateBoolSetting,
  SpectralMethod.BeginVerification,
  SpectralMethod.CompleteVerification,
  SpectralMethod.Register,
];

export function createSpectralServer<T extends TwirpContext = TwirpContext>(
  service: SpectralTwirp<T>
) {
  return new TwirpServer<SpectralTwirp, T>({
    service,
    packageName: "",
    serviceName: "Spectral",
    methodList: SpectralMethodList,
    matchRoute: matchSpectralRoute,
  });
}

function matchSpectralRoute<T extends TwirpContext = TwirpContext>(
  method: string,
  events: RouterEvents<T>
) {
  switch (method) {
    case "Ping":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, PingOptions, PingResult>[]
      ) => {
        ctx = { ...ctx, methodName: "Ping" };
        await events.onMatch(ctx);
        return handleSpectralPingRequest(ctx, service, data, interceptors);
      };
    case "ListEvents":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListEventsOptions, EventList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListEvents" };
        await events.onMatch(ctx);
        return handleSpectralListEventsRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "GetEvent":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ByName, Event>[]
      ) => {
        ctx = { ...ctx, methodName: "GetEvent" };
        await events.onMatch(ctx);
        return handleSpectralGetEventRequest(ctx, service, data, interceptors);
      };
    case "CreateEvent":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, Event, Event>[]
      ) => {
        ctx = { ...ctx, methodName: "CreateEvent" };
        await events.onMatch(ctx);
        return handleSpectralCreateEventRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "UpdateEvent":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, Event, Event>[]
      ) => {
        ctx = { ...ctx, methodName: "UpdateEvent" };
        await events.onMatch(ctx);
        return handleSpectralUpdateEventRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListEventRegistrations":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<
          T,
          ListEventRegistrationsOptions,
          RegistrationList
        >[]
      ) => {
        ctx = { ...ctx, methodName: "ListEventRegistrations" };
        await events.onMatch(ctx);
        return handleSpectralListEventRegistrationsRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "GetRegistration":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ByConfCode, Registration>[]
      ) => {
        ctx = { ...ctx, methodName: "GetRegistration" };
        await events.onMatch(ctx);
        return handleSpectralGetRegistrationRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CreateRegistration":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, WriteableRegistration, Registration>[]
      ) => {
        ctx = { ...ctx, methodName: "CreateRegistration" };
        await events.onMatch(ctx);
        return handleSpectralCreateRegistrationRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListMembers":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListMembersOptions, MemberList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListMembers" };
        await events.onMatch(ctx);
        return handleSpectralListMembersRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CreateUser":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, WriteableUser, User>[]
      ) => {
        ctx = { ...ctx, methodName: "CreateUser" };
        await events.onMatch(ctx);
        return handleSpectralCreateUserRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "ListUsers":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListUsersOptions, UserList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListUsers" };
        await events.onMatch(ctx);
        return handleSpectralListUsersRequest(ctx, service, data, interceptors);
      };
    case "ListSessions":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ListSessionsOptions, SessionList>[]
      ) => {
        ctx = { ...ctx, methodName: "ListSessions" };
        await events.onMatch(ctx);
        return handleSpectralListSessionsRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "GetBoolSetting":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, ByName, BoolSetting>[]
      ) => {
        ctx = { ...ctx, methodName: "GetBoolSetting" };
        await events.onMatch(ctx);
        return handleSpectralGetBoolSettingRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "UpdateBoolSetting":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, BoolSetting, BoolSetting>[]
      ) => {
        ctx = { ...ctx, methodName: "UpdateBoolSetting" };
        await events.onMatch(ctx);
        return handleSpectralUpdateBoolSettingRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "BeginVerification":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<
          T,
          BeginVerificationOptions,
          BeginVerificationResult
        >[]
      ) => {
        ctx = { ...ctx, methodName: "BeginVerification" };
        await events.onMatch(ctx);
        return handleSpectralBeginVerificationRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "CompleteVerification":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<
          T,
          CompleteVerificationOptions,
          CompleteVerificationResult
        >[]
      ) => {
        ctx = { ...ctx, methodName: "CompleteVerification" };
        await events.onMatch(ctx);
        return handleSpectralCompleteVerificationRequest(
          ctx,
          service,
          data,
          interceptors
        );
      };
    case "Register":
      return async (
        ctx: T,
        service: SpectralTwirp,
        data: Buffer,
        interceptors?: Interceptor<T, MemberRegistration, Registration>[]
      ) => {
        ctx = { ...ctx, methodName: "Register" };
        await events.onMatch(ctx);
        return handleSpectralRegisterRequest(ctx, service, data, interceptors);
      };
    default:
      events.onNotFound();
      const msg = `no handler found`;
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleSpectralPingRequest<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, PingOptions, PingResult>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralPingJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleSpectralPingProtobuf<T>(ctx, service, data, interceptors);
    default:
      const msg = "unexpected Content-Type";
      throw new TwirpError(TwirpErrorCode.BadRoute, msg);
  }
}

function handleSpectralListEventsRequest<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListEventsOptions, EventList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralListEventsJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleSpectralListEventsProtobuf<T>(
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

function handleSpectralGetEventRequest<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByName, Event>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralGetEventJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleSpectralGetEventProtobuf<T>(
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

function handleSpectralCreateEventRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, Event, Event>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralCreateEventJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleSpectralCreateEventProtobuf<T>(
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

function handleSpectralUpdateEventRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, Event, Event>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralUpdateEventJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleSpectralUpdateEventProtobuf<T>(
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

function handleSpectralListEventRegistrationsRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    ListEventRegistrationsOptions,
    RegistrationList
  >[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralListEventRegistrationsJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleSpectralListEventRegistrationsProtobuf<T>(
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

function handleSpectralGetRegistrationRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByConfCode, Registration>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralGetRegistrationJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleSpectralGetRegistrationProtobuf<T>(
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

function handleSpectralCreateRegistrationRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableRegistration, Registration>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralCreateRegistrationJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleSpectralCreateRegistrationProtobuf<T>(
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

function handleSpectralListMembersRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListMembersOptions, MemberList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralListMembersJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleSpectralListMembersProtobuf<T>(
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

function handleSpectralCreateUserRequest<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, WriteableUser, User>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralCreateUserJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleSpectralCreateUserProtobuf<T>(
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

function handleSpectralListUsersRequest<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListUsersOptions, UserList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralListUsersJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleSpectralListUsersProtobuf<T>(
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

function handleSpectralListSessionsRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ListSessionsOptions, SessionList>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralListSessionsJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleSpectralListSessionsProtobuf<T>(
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

function handleSpectralGetBoolSettingRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByName, BoolSetting>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralGetBoolSettingJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleSpectralGetBoolSettingProtobuf<T>(
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

function handleSpectralUpdateBoolSettingRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, BoolSetting, BoolSetting>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralUpdateBoolSettingJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleSpectralUpdateBoolSettingProtobuf<T>(
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

function handleSpectralBeginVerificationRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    BeginVerificationOptions,
    BeginVerificationResult
  >[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralBeginVerificationJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleSpectralBeginVerificationProtobuf<T>(
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

function handleSpectralCompleteVerificationRequest<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<
    T,
    CompleteVerificationOptions,
    CompleteVerificationResult
  >[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralCompleteVerificationJSON<T>(
        ctx,
        service,
        data,
        interceptors
      );
    case TwirpContentType.Protobuf:
      return handleSpectralCompleteVerificationProtobuf<T>(
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

function handleSpectralRegisterRequest<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, MemberRegistration, Registration>[]
): Promise<string | Uint8Array> {
  switch (ctx.contentType) {
    case TwirpContentType.JSON:
      return handleSpectralRegisterJSON<T>(ctx, service, data, interceptors);
    case TwirpContentType.Protobuf:
      return handleSpectralRegisterProtobuf<T>(
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
async function handleSpectralPingJSON<T extends TwirpContext = TwirpContext>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListEventsJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralGetEventJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralCreateEventJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralUpdateEventJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListEventRegistrationsJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralGetRegistrationJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralCreateRegistrationJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListMembersJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralCreateUserJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListUsersJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListSessionsJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralGetBoolSettingJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByName, BoolSetting>[]
) {
  let request: ByName;
  let response: BoolSetting;

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
      BoolSetting
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.GetBoolSetting(ctx, inputReq);
    });
  } else {
    response = await service.GetBoolSetting(ctx, request!);
  }

  return JSON.stringify(BoolSetting.toJSON(response) as string);
}

async function handleSpectralUpdateBoolSettingJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, BoolSetting, BoolSetting>[]
) {
  let request: BoolSetting;
  let response: BoolSetting;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = BoolSetting.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      BoolSetting,
      BoolSetting
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateBoolSetting(ctx, inputReq);
    });
  } else {
    response = await service.UpdateBoolSetting(ctx, request!);
  }

  return JSON.stringify(BoolSetting.toJSON(response) as string);
}

async function handleSpectralBeginVerificationJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralCompleteVerificationJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralRegisterJSON<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, MemberRegistration, Registration>[]
) {
  let request: MemberRegistration;
  let response: Registration;

  try {
    const body = JSON.parse(data.toString() || "{}");
    request = MemberRegistration.fromJSON(body);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the json request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      MemberRegistration,
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
async function handleSpectralPingProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListEventsProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralGetEventProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralCreateEventProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralUpdateEventProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListEventRegistrationsProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralGetRegistrationProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralCreateRegistrationProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListMembersProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralCreateUserProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListUsersProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralListSessionsProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralGetBoolSettingProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, ByName, BoolSetting>[]
) {
  let request: ByName;
  let response: BoolSetting;

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
      BoolSetting
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.GetBoolSetting(ctx, inputReq);
    });
  } else {
    response = await service.GetBoolSetting(ctx, request!);
  }

  return Buffer.from(BoolSetting.encode(response).finish());
}

async function handleSpectralUpdateBoolSettingProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, BoolSetting, BoolSetting>[]
) {
  let request: BoolSetting;
  let response: BoolSetting;

  try {
    request = BoolSetting.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      BoolSetting,
      BoolSetting
    >;
    response = await interceptor(ctx, request!, (ctx, inputReq) => {
      return service.UpdateBoolSetting(ctx, inputReq);
    });
  } else {
    response = await service.UpdateBoolSetting(ctx, request!);
  }

  return Buffer.from(BoolSetting.encode(response).finish());
}

async function handleSpectralBeginVerificationProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralCompleteVerificationProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
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

async function handleSpectralRegisterProtobuf<
  T extends TwirpContext = TwirpContext
>(
  ctx: T,
  service: SpectralTwirp,
  data: Buffer,
  interceptors?: Interceptor<T, MemberRegistration, Registration>[]
) {
  let request: MemberRegistration;
  let response: Registration;

  try {
    request = MemberRegistration.decode(data);
  } catch (e) {
    if (e instanceof Error) {
      const msg = "the protobuf request could not be decoded";
      throw new TwirpError(TwirpErrorCode.Malformed, msg).withCause(e, true);
    }
  }

  if (interceptors && interceptors.length > 0) {
    const interceptor = chainInterceptors(...interceptors) as Interceptor<
      T,
      MemberRegistration,
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
