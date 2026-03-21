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

---

## Faz 5-10 Notlar

### Expo Router — Yeni Route Tip Sorunu
- Yeni bir `app/X.tsx` dosyası oluşturulduğunda Expo Router'ın otomatik oluşturulan TypeScript tipleri (`expo-env.d.ts`) stale kalır.
- `router.push('/X')` için "Argument not assignable" lint hatası alınır.
- Çözüm: `npx expo export` veya `npx expo start` yeniden çalıştırılınca tipler otomatik yenilenir. Kod doğrudur.

### Expo ImagePicker v16 API
- `result.cancelled` → `result.canceled` (c**a**nceled, tek 'l')
- URI: `result.assets[0].uri` (eski: `result.uri`)
- Kamera izni: `ImagePicker.requestCameraPermissionsAsync()` (Camera modülü değil)

### Deno Edge Function Lint Uyarıları
- IDE'nin TypeScript server'ı Deno global'lerini (`Deno`, `Response`, `fetch`) tanımaz.
- Bunlar `supabase/functions/tsconfig.json` ile deploy zamanında bastırılır.
- Aksiyona gerek yok — `supabase functions deploy` üzerinde sıfır etkisi var.

### purchasePackage Return Semantiği
- `lib/purchases.ts` → `purchasePackage()` asla throw etmez, `{ success, error? }` döndürür.
- try/catch yerine return value kontrol edilmeli: `if (!result.success && result.error) Alert.alert(...)`

### Zustand Store Method İsimleri
- `useCreditStore.refreshBalance(userId)` — userId argümanı zorunlu.
- `useStreakStore.refreshStreak(userId)` — userId argümanı zorunlu.
- `useGenerationStore.setSelectedMod(mod)` — create tab'a mod geçmek için kullanılır.

### Push Notification Token
- `Notifications.getExpoPushTokenAsync({ projectId })` — `EXPO_PUBLIC_EAS_PROJECT_ID` gerekir.
- `.env.example`'a eklenmeli ve EAS Secrets'a set edilmeli.

### RevenueCat Webhook (process-subscription)
- `REVENUECAT_WEBHOOK_SECRET` env var'ı tanımlanmamışsa webhook doğrulama atlanır (güvenli değil).
- Prod'da mutlaka set edilmeli.

### Edge Function Idempotency Pattern
- credit_transactions tablosunda `(user_id, type, reference_id)` kombinasyonu unique constraint ile idempotency sağlanır.
- Her bonus/reward function'ı bu pattern'ı kullanmalı: daily_login, share_bonus, challenge_bonus, pro_daily_bonus, purchase.
