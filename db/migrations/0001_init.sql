-- All timestamps are stored as UTC text values written by the application.
-- Booleans are stored as INTEGER 0/1.

CREATE TABLE events (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	hidden INTEGER NOT NULL DEFAULT 0,
	closed INTEGER NOT NULL DEFAULT 0,
	-- capacity is the maximum number of registrations per date; 0 means unlimited.
	capacity INTEGER NOT NULL DEFAULT 0 CHECK (capacity >= 0),
	archived_at TIMESTAMP,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP
);

CREATE UNIQUE INDEX events_name ON events(name);

CREATE TABLE event_dates (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	uid TEXT NOT NULL,
	event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
	value TIMESTAMP NOT NULL,
	cancelled INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX event_dates_uid ON event_dates(uid);
CREATE UNIQUE INDEX event_dates_event_value ON event_dates(event_id, value);
CREATE INDEX event_dates_value ON event_dates(value);

CREATE TABLE members (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	uid TEXT NOT NULL,
	email TEXT NOT NULL,
	verified INTEGER NOT NULL DEFAULT 0,
	first_name TEXT NOT NULL DEFAULT '',
	last_name TEXT NOT NULL DEFAULT '',
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP
);

CREATE UNIQUE INDEX members_uid ON members(uid);
CREATE UNIQUE INDEX members_email ON members(email);

CREATE TABLE registrations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	conf_code TEXT NOT NULL,
	kind TEXT NOT NULL CHECK (kind IN ('once', 'series')),
	event_id INTEGER NOT NULL REFERENCES events(id),
	event_date_id INTEGER REFERENCES event_dates(id),
	member_id INTEGER NOT NULL REFERENCES members(id),
	created_at TIMESTAMP NOT NULL,
	deleted_at TIMESTAMP,

	CHECK ((kind = 'once' AND event_date_id IS NOT NULL) OR (kind = 'series' AND event_date_id IS NULL))
);

CREATE UNIQUE INDEX registrations_conf_code ON registrations(conf_code);
CREATE INDEX registrations_event ON registrations(event_id);
CREATE INDEX registrations_event_date ON registrations(event_date_id);
CREATE INDEX registrations_member ON registrations(member_id);

-- Only active (not deleted) registrations are considered for uniqueness, so a member can register
-- again after cancelling.
CREATE UNIQUE INDEX registrations_member_series
	ON registrations(member_id, event_id)
	WHERE kind = 'series' AND deleted_at IS NULL;

CREATE UNIQUE INDEX registrations_member_once
	ON registrations(member_id, event_date_id)
	WHERE kind = 'once' AND deleted_at IS NULL;

CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	uid TEXT NOT NULL,
	username TEXT NOT NULL COLLATE NOCASE,
	password_hash TEXT NOT NULL,
	first_name TEXT NOT NULL DEFAULT '',
	last_name TEXT NOT NULL DEFAULT '',
	email TEXT NOT NULL DEFAULT '',
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP
);

CREATE UNIQUE INDEX users_uid ON users(uid);
CREATE UNIQUE INDEX users_username ON users(username);

CREATE TABLE api_keys (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	uid TEXT NOT NULL,
	name TEXT NOT NULL,
	-- prefix is the leading characters of the secret, kept for identification only.
	prefix TEXT NOT NULL,
	-- secret_hash is the hex SHA-256 of the secret. The secret itself is never stored.
	secret_hash TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL,
	last_used_at TIMESTAMP
);

CREATE UNIQUE INDEX api_keys_uid ON api_keys(uid);
CREATE UNIQUE INDEX api_keys_name ON api_keys(name);
CREATE UNIQUE INDEX api_keys_secret_hash ON api_keys(secret_hash);

CREATE TABLE sessions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	uid TEXT NOT NULL,
	-- token_hash is the hex SHA-256 of the session token stored in the cookie.
	token_hash TEXT NOT NULL,
	kind TEXT NOT NULL CHECK (kind IN ('user', 'member')),
	-- subject_uid is the uid of the user or member.
	subject_uid TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL,
	expires_at TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX sessions_uid ON sessions(uid);
CREATE UNIQUE INDEX sessions_token_hash ON sessions(token_hash);
CREATE INDEX sessions_subject ON sessions(kind, subject_uid);
CREATE INDEX sessions_expires_at ON sessions(expires_at);

CREATE TABLE verifications (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- key_hash is the hex SHA-256 of the key returned to the client.
	key_hash TEXT NOT NULL,
	email TEXT NOT NULL,
	-- code_hash is the hex SHA-256 of the code emailed to the member.
	code_hash TEXT NOT NULL,
	attempts INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL,
	expires_at TIMESTAMP NOT NULL,
	completed_at TIMESTAMP
);

CREATE UNIQUE INDEX verifications_key_hash ON verifications(key_hash);
CREATE INDEX verifications_email ON verifications(email, created_at);
CREATE INDEX verifications_expires_at ON verifications(expires_at);

CREATE TABLE settings (
	name TEXT PRIMARY KEY,
	-- value is a JSON document.
	value TEXT NOT NULL,
	updated_at TIMESTAMP NOT NULL
);
