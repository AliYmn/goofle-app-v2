-- ============================================================
-- Migration: 006 — Add reference_id to credit_transactions
--             Update add_credits RPC to accept p_reference_id
-- ============================================================

-- Add reference_id column for idempotency (share_bonus, purchase, challenge_bonus, etc.)
ALTER TABLE public.credit_transactions
  ADD COLUMN IF NOT EXISTS reference_id TEXT;

-- Unique index for idempotency: one credit per (user, type, reference)
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_idempotency
  ON public.credit_transactions(user_id, type, reference_id)
  WHERE reference_id IS NOT NULL;

-- Update add_credits to accept optional p_reference_id
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id     UUID,
  p_amount      INTEGER,
  p_type        TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.users
  SET credit_balance = credit_balance + p_amount
  WHERE id = p_user_id
  RETURNING credit_balance INTO new_balance;

  INSERT INTO public.credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
