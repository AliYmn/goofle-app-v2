# Gooflo — Lessons Learned

## Faz 0 Notlar

### SDK Versiyonu
- `create-expo-app@latest` Expo SDK 55 kuruyor (React 19, RN 0.83). Plan SDK 54 gerektiriyor.
- Çözüm: `package.json` manuel yazıldı, `expo: ~54.0.0` pinlendi. `npx expo install --fix` ile peer dep uyumluluğu sağlanacak.

### Proje Dizini
- Mevcut dizinde `brand/`, `project/`, `.env` vardı — `create-expo-app` mevcut dizine kurulamıyor.
- Çözüm: `/tmp/gooflo-temp`'de oluşturup template referansı alındı, asıl dizine manuel kurulum yapıldı.

### NativeWind
- `metro.config.js` için `withNativeWind` wrapper gerekiyor.
- `babel.config.js`'te `jsxImportSource: 'nativewind'` zorunlu.
- `darkMode: 'class'` + CSS variables (`--surface-primary` vb.) → semantic token sistemi.

### MMKV + Supabase Auth
- `AsyncStorage` yerine `react-native-mmkv` kullanılıyor (daha hızlı, native).
- Supabase auth storage adaptor: `{ getItem, setItem, removeItem }` interface.

### i18n
- `i18n-js` + `expo-localization` kombinasyonu.
- Tüm UI string'leri `t('key')` ile — hardcoded metin yasak.
- İskelet locales Faz 0'da oluşturuldu; her fazda eksik key'ler eklenir.

### Type Safety
- `lib/supabase.ts` içinde 15 tablonun tüm Row/Insert/Update type'ları tanımlandı.
- `onboarding_free` ve `challenge_bonus` credit_transactions type'larına eklendi (doküman eksikliği).
- `generations.blurhash` ve `mods.thumbnail_blurhash` kolonları type'lara eklendi (kullanıcı önerisi).
