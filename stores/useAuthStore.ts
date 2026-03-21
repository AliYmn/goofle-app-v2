import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
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

  initialize: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    set({ session });

    if (session?.user) {
      await get().fetchUser(session.user.id);
    }

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      set({ session: newSession });
      if (newSession?.user) {
        await get().fetchUser(newSession.user.id);
      } else {
        set({ user: null, onboardingCompleted: false });
      }
    });

    set({ isLoading: false });
  },
}));
