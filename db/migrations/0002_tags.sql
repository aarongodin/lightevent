-- Tags are admin-defined labels assigned to events, used by members to filter events in the client app.
CREATE TABLE tags (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	label TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP
);

CREATE UNIQUE INDEX tags_name ON tags(name);

CREATE TABLE event_tags (
	event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
	tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
	PRIMARY KEY (event_id, tag_id)
);

CREATE INDEX event_tags_tag ON event_tags(tag_id);
