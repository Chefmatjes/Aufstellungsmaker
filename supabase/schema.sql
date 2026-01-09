-- =============================================
-- Aufstellungsmaker Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- Linked to auth.users via trigger
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. CANDIDATE LISTS TABLE
-- The "Vorgaben" that users create
-- =============================================
CREATE TABLE IF NOT EXISTS public.candidate_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requires_substitutes BOOLEAN DEFAULT false NOT NULL,
  requires_trainer BOOLEAN DEFAULT false NOT NULL,
  allow_player_adds BOOLEAN DEFAULT false NOT NULL,
  share_slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_candidate_lists_share_slug ON public.candidate_lists(share_slug);
CREATE INDEX IF NOT EXISTS idx_candidate_lists_owner_id ON public.candidate_lists(owner_id);

-- Enable RLS
ALTER TABLE public.candidate_lists ENABLE ROW LEVEL SECURITY;

-- Candidate lists policies
CREATE POLICY "Anyone can view candidate lists via share_slug"
  ON public.candidate_lists FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create candidate lists"
  ON public.candidate_lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their candidate lists"
  ON public.candidate_lists FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their candidate lists"
  ON public.candidate_lists FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- 3. CANDIDATES TABLE
-- Players/candidates within a list
-- =============================================
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES public.candidate_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT, -- e.g., "Tor", "Abwehr", "Mittelfeld", "Sturm"
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster list lookups
CREATE INDEX IF NOT EXISTS idx_candidates_list_id ON public.candidates(list_id);

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Candidates policies
CREATE POLICY "Anyone can view candidates"
  ON public.candidates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add candidates if list allows it"
  ON public.candidates FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.candidate_lists
      WHERE id = list_id AND owner_id = auth.uid()
    ))
    OR
    EXISTS (
      SELECT 1 FROM public.candidate_lists
      WHERE id = list_id AND allow_player_adds = true
    )
  );

CREATE POLICY "List owners can update candidates"
  ON public.candidates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_lists
      WHERE id = list_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "List owners can delete candidates"
  ON public.candidates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_lists
      WHERE id = list_id AND owner_id = auth.uid()
    )
  );

-- =============================================
-- 4. LINEUPS TABLE
-- Individual lineups created from a candidate list
-- =============================================
CREATE TABLE IF NOT EXISTS public.lineups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES public.candidate_lists(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  trainer_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
  team_name TEXT NOT NULL,
  share_slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lineups_share_slug ON public.lineups(share_slug);
CREATE INDEX IF NOT EXISTS idx_lineups_list_id ON public.lineups(list_id);
CREATE INDEX IF NOT EXISTS idx_lineups_creator_id ON public.lineups(creator_id);

-- Enable RLS
ALTER TABLE public.lineups ENABLE ROW LEVEL SECURITY;

-- Lineups policies
CREATE POLICY "Anyone can view lineups"
  ON public.lineups FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create lineups (even anonymous)"
  ON public.lineups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can update their lineups"
  ON public.lineups FOR UPDATE
  USING (
    creator_id IS NULL OR auth.uid() = creator_id
  );

CREATE POLICY "Creators can delete their lineups"
  ON public.lineups FOR DELETE
  USING (
    creator_id IS NULL OR auth.uid() = creator_id
  );

-- =============================================
-- 5. LINEUP POSITIONS TABLE
-- Individual player positions in a lineup
-- =============================================
CREATE TABLE IF NOT EXISTS public.lineup_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lineup_id UUID NOT NULL REFERENCES public.lineups(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  x_percent REAL NOT NULL CHECK (x_percent >= 0 AND x_percent <= 100),
  y_percent REAL NOT NULL CHECK (y_percent >= 0 AND y_percent <= 100),
  is_substitute BOOLEAN DEFAULT false NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL
);

-- Create index for faster lineup lookups
CREATE INDEX IF NOT EXISTS idx_lineup_positions_lineup_id ON public.lineup_positions(lineup_id);

-- Unique constraint: each candidate can only appear once per lineup
CREATE UNIQUE INDEX IF NOT EXISTS idx_lineup_positions_unique 
  ON public.lineup_positions(lineup_id, candidate_id);

-- Enable RLS
ALTER TABLE public.lineup_positions ENABLE ROW LEVEL SECURITY;

-- Lineup positions policies
CREATE POLICY "Anyone can view lineup positions"
  ON public.lineup_positions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create lineup positions"
  ON public.lineup_positions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Lineup creators can update positions"
  ON public.lineup_positions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lineups
      WHERE id = lineup_id AND (creator_id IS NULL OR creator_id = auth.uid())
    )
  );

CREATE POLICY "Lineup creators can delete positions"
  ON public.lineup_positions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lineups
      WHERE id = lineup_id AND (creator_id IS NULL OR creator_id = auth.uid())
    )
  );

-- =============================================
-- 6. FUNCTIONS & TRIGGERS
-- =============================================

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidate_lists_updated_at ON public.candidate_lists;
CREATE TRIGGER update_candidate_lists_updated_at
  BEFORE UPDATE ON public.candidate_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lineups_updated_at ON public.lineups;
CREATE TRIGGER update_lineups_updated_at
  BEFORE UPDATE ON public.lineups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 7. SAMPLE DATA (Optional - for testing)
-- =============================================
-- Uncomment the following to insert sample data after creating a user

/*
-- First, create a user through Supabase Auth, then use their UUID here
-- INSERT INTO public.candidate_lists (owner_id, title, description, allow_player_adds, share_slug)
-- VALUES (
--   'YOUR_USER_UUID_HERE',
--   'Beste Deutsche Nationalelf aller Zeiten',
--   'Wähle die Top-11 plus 5 Ersatzspieler aus deutschen Nationalspielern ab 1990',
--   false,
--   'deutsche-nationalelf-2025'
-- );
*/
