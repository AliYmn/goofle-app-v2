-- ============================================================
-- Migration: 001 — Initial Schema
-- Tables: users, credit_transactions, app_config
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username              TEXT UNIQUE,
  bio                   TEXT,
  avatar_url            TEXT,
  credit_balance        INTEGER NOT NULL DEFAULT 20,
  current_streak        INTEGER NOT NULL DEFAULT 0,
  longest_streak        INTEGER NOT NULL DEFAULT 0,
  last_generation_date  DATE,
  is_pro                BOOLEAN NOT NULL DEFAULT FALSE,
  pro_expires_at        TIMESTAMPTZ,
  revenuecat_customer_id TEXT,
  language_preference   TEXT NOT NULL DEFAULT 'tr' CHECK (language_preference IN ('tr', 'en')),
  push_token            TEXT,
  notification_hour     INTEGER NOT NULL DEFAULT 20 CHECK (notification_hour BETWEEN 0 AND 23),
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── credit_transactions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  type        TEXT NOT NULL CHECK (type IN (
    'signup_bonus', 'daily_login', 'pro_daily_bonus', 'share_bonus',
    'purchase', 'generation', 'onboarding_free', 'challenge_bonus', 'refund'
  )),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── app_config ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- users: public profiles (username + avatar visible to all)
CREATE POLICY "users_select_public" ON public.users
  FOR SELECT USING (TRUE);

-- credit_transactions: own only
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "credit_transactions_insert_own" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- app_config: readable by all authenticated users, writable by service role only
CREATE POLICY "app_config_select_all" ON public.app_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── Trigger: auto-create user row on signup ────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, credit_balance, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(NEW.email, '@', 1)
    ),
    20,
    FALSE
  );

  -- Record signup bonus transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 20, 'signup_bonus', 'Hoş geldin bonusu');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
