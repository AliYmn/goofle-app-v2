import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { useColorScheme } from 'react-native';

type ThemePreference = 'system' | 'light' | 'dark';
type ColorScheme = 'light' | 'dark';

const storage = new MMKV({ id: 'theme-store' });

interface ThemeState {
  preference: ThemePreference;
  colorScheme: ColorScheme;
  setPreference: (preference: ThemePreference) => void;
  _syncColorScheme: (systemScheme: ColorScheme) => void;
}

const getColorScheme = (preference: ThemePreference, systemScheme: ColorScheme): ColorScheme => {
  if (preference === 'system') return systemScheme;
  return preference;
};

const savedPreference = (storage.getString('theme-preference') as ThemePreference) ?? 'system';

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: savedPreference,
  colorScheme: savedPreference === 'system' ? 'light' : savedPreference,

  setPreference: (preference) => {
    storage.set('theme-preference', preference);
    set((state) => ({
      preference,
      colorScheme: getColorScheme(preference, state.colorScheme),
    }));
  },

  _syncColorScheme: (systemScheme) => {
    const { preference } = get();
    if (preference === 'system') {
      set({ colorScheme: systemScheme });
    }
  },
}));
