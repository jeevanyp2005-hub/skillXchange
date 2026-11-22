-- =====================================================
-- SkillXChange Platform - Supabase SQL Schema
-- Run this entire file in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────
-- PROFILES TABLE
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT,
  bio           TEXT,
  location      TEXT,
  github_url    TEXT,
  linkedin_url  TEXT,
  website_url   TEXT,
  twitter_url   TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-create profile row when user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────
-- SKILLS TABLE
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('offer', 'want')),
  category    TEXT NOT NULL DEFAULT 'General',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user-based lookups
CREATE INDEX IF NOT EXISTS skills_user_id_idx ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS skills_type_idx ON public.skills(type);

-- ─────────────────────────────────────────────────────
-- EXCHANGE REQUESTS TABLE
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exchange_requests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offered_skill_id    UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  requested_skill_id  UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  message             TEXT DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT no_self_request CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS exchange_requests_sender_idx   ON public.exchange_requests(sender_id);
CREATE INDEX IF NOT EXISTS exchange_requests_receiver_idx ON public.exchange_requests(receiver_id);
CREATE INDEX IF NOT EXISTS exchange_requests_status_idx   ON public.exchange_requests(status);

-- ─────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

-- ── PROFILES policies ─────────────────────────────────
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── SKILLS policies ───────────────────────────────────
CREATE POLICY "Skills are publicly readable"
  ON public.skills FOR SELECT USING (true);

CREATE POLICY "Users can insert their own skills"
  ON public.skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON public.skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON public.skills FOR DELETE
  USING (auth.uid() = user_id);

-- ── EXCHANGE REQUESTS policies ────────────────────────
CREATE POLICY "Users can view requests they are part of"
  ON public.exchange_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send requests"
  ON public.exchange_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Participants can update request status"
  ON public.exchange_requests FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ─────────────────────────────────────────────────────
-- REALTIME (optional - enable for live updates)
-- ─────────────────────────────────────────────────────
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.exchange_requests;

-- =====================================================
-- Done! Your SkillXChange database is ready.
-- =====================================================
