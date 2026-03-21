import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastGenerationDate: string | null;
  setStreak: (current: number, longest: number) => void;
  refreshStreak: (userId: string) => Promise<void>;
}

export const useStreakStore = create<StreakState>((set) => ({
  currentStreak: 0,
  longestStreak: 0,
  lastGenerationDate: null,

  setStreak: (current, longest) => set({ currentStreak: current, longestStreak: longest }),

  refreshStreak: async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('current_streak, longest_streak, last_generation_date')
      .eq('id', userId)
      .single();
    if (data) {
      set({
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastGenerationDate: data.last_generation_date,
      });
    }
  },
}));
