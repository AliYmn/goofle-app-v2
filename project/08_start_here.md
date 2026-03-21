# Gooflo — Geliştirme Başlangıç Prompt'u

Aşağıdaki prompt'u yeni bir conversation'da kullanarak geliştirmeye başla.

---

```
@brand @project

Bu iki klasördeki TÜM dosyaları oku ve içeriği tamamen anla:

brand/
├─ brand.md                  → Renk sistemi, tipografi (Nunito), maskot, design tokens, CSS değişkenleri
└─ files/                    → Logo varyantları (lime, dark, white, mascot — PNG + SVG)

project/
├─ 01_introduction.md        → Tüm özellikler özeti (fotoğraf üretimi, mod sistemi, Pro abonelik, kredi, streak, challenge, topluluk, paylaşım, koleksiyon, liderboard, prompt kütüphanesi, profil, ayarlar, moderasyon)
├─ 02_photo_generation.md    → Üretim akışı, mod türleri (standart/premium), mod öğeleri, prompt özelleştirme, topluluk modu oluşturma, prompt kütüphanesi
├─ 03_gamification.md        → Gooflo Pro avantajları, kredi maliyeti (free vs Pro tablosu), kredi paketleri, streak, günlük challenge, liderboard (günlük/haftalık/aylık)
├─ 04_social_community.md    → Community feed (ana ekran), tepkiler (like, yorum yok), "Dene" butonu, paylaşım, koleksiyonlar, profil, ayarlar
├─ 05_technical_arch.md       → Tech stack, DB şeması (14 tablo), 16 Edge Function, Expo Router yapısı, Zustand store, RLS, Storage buckets, fal.ai entegrasyonu, i18n, push notifications, moderasyon, KVKK, abuse önleme, deep linking, PostHog, EAS CI/CD
├─ 06_app_store_checklist.md  → Apple review gereksinimleri, reject riskleri, privacy nutrition labels, zorunlu URL'ler, screenshots, Info.plist permissions, submit checklist
├─ 07_ux_states_screens.md    → Splash screen, onboarding (3 ekran + ilk free üretim), hata ekranları (no connection, 5xx, 401, 404, 429, generation failed, yetersiz kredi, premium engeli), boş durumlar, izin ekranları, force update, bakım modu, loading states
└─ revenuecat.md              → SDK kurulumu, API key, entitlement (Gooflo Pro), ürünler (abonelik + kredi paketleri), webhook akışı

.env.example                  → Supabase, fal.ai, Resend, RevenueCat, PostHog, Sentry

Amacımız: Bu dokümanlara %100 bağlı kalarak React Native (Expo) mobil uygulama geliştirmek.

KURALLAR:

1. TASARIM: brand/brand.md'deki renk kodları (#BFFF00 Lime, #1A1A1A Black, #FF5C5C Coral, #F2F2F0 Off-white), tipografi (Nunito), spacing (4px grid), border-radius (min 8px), gölge kurallarına birebir uy. Gradient yok, solid renkler.

2. TECH STACK: Sadece şunları kullan — Expo Router, Supabase Auth (Email + Google + Apple), Zustand, NativeWind, expo-localization + i18n-js, fal.ai (ip-adapter-face-id), RevenueCat, Expo Notifications, PostHog, Sentry, expo-image, expo-splash-screen, @react-native-community/netinfo, expo-tracking-transparency, EAS Build + Update.

3. MİMARİ: project/05'teki DB şeması (14 tablo), Edge Functions listesi (16 fonksiyon), Expo Router dosya yapısı, Zustand store yapısını birebir takip et.

4. APPLE UYUMU: project/06'daki checklist'i baştan implemente et — Apple Sign-In, Restore Purchases butonu, ATT dialog, hesap silme, Info.plist permissions, AI ifşası.

5. UX DURUMLARI: project/07'deki tüm durumları implemente et — splash, onboarding, hata ekranları (8 farklı hata türü), boş durumlar (5 farklı), izin ekranları (pre-permission pattern), force update, bakım modu, loading states (progress + skeleton + pull-to-refresh).

6. GÜVENLİK: Email doğrulama, rate limiting, device fingerprint, NSFW filtre, report sistemi, RLS politikaları, KVKK uyumu — project/05'te detayları var.

7. MONETIZASYON: Pro abonelik (Monthly/Yearly) + kredi paketleri (50/$1.99, 120/$3.99, 300/$8.99) — ikisi birlikte. revenuecat.md'de detaylar. MVP'de reklam yok.

8. İLERLEME: Emin olmadığın bir konu olursa DUR ve SOR. Varsayımla ilerleme. Hata yapmaktansa yavaş ilerle. Her adımda ne yaptığını açıkla, büyük değişikliklerden önce onay al.

BAŞLANGIÇ SIRASI:

Adım 1: Expo projesi oluştur (create-expo-app)
Adım 2: Temel bağımlılıkları kur (NativeWind, Supabase, Zustand, expo-router, expo-image, Sentry, PostHog vb.)
Adım 3: brand/brand.md'den NativeWind tema/renk konfigürasyonu + Nunito font kurulumu
Adım 4: Splash screen (expo-splash-screen — lime arka plan + logo)
Adım 5: Expo Router dosya yapısını kur (auth, onboarding, tabs, settings, mod/[slug], generation/[id])
Adım 6: Supabase Auth bağlantısı (Email + Google + Apple sign-in)
Adım 7: Auth ekranları (login, register) — brand kurallarına uygun UI

Her adımı tamamladıktan sonra bir sonrakine geç. Adım adım ilerle.
```
