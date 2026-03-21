# Gooflo — TODO

## Mevcut Görev
**Faz 9+ — App Store Hazırlığı & Production** (aktif)

_Son smoke test: `expo export --platform ios` → exit 0 ✅ (Mar 21, 2026)_

---

## ✅ Tamamlanan Fazlar

### Faz 0 — Tooling & İskelet
- [x] package.json (Expo SDK 54, tüm bağımlılıklar)
- [x] app.json, tsconfig.json, babel.config.js, metro.config.js
- [x] tailwind.config.js + global.css (NativeWind + dark mode)
- [x] Makefile, eas.json, .gitignore
- [x] lib/supabase.ts (client + 15 tablo Row/Insert/Update types)
- [x] stores/ (7 Zustand: auth, credit, streak, generation, subscription, feed, theme)
- [x] supabase/config.toml + 16 Edge Function stub'ları
- [x] lib/i18n.ts + locales/tr.json + locales/en.json

### Faz 1 — Design System & Component Library
- [x] NativeWind tokens (lime #BFFF00, dark #1A1A1A, coral #FF5C5C)
- [x] Nunito font entegrasyonu
- [x] Dark/Light/System tema (useThemeStore + MMKV persist)
- [x] Component library: Button, Badge, Avatar, CreditPill, StreakBadge
- [x] Component library: ModCard, ImageCard, EmptyState, Skeleton, Toast
- [x] Component library: ProgressOverlay, BottomSheet wrapper

### Faz 2 — Splash Screen & Routing
- [x] Expo Router tab layout (index, explore, create, leaderboard, profile)
- [x] Auth guard (_layout.tsx) — session/onboarding yönlendirmesi
- [x] app/index.tsx redirect mantığı

### Faz 3 — Auth & Supabase
- [x] supabase/migrations/ (tüm 15 tablo + RLS politikaları)
- [x] lib/auth.ts (Apple, Google, Email sign-in/sign-up)
- [x] useAuthStore (session, user, initialize, signOut, fetchUser)
- [x] app/(auth)/login.tsx, signup.tsx, verify-email.tsx
- [x] Sentry entegrasyonu (lib/sentry.ts + _layout.tsx init)

### Faz 4 — Onboarding & Analitik
- [x] app/(onboarding)/welcome.tsx, how-it-works.tsx, first-generate.tsx
- [x] lib/analytics.ts (PostHog: init, identify, track, named events)
- [x] lib/purchases.ts (RevenueCat: init, identifyCustomer, purchase, restore)
- [x] RevenueCat + PostHog init → _layout.tsx
- [x] useSubscriptionStore wired (isPro senkronizasyonu)
- [x] i18n validation key'leri tamamlandı

### Faz 5 — Fotoğraf Üretimi (fal.ai)
- [x] supabase/migrations/20240101000005_functions.sql (deduct_credits, add_credits, increment_mod_usage, update_streak)
- [x] Edge Function: create-generation-job (kredi doğrulama, fal.ai submit, DB kayıt)
- [x] Edge Function: on-generation-complete (webhook, streak güncelle, push bildirim, kredi iade)
- [x] Edge Function: check-generation-status (polling endpoint)
- [x] Edge Function: claim-daily-login (idempotent, Pro bonus)
- [x] hooks/useGeneration.ts (submit + 3s polling, status makinesi)
- [x] app/(tabs)/create.tsx (image picker + kamera izni + ProgressOverlay)
- [x] supabase/functions/tsconfig.json (Deno lint isolation)

### Faz 6 — Community Feed & Explore
- [x] app/(tabs)/index.tsx (real Supabase query, pagination, like sync, daily login claim)
- [x] app/(tabs)/explore.tsx (real mods query, search debounce, sort filter, "Dene" butonu)
- [x] ModCard bileşenine onTryPress eklendi
- [x] Skeleton bileşenine style prop eklendi

### Faz 7 — Profil & Ayarlar & Paywall
- [x] app/(tabs)/profile.tsx (generations grid, streak stats, tab sistemi)
- [x] app/settings.tsx (tema seçici, restore purchases, sign out, delete account)
- [x] app/pro.tsx (RevenueCat paywall, monthly/yearly plan seçimi)

### Faz 8 — Mod Detay & Hesap Silme
- [x] app/mod/\[slug\].tsx (real mod data, like toggle, credit maliyet gösterimi)
- [x] app/generation/\[id\].tsx (result image, public/private toggle, share)
- [x] Edge Function: delete-account (admin deleteUser + CASCADE)

---

## 🔄 Sıradaki (Öncelik Sırası)

### Kritik — Pre-launch
- [ ] `supabase db push` (migration'ları production'a uygula)
- [ ] `supabase functions deploy --all` (tüm edge function'ları deploy et)
- [ ] Expo env vars `.env` dosyasını EAS Secrets'a yükle
- [ ] EAS Build — iOS: `eas build --platform ios --profile preview`
- [ ] TestFlight'a yükle ve cihazda test et

### Faz 9 — Tamamlanan
- [x] leaderboard.tsx — real Supabase leaderboard_entries query (period + category filter)
- [x] Push notification token kaydı (_layout.tsx → registerPushToken → users.push_token)
- [x] /pro route Stack.Screen + modal presentation eklendi
- [x] ImageCardSkeleton unused import temizlendi (profile.tsx)
- [x] `expo export --platform android` smoke test → exit 0 ✅
- [x] Edge Function: claim-share-bonus (idempotent, add_credits RPC)
- [x] generation/\[id\].tsx → share sonrası claim-share-bonus çağrısı + kredi toast

### Tüm Edge Functions Tamamlandı (16/16)
- [x] create-generation-job, on-generation-complete, check-generation-status
- [x] claim-daily-login, claim-pro-daily-bonus, claim-share-bonus, claim-daily-challenge
- [x] delete-account, report-content, process-purchase, process-subscription
- [x] send-push-notification, send-email (Resend)
- [x] check-streaks, sync-leaderboard, generate-mod-thumbnail

- [x] i18n audit: tüm key'ler mevcut (credits.shareBonus, pro.*, common.back ...)
- [x] EXPO_PUBLIC_EAS_PROJECT_ID .env.example'a eklendi
- [x] Schema fix: check-streaks → users tablosunu kullanacak şekilde düzeltildi
- [x] Schema fix: report-content → reports tablosu + doğru kolon isimleri
- [x] Migration 006: credit_transactions.reference_id + add_credits RPC güncellendi
- [x] CreditTransactionRow type'a reference_id eklendi
- [x] pro.tsx: purchasePackage return değeri kontrolü düzeltildi
- [x] leaderboard.tsx period_start: ISO timestamp → YYYY-MM-DD (DATE kolon uyumu)
- [x] leaderboard.tsx: .gte → .eq (period_start exact match)
- [x] sync-leaderboard getPeriodStart: ISO timestamp → YYYY-MM-DD
- [x] Son iOS smoke test → exit 0 ✅ (Mar 21, 2026)

### Önemli — Eksik Özellikler
- [ ] collection/\[id\].tsx — koleksiyon detay ekranı (stub mevcut, MVP için yeterli)
- [ ] prompt-library.tsx — prompt kütüphanesi (stub mevcut, MVP için yeterli)

### Teknik Borç
- [ ] /pro route tipi lint hatası (stale types — `expo export` sonrası otomatik düzelir)
- [ ] RLS politikaları prod'da doğrula (service role vs anon key)

### App Store Hazırlığı
- [ ] App Store screenshots (6.5", 5.5")
- [ ] App Privacy manifest (PrivacyInfo.xcprivacy)
- [ ] App Store Connect metadata (TR + EN açıklamalar)
- [ ] Production Supabase URL + keys → EAS Secrets
- [ ] `eas submit --platform ios`
