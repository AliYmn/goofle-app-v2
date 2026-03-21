import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export type AuthError = { message: string; code?: string };

// ── Apple Sign-In ─────────────────────────────────────────
export async function signInWithApple(): Promise<{ error: AuthError | null }> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const idToken = credential.identityToken;
    if (!idToken) return { error: { message: 'Apple ID token not found' } };

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: idToken,
    });

    return { error: error ? { message: error.message, code: error.code } : null };
  } catch (e: any) {
    if (e.code === 'ERR_REQUEST_CANCELED') return { error: null };
    return { error: { message: e.message ?? 'Apple sign-in failed' } };
  }
}

// ── Google Sign-In ────────────────────────────────────────
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;

    if (!idToken) return { error: { message: 'Google ID token not found' } };

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    return { error: error ? { message: error.message, code: error.code } : null };
  } catch (e: any) {
    if (e.code === statusCodes.SIGN_IN_CANCELLED) return { error: null };
    return { error: { message: e.message ?? 'Google sign-in failed' } };
  }
}

// ── Email Sign-Up ─────────────────────────────────────────
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `gooflo://verify-email`,
    },
  });
  return { error: error ? { message: error.message, code: error.code } : null };
}

// ── Email Sign-In ─────────────────────────────────────────
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error ? { message: error.message, code: error.code } : null };
}

// ── Password Reset ────────────────────────────────────────
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `gooflo://reset-password`,
  });
  return { error: error ? { message: error.message, code: error.code } : null };
}

// ── Sign Out ──────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
