CREATE TABLE events (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	title TEXT NOT NULL,
	hidden INTEGER NOT NULL,
	closed INTEGER NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at TIMESTAMP
);

CREATE UNIQUE INDEX events_name_idx ON events(name);

CREATE TABLE event_dates (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	uid TEXT NOT NULL,
	event_id INTEGER NOT NULL,
	value TIMESTAMP NOT NULL,
	cancelled INTEGER NOT NULL,

	FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE UNIQUE INDEX event_dates_uid ON event_dates(event_id, uid);
CREATE UNIQUE INDEX event_dates_value ON event_dates(event_id, value);

CREATE TABLE registrations (
	id integer PRIMARY KEY AUTOINCREMENT,
	conf_code TEXT NOT NULl,
	kind TEXT NOT NULL,
	event_id INTEGER NOT NULL,
	event_date_id INTEGER,
	member_id INTEGER NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

	FOREIGN KEY (event_id) REFERENCES events(id),
	FOREIGN KEY (event_date_id) REFERENCES event_dates(id)
	-- FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE UNIQUE INDEX registrations_member_event_id
	ON registrations(member_id, event_id)
	WHERE kind = 'series';

CREATE UNIQUE INDEX registrations_member_event_date_id
	ON registrations(member_id, event_date_id)
	WHERE kind = 'once';

CREATE TABLE members (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL,
	verified INTEGER DEFAULT 0 NOT NULL,
	first_name TEXT,
	last_name TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX members_email ON members(email);

CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	first_name TEXT,
	last_name TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at TIMESTAMP
);

CREATE UNIQUE INDEX users_username ON users(username);

CREATE TABLE api_keys (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	secret TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX api_keys_name ON api_keys(name);

CREATE TABLE sessions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	key TEXT NOT NULL,
	subject TEXT NOT NULL,
	kind TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE verifications (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL,
	key TEXT NOT NULL,
	completed INTEGER DEFAULT 0 NOT NULL,
	challenge TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE settings (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	value BLOB,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at TIMESTAMP
);

CREATE UNIQUE INDEX settings_name ON settings(name);
