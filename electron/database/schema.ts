export const INITIAL_SCHEMA = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline TEXT,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  category TEXT NOT NULL DEFAULT 'WORK',
  status TEXT NOT NULL DEFAULT 'TODO',
  created_at TEXT NOT NULL,
  completed_at TEXT,
  reminder_settings TEXT
);

CREATE TABLE IF NOT EXISTS pet_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'PawPilot',
  type TEXT NOT NULL DEFAULT 'cat_fox',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active TEXT NOT NULL,
  accessory_id TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  launch_on_startup INTEGER NOT NULL DEFAULT 1,
  always_on_top INTEGER NOT NULL DEFAULT 1,
  pet_size REAL NOT NULL DEFAULT 1.0,
  pos_x INTEGER NOT NULL DEFAULT 100,
  pos_y INTEGER NOT NULL DEFAULT 100,
  theme TEXT NOT NULL DEFAULT 'dark',
  sound_enabled INTEGER NOT NULL DEFAULT 1,
  quiet_hours_enabled INTEGER NOT NULL DEFAULT 0,
  quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
  quiet_hours_end TEXT NOT NULL DEFAULT '07:00',
  ai_api_key TEXT DEFAULT '',
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  focus_duration_minutes INTEGER NOT NULL DEFAULT 25
);

CREATE TABLE IF NOT EXISTS chat_history (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  tool_call TEXT
);

CREATE TABLE IF NOT EXISTS reminders_log (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  triggered_at TEXT NOT NULL
);
`;
