export const APP_ICON = require('@/assets/images/icon.png');

type PublicBucket = 'avatars' | 'mod-thumbs' | 'generations';

const URI_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

export function normalizeImageUri(
  uri?: string | null,
  bucket?: PublicBucket,
): string | null {
  const value = uri?.trim();
  if (!value) return null;

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  if (URI_SCHEME_PATTERN.test(value)) {
    return value;
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!supabaseUrl) {
    return value;
  }

  if (value.startsWith('/storage/v1/object/public/')) {
    return `${supabaseUrl}${value}`;
  }

  if (value.startsWith('storage/v1/object/public/')) {
    return `${supabaseUrl}/${value}`;
  }

  if (!bucket) {
    return value;
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${value.replace(/^\/+/, '')}`;
}
