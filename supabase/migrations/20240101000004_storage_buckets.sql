-- ============================================================
-- Migration: 004 — Storage Buckets
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('generations', 'generations', TRUE,  52428800, ARRAY['image/jpeg','image/png','image/webp']),
  ('avatars',     'avatars',     TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('mod-thumbs',  'mod-thumbs',  TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS ────────────────────────────────────────────

-- generations bucket: users can upload to own folder, anyone can read
CREATE POLICY "generations_read_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'generations');

CREATE POLICY "generations_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'generations' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "generations_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'generations' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- avatars bucket: users can upload to own folder, anyone can read
CREATE POLICY "avatars_read_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- mod-thumbs: readable by all, service role manages uploads
CREATE POLICY "mod_thumbs_read_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'mod-thumbs');
