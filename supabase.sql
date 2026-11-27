-- ============================================================
-- SPIVER BOT - SUPABASE POSTGRESQL SCHEMA
-- Jalankan seluruh SQL ini di Supabase > SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigger function untuk update kolom updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Tabel users (TANPA kolom balance, semua pakai coin)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT '',
  push_name TEXT DEFAULT '',
  limit_count INTEGER NOT NULL DEFAULT 100,
  last_reset DATE NOT NULL DEFAULT CURRENT_DATE,
  coin INTEGER NOT NULL DEFAULT 50,
  level INTEGER NOT NULL DEFAULT 1,
  prem BOOLEAN NOT NULL DEFAULT FALSE,
  prem_until TIMESTAMPTZ NULL,
  afk_reason TEXT NULL,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Tabel groups
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT '',
  welcome_text TEXT DEFAULT 'Selamat datang @user di grup @group!',
  left_text TEXT DEFAULT 'Selamat tinggal @user, semoga tenang di luar sana.',
  welcome_on BOOLEAN NOT NULL DEFAULT FALSE,
  close_on BOOLEAN NOT NULL DEFAULT FALSE,
  open_on BOOLEAN NOT NULL DEFAULT FALSE,
  close_text TEXT DEFAULT 'Grup telah ditutup oleh admin.',
  open_text TEXT DEFAULT 'Grup telah dibuka oleh admin.',
  antilink BOOLEAN NOT NULL DEFAULT FALSE,
  antibadword BOOLEAN NOT NULL DEFAULT FALSE,
  antifoto BOOLEAN NOT NULL DEFAULT FALSE,
  antistiker BOOLEAN NOT NULL DEFAULT FALSE,
  antivideo BOOLEAN NOT NULL DEFAULT FALSE,
  antitagsw BOOLEAN NOT NULL DEFAULT FALSE,
  badwords TEXT[] NOT NULL DEFAULT ARRAY['anjing', 'babi', 'bangsat', 'kontol', 'memek', 'asu', 'tolol', 'goblok'],
  sewa_until TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_groups_updated_at ON groups;
CREATE TRIGGER trg_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Tabel group_muted
CREATE TABLE IF NOT EXISTS group_muted (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  muted_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_muted_lookup ON group_muted(group_id, user_id);

-- 4. Tabel group_banned
CREATE TABLE IF NOT EXISTS group_banned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_banned_lookup ON group_banned(group_id, user_id);

-- 5. Tabel absen
CREATE TABLE IF NOT EXISTS absen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id, tanggal)
);

-- 6. Tabel couples
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL,
  user_a TEXT NOT NULL,
  user_b TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_couples_group ON couples(group_id);

-- 7. Tabel anonymous_sessions
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id TEXT PRIMARY KEY,
  user_a TEXT NULL,
  user_b TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'paired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_anonymous_sessions_updated_at ON anonymous_sessions;
CREATE TRIGGER trg_anonymous_sessions_updated_at
  BEFORE UPDATE ON anonymous_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Tabel game_sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_chat ON game_sessions(chat_id);

-- 9. Tabel settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value)
VALUES
  ('botPribadiOnlyPrem', 'false'),
  ('antiCallBot', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- RLS & POLICY UNTUK BOT (ALLOW ALL FOR ANON / DEVELOPMENT)
-- ============================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_muted DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_banned DISABLE ROW LEVEL SECURITY;
ALTER TABLE absen DISABLE ROW LEVEL SECURITY;
ALTER TABLE couples DISABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE users TO anon, authenticated;
GRANT ALL ON TABLE groups TO anon, authenticated;
GRANT ALL ON TABLE group_muted TO anon, authenticated;
GRANT ALL ON TABLE group_banned TO anon, authenticated;
GRANT ALL ON TABLE absen TO anon, authenticated;
GRANT ALL ON TABLE couples TO anon, authenticated;
GRANT ALL ON TABLE anonymous_sessions TO anon, authenticated;
GRANT ALL ON TABLE game_sessions TO anon, authenticated;
GRANT ALL ON TABLE settings TO anon, authenticated;
