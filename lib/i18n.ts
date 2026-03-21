import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import tr from '@/locales/tr.json';
import en from '@/locales/en.json';

const i18n = new I18n({ tr, en });

i18n.locale = Localization.getLocales()?.[0]?.languageCode ?? 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;

export const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, options);

export const setLocale = (locale: 'tr' | 'en') => {
  i18n.locale = locale;
};

export const getLocale = () => i18n.locale;
