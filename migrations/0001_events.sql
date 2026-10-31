-- Anonymous funnel events. No IP, no user agent, no personal data: a random per-tab session id only.
CREATE TABLE IF NOT EXISTS events (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name TEXT NOT NULL,
  sid  TEXT NOT NULL,
  path TEXT,
  meta TEXT
);
CREATE INDEX IF NOT EXISTS events_name_at ON events (name, at);
CREATE INDEX IF NOT EXISTS events_sid ON events (sid);
