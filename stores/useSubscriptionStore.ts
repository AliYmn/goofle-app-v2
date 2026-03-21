import { create } from 'zustand';

interface SubscriptionState {
  isPro: boolean;
  proExpiresAt: string | null;
  isLoading: boolean;
  setIsPro: (isPro: boolean, expiresAt?: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPro: false,
  proExpiresAt: null,
  isLoading: false,

  setIsPro: (isPro, expiresAt = null) => set({ isPro, proExpiresAt: expiresAt }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
