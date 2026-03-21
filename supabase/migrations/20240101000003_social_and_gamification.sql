-- ============================================================
-- Migration: 003 — Social, Collections & Gamification
-- Tables: collections, collection_items, daily_challenges,
--         user_challenges, leaderboard_entries,
--         prompt_library, prompt_votes, reports
-- ============================================================

-- ── collections ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collections (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  cover_image_url TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── collection_items ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collection_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  generation_id UUID NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, generation_id)
);

-- ── daily_challenges ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_tr         TEXT NOT NULL,
  title_en         TEXT NOT NULL,
  description_tr   TEXT NOT NULL,
  description_en   TEXT NOT NULL,
  challenge_type   TEXT NOT NULL,
  target_mod_id    UUID REFERENCES public.mods(id) ON DELETE SET NULL,
  bonus_credits    INTEGER NOT NULL DEFAULT 5,
  active_date      DATE UNIQUE NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── user_challenges ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- ── leaderboard_entries ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  period_type      TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start     DATE NOT NULL,
  score            INTEGER NOT NULL DEFAULT 0,
  ranking_category TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, period_type, period_start, ranking_category)
);

-- ── prompt_library ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prompt_library (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  vote_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── prompt_votes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prompt_votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_id  UUID NOT NULL REFERENCES public.prompt_library(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- ── reports ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('generation', 'mod', 'user')),
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_note  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_active_date ON public.daily_challenges(active_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON public.leaderboard_entries(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_prompt_library_vote_count ON public.prompt_library(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- collections
CREATE POLICY "collections_select_own" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "collections_insert_own" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_update_own" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "collections_delete_own" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- collection_items
CREATE POLICY "collection_items_select_own" ON public.collection_items
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id)
  );
CREATE POLICY "collection_items_insert_own" ON public.collection_items
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id)
  );
CREATE POLICY "collection_items_delete_own" ON public.collection_items
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id)
  );

-- daily_challenges: readable by all authenticated users
CREATE POLICY "daily_challenges_select_all" ON public.daily_challenges
  FOR SELECT USING (auth.role() = 'authenticated');

-- user_challenges
CREATE POLICY "user_challenges_select_own" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_challenges_insert_own" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- leaderboard_entries: readable by all
CREATE POLICY "leaderboard_entries_select_all" ON public.leaderboard_entries FOR SELECT USING (TRUE);

-- prompt_library
CREATE POLICY "prompt_library_select_all" ON public.prompt_library FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "prompt_library_insert_own" ON public.prompt_library FOR INSERT WITH CHECK (auth.uid() = user_id);

-- prompt_votes
CREATE POLICY "prompt_votes_select_own" ON public.prompt_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prompt_votes_insert_own" ON public.prompt_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prompt_votes_delete_own" ON public.prompt_votes FOR DELETE USING (auth.uid() = user_id);

-- reports
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- ── Trigger: update prompt vote_count ──────────────────────
CREATE OR REPLACE FUNCTION public.update_prompt_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prompt_library SET vote_count = vote_count + 1 WHERE id = NEW.prompt_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prompt_library SET vote_count = GREATEST(0, vote_count - 1) WHERE id = OLD.prompt_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_prompt_vote_change
  AFTER INSERT OR DELETE ON public.prompt_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_prompt_vote_count();
