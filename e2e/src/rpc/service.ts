/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export enum RegistrationKind {
  REG_ONCE = 0,
  REG_SERIES = 1,
  UNRECOGNIZED = -1,
}

export function registrationKindFromJSON(object: any): RegistrationKind {
  switch (object) {
    case 0:
    case "REG_ONCE":
      return RegistrationKind.REG_ONCE;
    case 1:
    case "REG_SERIES":
      return RegistrationKind.REG_SERIES;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RegistrationKind.UNRECOGNIZED;
  }
}

export function registrationKindToJSON(object: RegistrationKind): string {
  switch (object) {
    case RegistrationKind.REG_ONCE:
      return "REG_ONCE";
    case RegistrationKind.REG_SERIES:
      return "REG_SERIES";
    case RegistrationKind.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface PingOptions {
}

export interface PingResult {
  sub: string;
}

export interface ListEventsOptions {
  hidden: boolean;
  closed: boolean;
}

export interface ByName {
  name: string;
}

export interface ByConfCode {
  confCode: string;
}

export interface EventList {
  events: Event[];
}

export interface Event {
  name: string;
  title: string;
  hidden: boolean;
  closed: boolean;
  dates: EventDate[];
}

export interface EventDate {
  id: string;
  value: string;
  cancelled: boolean;
}

export interface ListEventRegistrationsOptions {
  eventName: string;
}

export interface RegistrationList {
  registrations: Registration[];
}

export interface Registration {
  confCode: string;
  kind: RegistrationKind;
  eventName: string;
  eventDate: string;
  member: Member | undefined;
}

export interface WriteableRegistration {
  kind: RegistrationKind;
  eventName: string;
  eventDate?: string | undefined;
  memberEmail: string;
}

export interface MemberRegistration {
  kind: RegistrationKind;
  eventName: string;
  eventDate: string;
  memberFirstName: string;
  memberLastName: string;
}

export interface ListSettingsOptions {
}

export interface BoolSetting {
  name: string;
  value: boolean;
}

export interface ListSessionsOptions {
}

export interface SessionList {
  sessions: Session[];
}

export interface Session {
  key: string;
  subject: string;
  kind: string;
  createdAt: string;
}

export interface User {
  username: string;
  name: string;
}

export interface WriteableUser {
  username: string;
  password: string;
  name: string;
}

export interface ListUsersOptions {
}

export interface UserList {
  users: User[];
}

export interface WriteableAPIKey {
  name: string;
}

export interface APIKeyWithSecret {
  name: string;
  secret: string;
  createdAt: string;
}

export interface BeginVerificationOptions {
  email: string;
}

export interface BeginVerificationResult {
  key: string;
}

export interface CompleteVerificationOptions {
  email: string;
  key: string;
  challenge: string;
}

export interface CompleteVerificationResult {
}

export interface ListMembersOptions {
  email: string;
}

export interface MemberList {
  members: Member[];
}

export interface Member {
  email: string;
  firstName: string;
  lastName: string;
  verified: boolean;
  createdAt: string;
}

export interface WriteableMember {
  email: string;
  firstName: string;
  lastName: string;
}

export interface GetMemberOptions {
  email: string;
}

function createBasePingOptions(): PingOptions {
  return {};
}

export const PingOptions = {
  encode(_: PingOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PingOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePingOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): PingOptions {
    return {};
  },

  toJSON(_: PingOptions): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<PingOptions>, I>>(base?: I): PingOptions {
    return PingOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PingOptions>, I>>(_: I): PingOptions {
    const message = createBasePingOptions();
    return message;
  },
};

function createBasePingResult(): PingResult {
  return { sub: "" };
}

export const PingResult = {
  encode(message: PingResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sub !== "") {
      writer.uint32(10).string(message.sub);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PingResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePingResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sub = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PingResult {
    return { sub: isSet(object.sub) ? String(object.sub) : "" };
  },

  toJSON(message: PingResult): unknown {
    const obj: any = {};
    message.sub !== undefined && (obj.sub = message.sub);
    return obj;
  },

  create<I extends Exact<DeepPartial<PingResult>, I>>(base?: I): PingResult {
    return PingResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PingResult>, I>>(object: I): PingResult {
    const message = createBasePingResult();
    message.sub = object.sub ?? "";
    return message;
  },
};

function createBaseListEventsOptions(): ListEventsOptions {
  return { hidden: false, closed: false };
}

export const ListEventsOptions = {
  encode(message: ListEventsOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.hidden === true) {
      writer.uint32(8).bool(message.hidden);
    }
    if (message.closed === true) {
      writer.uint32(16).bool(message.closed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListEventsOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListEventsOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hidden = reader.bool();
          break;
        case 2:
          message.closed = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListEventsOptions {
    return {
      hidden: isSet(object.hidden) ? Boolean(object.hidden) : false,
      closed: isSet(object.closed) ? Boolean(object.closed) : false,
    };
  },

  toJSON(message: ListEventsOptions): unknown {
    const obj: any = {};
    message.hidden !== undefined && (obj.hidden = message.hidden);
    message.closed !== undefined && (obj.closed = message.closed);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListEventsOptions>, I>>(base?: I): ListEventsOptions {
    return ListEventsOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListEventsOptions>, I>>(object: I): ListEventsOptions {
    const message = createBaseListEventsOptions();
    message.hidden = object.hidden ?? false;
    message.closed = object.closed ?? false;
    return message;
  },
};

function createBaseByName(): ByName {
  return { name: "" };
}

export const ByName = {
  encode(message: ByName, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ByName {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseByName();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ByName {
    return { name: isSet(object.name) ? String(object.name) : "" };
  },

  toJSON(message: ByName): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  create<I extends Exact<DeepPartial<ByName>, I>>(base?: I): ByName {
    return ByName.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ByName>, I>>(object: I): ByName {
    const message = createBaseByName();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseByConfCode(): ByConfCode {
  return { confCode: "" };
}

export const ByConfCode = {
  encode(message: ByConfCode, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.confCode !== "") {
      writer.uint32(10).string(message.confCode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ByConfCode {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseByConfCode();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.confCode = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ByConfCode {
    return { confCode: isSet(object.confCode) ? String(object.confCode) : "" };
  },

  toJSON(message: ByConfCode): unknown {
    const obj: any = {};
    message.confCode !== undefined && (obj.confCode = message.confCode);
    return obj;
  },

  create<I extends Exact<DeepPartial<ByConfCode>, I>>(base?: I): ByConfCode {
    return ByConfCode.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ByConfCode>, I>>(object: I): ByConfCode {
    const message = createBaseByConfCode();
    message.confCode = object.confCode ?? "";
    return message;
  },
};

function createBaseEventList(): EventList {
  return { events: [] };
}

export const EventList = {
  encode(message: EventList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.events) {
      Event.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.events.push(Event.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventList {
    return { events: Array.isArray(object?.events) ? object.events.map((e: any) => Event.fromJSON(e)) : [] };
  },

  toJSON(message: EventList): unknown {
    const obj: any = {};
    if (message.events) {
      obj.events = message.events.map((e) => e ? Event.toJSON(e) : undefined);
    } else {
      obj.events = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<EventList>, I>>(base?: I): EventList {
    return EventList.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventList>, I>>(object: I): EventList {
    const message = createBaseEventList();
    message.events = object.events?.map((e) => Event.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEvent(): Event {
  return { name: "", title: "", hidden: false, closed: false, dates: [] };
}

export const Event = {
  encode(message: Event, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.hidden === true) {
      writer.uint32(24).bool(message.hidden);
    }
    if (message.closed === true) {
      writer.uint32(32).bool(message.closed);
    }
    for (const v of message.dates) {
      EventDate.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Event {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.title = reader.string();
          break;
        case 3:
          message.hidden = reader.bool();
          break;
        case 4:
          message.closed = reader.bool();
          break;
        case 5:
          message.dates.push(EventDate.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Event {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      title: isSet(object.title) ? String(object.title) : "",
      hidden: isSet(object.hidden) ? Boolean(object.hidden) : false,
      closed: isSet(object.closed) ? Boolean(object.closed) : false,
      dates: Array.isArray(object?.dates) ? object.dates.map((e: any) => EventDate.fromJSON(e)) : [],
    };
  },

  toJSON(message: Event): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.title !== undefined && (obj.title = message.title);
    message.hidden !== undefined && (obj.hidden = message.hidden);
    message.closed !== undefined && (obj.closed = message.closed);
    if (message.dates) {
      obj.dates = message.dates.map((e) => e ? EventDate.toJSON(e) : undefined);
    } else {
      obj.dates = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Event>, I>>(base?: I): Event {
    return Event.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Event>, I>>(object: I): Event {
    const message = createBaseEvent();
    message.name = object.name ?? "";
    message.title = object.title ?? "";
    message.hidden = object.hidden ?? false;
    message.closed = object.closed ?? false;
    message.dates = object.dates?.map((e) => EventDate.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEventDate(): EventDate {
  return { id: "", value: "", cancelled: false };
}

export const EventDate = {
  encode(message: EventDate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    if (message.cancelled === true) {
      writer.uint32(24).bool(message.cancelled);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventDate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventDate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        case 3:
          message.cancelled = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EventDate {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      value: isSet(object.value) ? String(object.value) : "",
      cancelled: isSet(object.cancelled) ? Boolean(object.cancelled) : false,
    };
  },

  toJSON(message: EventDate): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.value !== undefined && (obj.value = message.value);
    message.cancelled !== undefined && (obj.cancelled = message.cancelled);
    return obj;
  },

  create<I extends Exact<DeepPartial<EventDate>, I>>(base?: I): EventDate {
    return EventDate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EventDate>, I>>(object: I): EventDate {
    const message = createBaseEventDate();
    message.id = object.id ?? "";
    message.value = object.value ?? "";
    message.cancelled = object.cancelled ?? false;
    return message;
  },
};

function createBaseListEventRegistrationsOptions(): ListEventRegistrationsOptions {
  return { eventName: "" };
}

export const ListEventRegistrationsOptions = {
  encode(message: ListEventRegistrationsOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.eventName !== "") {
      writer.uint32(10).string(message.eventName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListEventRegistrationsOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListEventRegistrationsOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.eventName = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListEventRegistrationsOptions {
    return { eventName: isSet(object.eventName) ? String(object.eventName) : "" };
  },

  toJSON(message: ListEventRegistrationsOptions): unknown {
    const obj: any = {};
    message.eventName !== undefined && (obj.eventName = message.eventName);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListEventRegistrationsOptions>, I>>(base?: I): ListEventRegistrationsOptions {
    return ListEventRegistrationsOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListEventRegistrationsOptions>, I>>(
    object: I,
  ): ListEventRegistrationsOptions {
    const message = createBaseListEventRegistrationsOptions();
    message.eventName = object.eventName ?? "";
    return message;
  },
};

function createBaseRegistrationList(): RegistrationList {
  return { registrations: [] };
}

export const RegistrationList = {
  encode(message: RegistrationList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.registrations) {
      Registration.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegistrationList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegistrationList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.registrations.push(Registration.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RegistrationList {
    return {
      registrations: Array.isArray(object?.registrations)
        ? object.registrations.map((e: any) => Registration.fromJSON(e))
        : [],
    };
  },

  toJSON(message: RegistrationList): unknown {
    const obj: any = {};
    if (message.registrations) {
      obj.registrations = message.registrations.map((e) => e ? Registration.toJSON(e) : undefined);
    } else {
      obj.registrations = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<RegistrationList>, I>>(base?: I): RegistrationList {
    return RegistrationList.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<RegistrationList>, I>>(object: I): RegistrationList {
    const message = createBaseRegistrationList();
    message.registrations = object.registrations?.map((e) => Registration.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRegistration(): Registration {
  return { confCode: "", kind: 0, eventName: "", eventDate: "", member: undefined };
}

export const Registration = {
  encode(message: Registration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.confCode !== "") {
      writer.uint32(10).string(message.confCode);
    }
    if (message.kind !== 0) {
      writer.uint32(16).int32(message.kind);
    }
    if (message.eventName !== "") {
      writer.uint32(26).string(message.eventName);
    }
    if (message.eventDate !== "") {
      writer.uint32(34).string(message.eventDate);
    }
    if (message.member !== undefined) {
      Member.encode(message.member, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Registration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegistration();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.confCode = reader.string();
          break;
        case 2:
          message.kind = reader.int32() as any;
          break;
        case 3:
          message.eventName = reader.string();
          break;
        case 4:
          message.eventDate = reader.string();
          break;
        case 5:
          message.member = Member.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Registration {
    return {
      confCode: isSet(object.confCode) ? String(object.confCode) : "",
      kind: isSet(object.kind) ? registrationKindFromJSON(object.kind) : 0,
      eventName: isSet(object.eventName) ? String(object.eventName) : "",
      eventDate: isSet(object.eventDate) ? String(object.eventDate) : "",
      member: isSet(object.member) ? Member.fromJSON(object.member) : undefined,
    };
  },

  toJSON(message: Registration): unknown {
    const obj: any = {};
    message.confCode !== undefined && (obj.confCode = message.confCode);
    message.kind !== undefined && (obj.kind = registrationKindToJSON(message.kind));
    message.eventName !== undefined && (obj.eventName = message.eventName);
    message.eventDate !== undefined && (obj.eventDate = message.eventDate);
    message.member !== undefined && (obj.member = message.member ? Member.toJSON(message.member) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Registration>, I>>(base?: I): Registration {
    return Registration.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Registration>, I>>(object: I): Registration {
    const message = createBaseRegistration();
    message.confCode = object.confCode ?? "";
    message.kind = object.kind ?? 0;
    message.eventName = object.eventName ?? "";
    message.eventDate = object.eventDate ?? "";
    message.member = (object.member !== undefined && object.member !== null)
      ? Member.fromPartial(object.member)
      : undefined;
    return message;
  },
};

function createBaseWriteableRegistration(): WriteableRegistration {
  return { kind: 0, eventName: "", eventDate: undefined, memberEmail: "" };
}

export const WriteableRegistration = {
  encode(message: WriteableRegistration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.kind !== 0) {
      writer.uint32(8).int32(message.kind);
    }
    if (message.eventName !== "") {
      writer.uint32(18).string(message.eventName);
    }
    if (message.eventDate !== undefined) {
      writer.uint32(26).string(message.eventDate);
    }
    if (message.memberEmail !== "") {
      writer.uint32(34).string(message.memberEmail);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WriteableRegistration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWriteableRegistration();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.kind = reader.int32() as any;
          break;
        case 2:
          message.eventName = reader.string();
          break;
        case 3:
          message.eventDate = reader.string();
          break;
        case 4:
          message.memberEmail = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WriteableRegistration {
    return {
      kind: isSet(object.kind) ? registrationKindFromJSON(object.kind) : 0,
      eventName: isSet(object.eventName) ? String(object.eventName) : "",
      eventDate: isSet(object.eventDate) ? String(object.eventDate) : undefined,
      memberEmail: isSet(object.memberEmail) ? String(object.memberEmail) : "",
    };
  },

  toJSON(message: WriteableRegistration): unknown {
    const obj: any = {};
    message.kind !== undefined && (obj.kind = registrationKindToJSON(message.kind));
    message.eventName !== undefined && (obj.eventName = message.eventName);
    message.eventDate !== undefined && (obj.eventDate = message.eventDate);
    message.memberEmail !== undefined && (obj.memberEmail = message.memberEmail);
    return obj;
  },

  create<I extends Exact<DeepPartial<WriteableRegistration>, I>>(base?: I): WriteableRegistration {
    return WriteableRegistration.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<WriteableRegistration>, I>>(object: I): WriteableRegistration {
    const message = createBaseWriteableRegistration();
    message.kind = object.kind ?? 0;
    message.eventName = object.eventName ?? "";
    message.eventDate = object.eventDate ?? undefined;
    message.memberEmail = object.memberEmail ?? "";
    return message;
  },
};

function createBaseMemberRegistration(): MemberRegistration {
  return { kind: 0, eventName: "", eventDate: "", memberFirstName: "", memberLastName: "" };
}

export const MemberRegistration = {
  encode(message: MemberRegistration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.kind !== 0) {
      writer.uint32(8).int32(message.kind);
    }
    if (message.eventName !== "") {
      writer.uint32(18).string(message.eventName);
    }
    if (message.eventDate !== "") {
      writer.uint32(26).string(message.eventDate);
    }
    if (message.memberFirstName !== "") {
      writer.uint32(34).string(message.memberFirstName);
    }
    if (message.memberLastName !== "") {
      writer.uint32(42).string(message.memberLastName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MemberRegistration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMemberRegistration();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.kind = reader.int32() as any;
          break;
        case 2:
          message.eventName = reader.string();
          break;
        case 3:
          message.eventDate = reader.string();
          break;
        case 4:
          message.memberFirstName = reader.string();
          break;
        case 5:
          message.memberLastName = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MemberRegistration {
    return {
      kind: isSet(object.kind) ? registrationKindFromJSON(object.kind) : 0,
      eventName: isSet(object.eventName) ? String(object.eventName) : "",
      eventDate: isSet(object.eventDate) ? String(object.eventDate) : "",
      memberFirstName: isSet(object.memberFirstName) ? String(object.memberFirstName) : "",
      memberLastName: isSet(object.memberLastName) ? String(object.memberLastName) : "",
    };
  },

  toJSON(message: MemberRegistration): unknown {
    const obj: any = {};
    message.kind !== undefined && (obj.kind = registrationKindToJSON(message.kind));
    message.eventName !== undefined && (obj.eventName = message.eventName);
    message.eventDate !== undefined && (obj.eventDate = message.eventDate);
    message.memberFirstName !== undefined && (obj.memberFirstName = message.memberFirstName);
    message.memberLastName !== undefined && (obj.memberLastName = message.memberLastName);
    return obj;
  },

  create<I extends Exact<DeepPartial<MemberRegistration>, I>>(base?: I): MemberRegistration {
    return MemberRegistration.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MemberRegistration>, I>>(object: I): MemberRegistration {
    const message = createBaseMemberRegistration();
    message.kind = object.kind ?? 0;
    message.eventName = object.eventName ?? "";
    message.eventDate = object.eventDate ?? "";
    message.memberFirstName = object.memberFirstName ?? "";
    message.memberLastName = object.memberLastName ?? "";
    return message;
  },
};

function createBaseListSettingsOptions(): ListSettingsOptions {
  return {};
}

export const ListSettingsOptions = {
  encode(_: ListSettingsOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListSettingsOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListSettingsOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): ListSettingsOptions {
    return {};
  },

  toJSON(_: ListSettingsOptions): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<ListSettingsOptions>, I>>(base?: I): ListSettingsOptions {
    return ListSettingsOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListSettingsOptions>, I>>(_: I): ListSettingsOptions {
    const message = createBaseListSettingsOptions();
    return message;
  },
};

function createBaseBoolSetting(): BoolSetting {
  return { name: "", value: false };
}

export const BoolSetting = {
  encode(message: BoolSetting, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.value === true) {
      writer.uint32(16).bool(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BoolSetting {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBoolSetting();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.value = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BoolSetting {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      value: isSet(object.value) ? Boolean(object.value) : false,
    };
  },

  toJSON(message: BoolSetting): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  create<I extends Exact<DeepPartial<BoolSetting>, I>>(base?: I): BoolSetting {
    return BoolSetting.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BoolSetting>, I>>(object: I): BoolSetting {
    const message = createBaseBoolSetting();
    message.name = object.name ?? "";
    message.value = object.value ?? false;
    return message;
  },
};

function createBaseListSessionsOptions(): ListSessionsOptions {
  return {};
}

export const ListSessionsOptions = {
  encode(_: ListSessionsOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListSessionsOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListSessionsOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): ListSessionsOptions {
    return {};
  },

  toJSON(_: ListSessionsOptions): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<ListSessionsOptions>, I>>(base?: I): ListSessionsOptions {
    return ListSessionsOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListSessionsOptions>, I>>(_: I): ListSessionsOptions {
    const message = createBaseListSessionsOptions();
    return message;
  },
};

function createBaseSessionList(): SessionList {
  return { sessions: [] };
}

export const SessionList = {
  encode(message: SessionList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.sessions) {
      Session.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SessionList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSessionList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sessions.push(Session.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SessionList {
    return { sessions: Array.isArray(object?.sessions) ? object.sessions.map((e: any) => Session.fromJSON(e)) : [] };
  },

  toJSON(message: SessionList): unknown {
    const obj: any = {};
    if (message.sessions) {
      obj.sessions = message.sessions.map((e) => e ? Session.toJSON(e) : undefined);
    } else {
      obj.sessions = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SessionList>, I>>(base?: I): SessionList {
    return SessionList.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SessionList>, I>>(object: I): SessionList {
    const message = createBaseSessionList();
    message.sessions = object.sessions?.map((e) => Session.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSession(): Session {
  return { key: "", subject: "", kind: "", createdAt: "" };
}

export const Session = {
  encode(message: Session, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.subject !== "") {
      writer.uint32(18).string(message.subject);
    }
    if (message.kind !== "") {
      writer.uint32(26).string(message.kind);
    }
    if (message.createdAt !== "") {
      writer.uint32(34).string(message.createdAt);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Session {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSession();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.subject = reader.string();
          break;
        case 3:
          message.kind = reader.string();
          break;
        case 4:
          message.createdAt = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Session {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      subject: isSet(object.subject) ? String(object.subject) : "",
      kind: isSet(object.kind) ? String(object.kind) : "",
      createdAt: isSet(object.createdAt) ? String(object.createdAt) : "",
    };
  },

  toJSON(message: Session): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.subject !== undefined && (obj.subject = message.subject);
    message.kind !== undefined && (obj.kind = message.kind);
    message.createdAt !== undefined && (obj.createdAt = message.createdAt);
    return obj;
  },

  create<I extends Exact<DeepPartial<Session>, I>>(base?: I): Session {
    return Session.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Session>, I>>(object: I): Session {
    const message = createBaseSession();
    message.key = object.key ?? "";
    message.subject = object.subject ?? "";
    message.kind = object.kind ?? "";
    message.createdAt = object.createdAt ?? "";
    return message;
  },
};

function createBaseUser(): User {
  return { username: "", name: "" };
}

export const User = {
  encode(message: User, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): User {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        case 2:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): User {
    return {
      username: isSet(object.username) ? String(object.username) : "",
      name: isSet(object.name) ? String(object.name) : "",
    };
  },

  toJSON(message: User): unknown {
    const obj: any = {};
    message.username !== undefined && (obj.username = message.username);
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  create<I extends Exact<DeepPartial<User>, I>>(base?: I): User {
    return User.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<User>, I>>(object: I): User {
    const message = createBaseUser();
    message.username = object.username ?? "";
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseWriteableUser(): WriteableUser {
  return { username: "", password: "", name: "" };
}

export const WriteableUser = {
  encode(message: WriteableUser, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.password !== "") {
      writer.uint32(18).string(message.password);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WriteableUser {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWriteableUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        case 2:
          message.password = reader.string();
          break;
        case 3:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WriteableUser {
    return {
      username: isSet(object.username) ? String(object.username) : "",
      password: isSet(object.password) ? String(object.password) : "",
      name: isSet(object.name) ? String(object.name) : "",
    };
  },

  toJSON(message: WriteableUser): unknown {
    const obj: any = {};
    message.username !== undefined && (obj.username = message.username);
    message.password !== undefined && (obj.password = message.password);
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  create<I extends Exact<DeepPartial<WriteableUser>, I>>(base?: I): WriteableUser {
    return WriteableUser.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<WriteableUser>, I>>(object: I): WriteableUser {
    const message = createBaseWriteableUser();
    message.username = object.username ?? "";
    message.password = object.password ?? "";
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseListUsersOptions(): ListUsersOptions {
  return {};
}

export const ListUsersOptions = {
  encode(_: ListUsersOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListUsersOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListUsersOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): ListUsersOptions {
    return {};
  },

  toJSON(_: ListUsersOptions): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<ListUsersOptions>, I>>(base?: I): ListUsersOptions {
    return ListUsersOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListUsersOptions>, I>>(_: I): ListUsersOptions {
    const message = createBaseListUsersOptions();
    return message;
  },
};

function createBaseUserList(): UserList {
  return { users: [] };
}

export const UserList = {
  encode(message: UserList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.users) {
      User.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.users.push(User.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserList {
    return { users: Array.isArray(object?.users) ? object.users.map((e: any) => User.fromJSON(e)) : [] };
  },

  toJSON(message: UserList): unknown {
    const obj: any = {};
    if (message.users) {
      obj.users = message.users.map((e) => e ? User.toJSON(e) : undefined);
    } else {
      obj.users = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UserList>, I>>(base?: I): UserList {
    return UserList.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<UserList>, I>>(object: I): UserList {
    const message = createBaseUserList();
    message.users = object.users?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseWriteableAPIKey(): WriteableAPIKey {
  return { name: "" };
}

export const WriteableAPIKey = {
  encode(message: WriteableAPIKey, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WriteableAPIKey {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWriteableAPIKey();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WriteableAPIKey {
    return { name: isSet(object.name) ? String(object.name) : "" };
  },

  toJSON(message: WriteableAPIKey): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  create<I extends Exact<DeepPartial<WriteableAPIKey>, I>>(base?: I): WriteableAPIKey {
    return WriteableAPIKey.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<WriteableAPIKey>, I>>(object: I): WriteableAPIKey {
    const message = createBaseWriteableAPIKey();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseAPIKeyWithSecret(): APIKeyWithSecret {
  return { name: "", secret: "", createdAt: "" };
}

export const APIKeyWithSecret = {
  encode(message: APIKeyWithSecret, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.secret !== "") {
      writer.uint32(18).string(message.secret);
    }
    if (message.createdAt !== "") {
      writer.uint32(26).string(message.createdAt);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): APIKeyWithSecret {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAPIKeyWithSecret();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.secret = reader.string();
          break;
        case 3:
          message.createdAt = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): APIKeyWithSecret {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      secret: isSet(object.secret) ? String(object.secret) : "",
      createdAt: isSet(object.createdAt) ? String(object.createdAt) : "",
    };
  },

  toJSON(message: APIKeyWithSecret): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.secret !== undefined && (obj.secret = message.secret);
    message.createdAt !== undefined && (obj.createdAt = message.createdAt);
    return obj;
  },

  create<I extends Exact<DeepPartial<APIKeyWithSecret>, I>>(base?: I): APIKeyWithSecret {
    return APIKeyWithSecret.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<APIKeyWithSecret>, I>>(object: I): APIKeyWithSecret {
    const message = createBaseAPIKeyWithSecret();
    message.name = object.name ?? "";
    message.secret = object.secret ?? "";
    message.createdAt = object.createdAt ?? "";
    return message;
  },
};

function createBaseBeginVerificationOptions(): BeginVerificationOptions {
  return { email: "" };
}

export const BeginVerificationOptions = {
  encode(message: BeginVerificationOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.email !== "") {
      writer.uint32(10).string(message.email);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BeginVerificationOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBeginVerificationOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.email = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BeginVerificationOptions {
    return { email: isSet(object.email) ? String(object.email) : "" };
  },

  toJSON(message: BeginVerificationOptions): unknown {
    const obj: any = {};
    message.email !== undefined && (obj.email = message.email);
    return obj;
  },

  create<I extends Exact<DeepPartial<BeginVerificationOptions>, I>>(base?: I): BeginVerificationOptions {
    return BeginVerificationOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BeginVerificationOptions>, I>>(object: I): BeginVerificationOptions {
    const message = createBaseBeginVerificationOptions();
    message.email = object.email ?? "";
    return message;
  },
};

function createBaseBeginVerificationResult(): BeginVerificationResult {
  return { key: "" };
}

export const BeginVerificationResult = {
  encode(message: BeginVerificationResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BeginVerificationResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBeginVerificationResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BeginVerificationResult {
    return { key: isSet(object.key) ? String(object.key) : "" };
  },

  toJSON(message: BeginVerificationResult): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    return obj;
  },

  create<I extends Exact<DeepPartial<BeginVerificationResult>, I>>(base?: I): BeginVerificationResult {
    return BeginVerificationResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BeginVerificationResult>, I>>(object: I): BeginVerificationResult {
    const message = createBaseBeginVerificationResult();
    message.key = object.key ?? "";
    return message;
  },
};

function createBaseCompleteVerificationOptions(): CompleteVerificationOptions {
  return { email: "", key: "", challenge: "" };
}

export const CompleteVerificationOptions = {
  encode(message: CompleteVerificationOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.email !== "") {
      writer.uint32(10).string(message.email);
    }
    if (message.key !== "") {
      writer.uint32(18).string(message.key);
    }
    if (message.challenge !== "") {
      writer.uint32(26).string(message.challenge);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompleteVerificationOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompleteVerificationOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.email = reader.string();
          break;
        case 2:
          message.key = reader.string();
          break;
        case 3:
          message.challenge = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CompleteVerificationOptions {
    return {
      email: isSet(object.email) ? String(object.email) : "",
      key: isSet(object.key) ? String(object.key) : "",
      challenge: isSet(object.challenge) ? String(object.challenge) : "",
    };
  },

  toJSON(message: CompleteVerificationOptions): unknown {
    const obj: any = {};
    message.email !== undefined && (obj.email = message.email);
    message.key !== undefined && (obj.key = message.key);
    message.challenge !== undefined && (obj.challenge = message.challenge);
    return obj;
  },

  create<I extends Exact<DeepPartial<CompleteVerificationOptions>, I>>(base?: I): CompleteVerificationOptions {
    return CompleteVerificationOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<CompleteVerificationOptions>, I>>(object: I): CompleteVerificationOptions {
    const message = createBaseCompleteVerificationOptions();
    message.email = object.email ?? "";
    message.key = object.key ?? "";
    message.challenge = object.challenge ?? "";
    return message;
  },
};

function createBaseCompleteVerificationResult(): CompleteVerificationResult {
  return {};
}

export const CompleteVerificationResult = {
  encode(_: CompleteVerificationResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompleteVerificationResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompleteVerificationResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): CompleteVerificationResult {
    return {};
  },

  toJSON(_: CompleteVerificationResult): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<CompleteVerificationResult>, I>>(base?: I): CompleteVerificationResult {
    return CompleteVerificationResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<CompleteVerificationResult>, I>>(_: I): CompleteVerificationResult {
    const message = createBaseCompleteVerificationResult();
    return message;
  },
};

function createBaseListMembersOptions(): ListMembersOptions {
  return { email: "" };
}

export const ListMembersOptions = {
  encode(message: ListMembersOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.email !== "") {
      writer.uint32(10).string(message.email);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListMembersOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListMembersOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.email = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ListMembersOptions {
    return { email: isSet(object.email) ? String(object.email) : "" };
  },

  toJSON(message: ListMembersOptions): unknown {
    const obj: any = {};
    message.email !== undefined && (obj.email = message.email);
    return obj;
  },

  create<I extends Exact<DeepPartial<ListMembersOptions>, I>>(base?: I): ListMembersOptions {
    return ListMembersOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ListMembersOptions>, I>>(object: I): ListMembersOptions {
    const message = createBaseListMembersOptions();
    message.email = object.email ?? "";
    return message;
  },
};

function createBaseMemberList(): MemberList {
  return { members: [] };
}

export const MemberList = {
  encode(message: MemberList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.members) {
      Member.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MemberList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMemberList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.members.push(Member.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MemberList {
    return { members: Array.isArray(object?.members) ? object.members.map((e: any) => Member.fromJSON(e)) : [] };
  },

  toJSON(message: MemberList): unknown {
    const obj: any = {};
    if (message.members) {
      obj.members = message.members.map((e) => e ? Member.toJSON(e) : undefined);
    } else {
      obj.members = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MemberList>, I>>(base?: I): MemberList {
    return MemberList.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MemberList>, I>>(object: I): MemberList {
    const message = createBaseMemberList();
    message.members = object.members?.map((e) => Member.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMember(): Member {
  return { email: "", firstName: "", lastName: "", verified: false, createdAt: "" };
}

export const Member = {
  encode(message: Member, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.email !== "") {
      writer.uint32(10).string(message.email);
    }
    if (message.firstName !== "") {
      writer.uint32(18).string(message.firstName);
    }
    if (message.lastName !== "") {
      writer.uint32(26).string(message.lastName);
    }
    if (message.verified === true) {
      writer.uint32(32).bool(message.verified);
    }
    if (message.createdAt !== "") {
      writer.uint32(42).string(message.createdAt);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Member {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMember();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.email = reader.string();
          break;
        case 2:
          message.firstName = reader.string();
          break;
        case 3:
          message.lastName = reader.string();
          break;
        case 4:
          message.verified = reader.bool();
          break;
        case 5:
          message.createdAt = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Member {
    return {
      email: isSet(object.email) ? String(object.email) : "",
      firstName: isSet(object.firstName) ? String(object.firstName) : "",
      lastName: isSet(object.lastName) ? String(object.lastName) : "",
      verified: isSet(object.verified) ? Boolean(object.verified) : false,
      createdAt: isSet(object.createdAt) ? String(object.createdAt) : "",
    };
  },

  toJSON(message: Member): unknown {
    const obj: any = {};
    message.email !== undefined && (obj.email = message.email);
    message.firstName !== undefined && (obj.firstName = message.firstName);
    message.lastName !== undefined && (obj.lastName = message.lastName);
    message.verified !== undefined && (obj.verified = message.verified);
    message.createdAt !== undefined && (obj.createdAt = message.createdAt);
    return obj;
  },

  create<I extends Exact<DeepPartial<Member>, I>>(base?: I): Member {
    return Member.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Member>, I>>(object: I): Member {
    const message = createBaseMember();
    message.email = object.email ?? "";
    message.firstName = object.firstName ?? "";
    message.lastName = object.lastName ?? "";
    message.verified = object.verified ?? false;
    message.createdAt = object.createdAt ?? "";
    return message;
  },
};

function createBaseWriteableMember(): WriteableMember {
  return { email: "", firstName: "", lastName: "" };
}

export const WriteableMember = {
  encode(message: WriteableMember, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.email !== "") {
      writer.uint32(10).string(message.email);
    }
    if (message.firstName !== "") {
      writer.uint32(18).string(message.firstName);
    }
    if (message.lastName !== "") {
      writer.uint32(26).string(message.lastName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WriteableMember {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWriteableMember();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.email = reader.string();
          break;
        case 2:
          message.firstName = reader.string();
          break;
        case 3:
          message.lastName = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WriteableMember {
    return {
      email: isSet(object.email) ? String(object.email) : "",
      firstName: isSet(object.firstName) ? String(object.firstName) : "",
      lastName: isSet(object.lastName) ? String(object.lastName) : "",
    };
  },

  toJSON(message: WriteableMember): unknown {
    const obj: any = {};
    message.email !== undefined && (obj.email = message.email);
    message.firstName !== undefined && (obj.firstName = message.firstName);
    message.lastName !== undefined && (obj.lastName = message.lastName);
    return obj;
  },

  create<I extends Exact<DeepPartial<WriteableMember>, I>>(base?: I): WriteableMember {
    return WriteableMember.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<WriteableMember>, I>>(object: I): WriteableMember {
    const message = createBaseWriteableMember();
    message.email = object.email ?? "";
    message.firstName = object.firstName ?? "";
    message.lastName = object.lastName ?? "";
    return message;
  },
};

function createBaseGetMemberOptions(): GetMemberOptions {
  return { email: "" };
}

export const GetMemberOptions = {
  encode(message: GetMemberOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.email !== "") {
      writer.uint32(10).string(message.email);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetMemberOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetMemberOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.email = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetMemberOptions {
    return { email: isSet(object.email) ? String(object.email) : "" };
  },

  toJSON(message: GetMemberOptions): unknown {
    const obj: any = {};
    message.email !== undefined && (obj.email = message.email);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetMemberOptions>, I>>(base?: I): GetMemberOptions {
    return GetMemberOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetMemberOptions>, I>>(object: I): GetMemberOptions {
    const message = createBaseGetMemberOptions();
    message.email = object.email ?? "";
    return message;
  },
};

export interface Spectral {
  /** Ping allows clients to ask the server about the authenticated user or API key. */
  Ping(request: PingOptions): Promise<PingResult>;
  /** Events */
  ListEvents(request: ListEventsOptions): Promise<EventList>;
  GetEvent(request: ByName): Promise<Event>;
  CreateEvent(request: Event): Promise<Event>;
  UpdateEvent(request: Event): Promise<Event>;
  /** Registrations */
  ListEventRegistrations(request: ListEventRegistrationsOptions): Promise<RegistrationList>;
  GetRegistration(request: ByConfCode): Promise<Registration>;
  CreateRegistration(request: WriteableRegistration): Promise<Registration>;
  /** Members */
  CreateMember(request: WriteableMember): Promise<Member>;
  ListMembers(request: ListMembersOptions): Promise<MemberList>;
  GetMember(request: GetMemberOptions): Promise<Member>;
  /** Users */
  CreateUser(request: WriteableUser): Promise<User>;
  ListUsers(request: ListUsersOptions): Promise<UserList>;
  /** Sessions */
  ListSessions(request: ListSessionsOptions): Promise<SessionList>;
  /** API Keys */
  CreateAPIKey(request: WriteableAPIKey): Promise<APIKeyWithSecret>;
  /** Settings */
  GetBoolSetting(request: ByName): Promise<BoolSetting>;
  UpdateBoolSetting(request: BoolSetting): Promise<BoolSetting>;
  BeginVerification(request: BeginVerificationOptions): Promise<BeginVerificationResult>;
  CompleteVerification(request: CompleteVerificationOptions): Promise<CompleteVerificationResult>;
  Register(request: MemberRegistration): Promise<Registration>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
