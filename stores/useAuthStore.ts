import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase, UserRow } from '@/lib/supabase';
import {
  signInWithApple,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  type AuthError,
} from '@/lib/auth';

interface AuthState {
  session: Session | null;
  user: UserRow | null;
  onboardingCompleted: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: UserRow | null) => void;
  setOnboardingCompleted: (value: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchUser: (userId: string) => Promise<void>;
  loginWithApple: () => Promise<AuthError | null>;
  loginWithGoogle: () => Promise<AuthError | null>;
  loginWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  registerWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  updateProfile: (updates: { username?: string; bio?: string; avatar_url?: string }) => Promise<{ error: string | null }>;
}

let authStateSubscriptionBound = false;
let authLinkingSubscriptionBound = false;

function getAuthCallbackParams(url: string) {
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  const fragment = url.split('#')[1] ?? '';
  return new URLSearchParams([query, fragment].filter(Boolean).join('&'));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  onboardingCompleted: false,
  isLoading: true,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user, onboardingCompleted: user?.onboarding_completed ?? false }),
  setOnboardingCompleted: (value) => set({ onboardingCompleted: value }),

  fetchUser: async (userId: string) => {
    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (userRow) {
      set({ user: userRow, onboardingCompleted: userRow.onboarding_completed });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, onboardingCompleted: false });
  },

  loginWithApple: async () => {
    const { error } = await signInWithApple();
    return error;
  },

  loginWithGoogle: async () => {
    const { error } = await signInWithGoogle();
    return error;
  },

  loginWithEmail: async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password);
    return error;
  },

  registerWithEmail: async (email: string, password: string) => {
    const { error } = await signUpWithEmail(email, password);
    return error;
  },

  updateProfile: async (updates) => {
    const userId = get().session?.user?.id;
    if (!userId) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) return { error: error.message };

    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } });
    }

    return { error: null };
  },

  initialize: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    set({ session });

    if (session?.user) {
      await get().fetchUser(session.user.id);
    }

    const handleAuthCallback = async (url: string | null) => {
      if (!url || !url.startsWith('gooflo://')) return;

      const params = getAuthCallbackParams(url);
      const code = params.get('code');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        return;
      }

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    };

    if (!authStateSubscriptionBound) {
      authStateSubscriptionBound = true;
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        set({ session: newSession });
        if (newSession?.user) {
          await get().fetchUser(newSession.user.id);
        } else {
          set({ user: null, onboardingCompleted: false });
        }
      });
    }

    if (!authLinkingSubscriptionBound) {
      authLinkingSubscriptionBound = true;
      const initialUrl = await Linking.getInitialURL();
      await handleAuthCallback(initialUrl);

      Linking.addEventListener('url', ({ url }) => {
        void handleAuthCallback(url);
      });
    }

    set({ isLoading: false });
  },
}));
