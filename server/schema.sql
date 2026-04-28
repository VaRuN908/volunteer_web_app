CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  availability TEXT NOT NULL DEFAULT 'Flexible',
  skills JSONB NOT NULL DEFAULT '[]',
  metrics JSONB NOT NULL DEFAULT '[]',
  profile_details JSONB NOT NULL DEFAULT '[]',
  socials JSONB NOT NULL DEFAULT '[]',
  support_links JSONB NOT NULL DEFAULT '[]',
  collaborations JSONB NOT NULL DEFAULT '[]',
  productions JSONB NOT NULL DEFAULT '[]',
  collections JSONB NOT NULL DEFAULT '[]',
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  skills JSONB NOT NULL DEFAULT '[]',
  location TEXT NOT NULL DEFAULT '',
  availability TEXT NOT NULL DEFAULT 'Flexible',
  email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  tone TEXT NOT NULL,
  blurb TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  focus_role TEXT NOT NULL,
  impact TEXT NOT NULL,
  availability TEXT NOT NULL,
  tagline TEXT NOT NULL,
  action_label TEXT NOT NULL,
  initials TEXT NOT NULL,
  accent TEXT NOT NULL,
  category_ids JSONB NOT NULL DEFAULT '[]',
  focus_areas JSONB NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category_label TEXT NOT NULL,
  need_category TEXT NOT NULL,
  urgency_score INTEGER NOT NULL DEFAULT 5,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date TEXT NOT NULL,
  time_range TEXT NOT NULL,
  roles JSONB NOT NULL DEFAULT '[]',
  actions JSONB NOT NULL DEFAULT '[]',
  skills_required JSONB NOT NULL DEFAULT '[]',
  accent TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trending_topics (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  momentum TEXT NOT NULL,
  summary TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  parsed_needs JSONB NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  volunteer_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  status TEXT NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_connections (
  user_id TEXT NOT NULL,
  community_id TEXT NOT NULL,
  PRIMARY KEY (user_id, community_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  snippet TEXT NOT NULL,
  updated_label TEXT NOT NULL,
  badge TEXT NOT NULL,
  status TEXT NOT NULL,
  initials TEXT NOT NULL,
  accent TEXT NOT NULL,
  channel TEXT NOT NULL,
  kind TEXT NOT NULL,
  updated_at BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  author_user_id TEXT,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  time_label TEXT NOT NULL,
  sent_at BIGINT NOT NULL
);
