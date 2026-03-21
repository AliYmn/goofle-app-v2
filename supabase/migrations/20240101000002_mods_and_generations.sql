-- ============================================================
-- Migration: 002 — Mods & Generations
-- Tables: mods, generations, likes
-- ============================================================

-- ── mods ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mods (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  slug                 TEXT UNIQUE NOT NULL,
  prompt               TEXT NOT NULL,
  thumbnail_url        TEXT,
  thumbnail_blurhash   TEXT,
  category             TEXT NOT NULL,
  type                 TEXT NOT NULL DEFAULT 'official' CHECK (type IN ('official', 'community')),
  creator_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_prompt_public     BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium           BOOLEAN NOT NULL DEFAULT FALSE,
  credit_cost          INTEGER NOT NULL DEFAULT 1,
  like_count           INTEGER NOT NULL DEFAULT 0,
  usage_count          INTEGER NOT NULL DEFAULT 0,
  share_count          INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── generations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.generations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mod_id           UUID NOT NULL REFERENCES public.mods(id),
  source_image_url TEXT,
  result_image_url TEXT,
  blurhash         TEXT,
  custom_prompt    TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  fal_job_id       TEXT,
  is_public        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- ── likes ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  generation_id UUID NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, generation_id)
);

-- ── mod_likes ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mod_likes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mod_id     UUID NOT NULL REFERENCES public.mods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, mod_id)
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mods_type ON public.mods(type);
CREATE INDEX IF NOT EXISTS idx_mods_category ON public.mods(category);
CREATE INDEX IF NOT EXISTS idx_mods_usage_count ON public.mods(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_mods_like_count ON public.mods(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_is_public ON public.generations(is_public);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_generation_id ON public.likes(generation_id);

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE public.mods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mod_likes ENABLE ROW LEVEL SECURITY;

-- mods: readable by all, writable by service role (official) or creator (community)
CREATE POLICY "mods_select_all" ON public.mods
  FOR SELECT USING (TRUE);

CREATE POLICY "mods_insert_community" ON public.mods
  FOR INSERT WITH CHECK (auth.uid() = creator_id AND type = 'community');

CREATE POLICY "mods_update_community" ON public.mods
  FOR UPDATE USING (auth.uid() = creator_id AND type = 'community');

-- generations: own + public
CREATE POLICY "generations_select_own" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "generations_select_public" ON public.generations
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "generations_insert_own" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "generations_update_own" ON public.generations
  FOR UPDATE USING (auth.uid() = user_id);

-- likes
CREATE POLICY "likes_select_all" ON public.likes
  FOR SELECT USING (TRUE);

CREATE POLICY "likes_insert_own" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- mod_likes
CREATE POLICY "mod_likes_select_all" ON public.mod_likes
  FOR SELECT USING (TRUE);

CREATE POLICY "mod_likes_insert_own" ON public.mod_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mod_likes_delete_own" ON public.mod_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ── Trigger: update mods.like_count on likes changes ───────
CREATE OR REPLACE FUNCTION public.update_mod_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.mods SET like_count = like_count + 1 WHERE id = NEW.mod_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.mods SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.mod_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_mod_like_change
  AFTER INSERT OR DELETE ON public.mod_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_mod_like_count();
