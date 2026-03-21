import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface CreditState {
  balance: number;
  isLoading: boolean;
  setBalance: (balance: number) => void;
  refreshBalance: (userId: string) => Promise<void>;
  deduct: (amount: number) => void;
  add: (amount: number) => void;
}

export const useCreditStore = create<CreditState>((set) => ({
  balance: 0,
  isLoading: false,

  setBalance: (balance) => set({ balance }),
  deduct: (amount) => set((state) => ({ balance: Math.max(0, state.balance - amount) })),
  add: (amount) => set((state) => ({ balance: state.balance + amount })),

  refreshBalance: async (userId: string) => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', userId)
      .single();
    if (data) set({ balance: data.credit_balance });
    set({ isLoading: false });
  },
}));
