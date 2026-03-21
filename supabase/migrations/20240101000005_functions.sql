-- ============================================================
-- Migration: 005 — DB Functions & Triggers
-- ============================================================

-- ── deduct_credits ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.users
  SET credit_balance = credit_balance - p_amount
  WHERE id = p_user_id AND credit_balance >= p_amount
  RETURNING credit_balance INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'generation', p_description);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── add_credits ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id     UUID,
  p_amount      INTEGER,
  p_type        TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.users
  SET credit_balance = credit_balance + p_amount
  WHERE id = p_user_id
  RETURNING credit_balance INTO new_balance;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, p_type, p_description);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── increment_mod_usage ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_mod_usage(p_mod_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.mods SET usage_count = usage_count + 1 WHERE id = p_mod_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── update_streak ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_date  DATE;
  today      DATE := CURRENT_DATE;
  new_streak INTEGER;
BEGIN
  SELECT last_generation_date, current_streak
  INTO last_date, new_streak
  FROM public.users
  WHERE id = p_user_id;

  IF last_date = today THEN
    RETURN new_streak;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    new_streak := new_streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  UPDATE public.users
  SET
    current_streak       = new_streak,
    longest_streak       = GREATEST(longest_streak, new_streak),
    last_generation_date = today
  WHERE id = p_user_id;

  RETURN new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
