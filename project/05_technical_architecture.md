# Teknik Mimari

## Genel Bakış

Gooflo, **backend sunucusu olmadan** çalışan bir mobil uygulamadır. Tüm backend ihtiyaçları Supabase (veritabanı, auth, storage, Edge Functions) ve üçüncü parti servisler aracılığıyla karşılanır.

**Dil desteği:** Türkçe ve İngilizce.

---

## Teknoloji Yığını

| Katman | Teknoloji | Kullanım Amacı |
|---|---|---|
| Mobil Framework | **Expo (React Native)** | Cross-platform mobil uygulama (iOS & Android) |
| Navigasyon | **Expo Router** | File-based routing, temiz auth flow |
| Kimlik Doğrulama | **Supabase Auth** | Email + Google/Apple sign-in (magic link opsiyonel) |
| State Management | **Zustand** | Global state (kredi, streak, kullanıcı bilgileri) |
| Styling | **NativeWind** | Tailwind CSS for React Native (+ gerekirse StyleSheet) |
| Lokalizasyon | **expo-localization + i18n-js** | Türkçe / İngilizce dil desteği |
| Veritabanı | **Supabase (PostgreSQL)** | Tüm uygulama verisi |
| Dosya Depolama | **Supabase Storage** | Fotoğraflar, görseller, thumbnail'lar |
| Sunucusuz Fonksiyonlar | **Supabase Edge Functions** | Güvenli API çağrıları (fal.ai, kredi, hassas operasyonlar) |
| Yapay Zeka | **fal.ai** | ip-adapter-face-id + image-to-image (use-case'e göre netleşecek) |
| Uygulama İçi Satın Alma | **RevenueCat** | Pro abonelik (Monthly/Yearly) + kredi paketleri (consumable IAP) |
| Push Bildirimleri | **Expo Notifications** | Streak hatırlatma, kredi bildirimleri |
| E-posta | **Resend** | İşlemsel e-postalar (hoş geldin, hatırlatma vb.) |
| Tracking İzni | **expo-tracking-transparency** | ATT dialog (iOS 14.5+ zorunlu, PostHog öncesi) |
| Analitik | **PostHog** | Kullanıcı davranışı, funnel, retention takibi |
| Görsel Bileşeni | **expo-image** | Performanslı image rendering + built-in cache |
| Splash | **expo-splash-screen** | Native splash + animated geçiş |
| Network | **@react-native-community/netinfo** | Bağlantı durumu izleme |
| CI/CD | **EAS Build + EAS Update** | Build pipeline + OTA güncellemeler |
| Hata Takibi | **Sentry** | Hata izleme, performans raporlama |

---

## Mimari Akış

### Fotoğraf Üretimi Akışı (Job Sistemi + Polling)

Üretim süreci 5–15 saniye sürdüğü için asenkron bir job sistemi kullanılır:

```
Kullanıcı (Expo App)
  │
  ├─ 1. Selfie yükler → Supabase Storage
  ├─ 2. Mod seçer (varsayılan prompt veya özelleştirilmiş prompt)
  ├─ 3. "Üret" butonuna basar
  │
  ├─ 4. Edge Function: create-generation-job
  │     ├─ Kredi bakiyesi kontrol edilir
  │     ├─ Pro mu kontrol edilir (premium mod erişim + %50 indirim)
  │     ├─ Yeterliyse: kredi düşülür (free: 1/erişim yok, Pro: 1/1–2)
  │     ├─ generations tablosuna status=pending kayıt oluşturulur
  │     ├─ fal.ai API'ye asenkron istek gönderilir (ip-adapter-face-id)
  │     └─ job_id kullanıcıya döndürülür
  │
  ├─ 5. Client: Progress UI gösterilir (loading animasyonu)
  │     └─ Polling ile job durumu kontrol edilir (2-3 sn aralıklarla)
  │
  ├─ 6. fal.ai tamamlandığında:
  │     ├─ Üretilen görsel Supabase Storage'a kaydedilir
  │     ├─ generations kaydı güncellenir (status=completed, result_image_url)
  │     └─ Streak güncellenir
  │
  └─ 7. Client polling ile completed durumu yakalar → sonuç ekranı gösterilir
```

### Kimlik Doğrulama Akışı

```
Kullanıcı → Supabase Auth (Email / Google / Apple sign-in)
  │
  ├─ Supabase oturum oluşturur (JWT token)
  ├─ İlk giriş kontrolü: users tablosunda kayıt var mı?
  │     ├─ Yoksa: user row oluşturulur + 20 başlangıç kredisi tanımlanır
  │     └─ Varsa: mevcut kullanıcı bilgileri yüklenir
  └─ Zustand store güncellenir (kredi, streak, profil)

* Magic link opsiyonel olarak desteklenir.
```

### Satın Alma Akışı (Kredi Paketleri)

```
Kullanıcı → RevenueCat Paywall (paket seçimi)
  │
  ├─ Kredi paketleri (consumable — herkes satın alabilir):
  │     ├─ 50 kredi  → $1.99
  │     ├─ 120 kredi → $3.99 (best value)
  │     └─ 300 kredi → $8.99
  │
  ├─ Apple/Google ödeme ekranı açılır
  ├─ Ödeme onaylanır → RevenueCat webhook tetiklenir
  ├─ Supabase Edge Function: process-purchase
  │     ├─ RevenueCat ile server-side doğrulama
  │     ├─ Kredi bakiyesi güncellenir
  │     └─ credit_transactions kaydı oluşturulur
  └─ Zustand store güncellenir
```

### Abonelik Akışı (Gooflo Pro)

```
Kullanıcı → RevenueCat Paywall (Pro plan seçimi)
  │
  ├─ Plan seçenekleri:
  │     ├─ Monthly → TBD
  │     └─ Yearly  → TBD
  │
  ├─ Apple/Google ödeme ekranı açılır
  ├─ Ödeme onaylanır → RevenueCat webhook tetiklenir
  ├─ Supabase Edge Function: process-subscription
  │     ├─ RevenueCat ile server-side doğrulama
  │     ├─ Entitlement kontrol: "Gooflo Pro" aktif mi?
  │     ├─ users tablosu güncellenir (is_pro=true, pro_expires_at)
  │     └─ Günlük +5 Pro kredi tanımlanmaya başlar
  └─ Zustand store güncellenir (Pro state)

* İptal/yenileme/süre dolumu RevenueCat webhook ile otomatik yönetilir.
```

---

## Expo Router Yapısı

```
app/
├─ _layout.tsx              # Root layout (Supabase Auth provider, Zustand)
├─ (auth)/                   # Auth group (giriş yapmamış kullanıcılar)
│   ├─ _layout.tsx
│   ├─ login.tsx
│   └─ register.tsx
├─ (onboarding)/             # İlk kayıt sonrası walkthrough (2–3 ekran + ilk free generate)
│   ├─ _layout.tsx
│   ├─ welcome.tsx
│   ├─ how-it-works.tsx
│   └─ first-generate.tsx
├─ (tabs)/                   # Ana uygulama (giriş yapmış kullanıcılar)
│   ├─ _layout.tsx           # Tab navigator
│   ├─ index.tsx             # Ana ekran (Community Feed)
│   ├─ explore.tsx           # Mod keşfet
│   ├─ create.tsx            # Fotoğraf üret
│   ├─ leaderboard.tsx       # Sıralama tablosu
│   └─ profile.tsx           # Profil
├─ mod/[slug].tsx            # Mod detay sayfası
├─ generation/[id].tsx       # Üretim sonuç sayfası
├─ collection/[id].tsx       # Koleksiyon detay
├─ settings/                 # Ayarlar
│   ├─ index.tsx             # Restore Purchases butonu burada
│   ├─ notifications.tsx
│   ├─ privacy.tsx
│   └─ delete-account.tsx    # Hesap silme (Apple zorunlu)
└─ prompt-library.tsx        # Prompt kütüphanesi
```

---

## Zustand Store Yapısı

```
stores/
├─ useAuthStore.ts           # Kullanıcı oturumu, profil bilgileri, is_pro durumu
├─ useCreditStore.ts         # Kredi bakiyesi, işlem geçmişi
├─ useStreakStore.ts          # Günlük streak, en uzun streak
├─ useGenerationStore.ts     # Job durumu, polling, progress, sonuç
├─ useSubscriptionStore.ts   # Pro abonelik durumu, entitlement, RevenueCat sync
├─ useFeedStore.ts           # Community feed, beğeniler
└─ useThemeStore.ts          # Dark/Light/System tema tercihi (MMKV persist)
```

---

## Supabase Veritabanı (Temel Tablolar)

### users
İlk giriş sırasında oluşturulan kullanıcı kaydı.
- id (Supabase Auth uid), username, bio, avatar_url
- credit_balance, current_streak, longest_streak, last_generation_date
- is_pro (boolean), pro_expires_at (nullable timestamp)
- revenuecat_customer_id
- language_preference (tr / en)
- push_token (Expo Notifications)
- notification_hour (varsayılan: 20, kullanıcı ayarlayabilir)
- onboarding_completed (boolean)
- created_at

### mods
Tüm dönüşüm modları.
- id, name, slug, prompt, thumbnail_url, thumbnail_blurhash
- category, type (official / community)
- creator_id (topluluk modları için)
- is_prompt_public (prompt görünürlüğü — resmi modlarda false)
- is_premium (boolean — true ise sadece Pro kullanıcılar erişebilir)
- credit_cost (standart: 1, premium: 2–3; Pro kullanıcıya %50 indirimli)
- like_count, usage_count, share_count
- created_at

### generations
Üretilen her görsel (job sistemi ile).
- id, user_id, mod_id
- source_image_url, result_image_url, blurhash
- custom_prompt (kullanıcı özelleştirdiyse)
- status (pending / processing / completed / failed)
- fal_job_id (fal.ai request tracking)
- is_public (topluluk akışında gösterilsin mi)
- created_at, completed_at

### credit_transactions
Kredi hareketleri geçmişi.
- id, user_id, amount (+/-), type (signup_bonus / daily_login / pro_daily_bonus / share_bonus / purchase / generation)
- description, created_at

### collections
Kullanıcı koleksiyonları.
- id, user_id, name, cover_image_url
- created_at

### collection_items
Koleksiyona eklenen görseller.
- id, collection_id, generation_id
- created_at

### likes
Topluluk akışındaki beğeniler (MVP: sadece like).
- id, user_id, generation_id
- created_at

### daily_challenges
Günlük görevler.
- id, title_tr, title_en, description_tr, description_en
- challenge_type, target_mod_id (varsa)
- bonus_credits, active_date
- created_at

### user_challenges
Kullanıcının challenge tamamlama durumu.
- id, user_id, challenge_id, completed_at

### leaderboard_entries
Sıralama tablosu verileri.
- id, user_id, period_type (daily / weekly / monthly)
- period_start, score, ranking_category
- created_at

### app_config
Uygulama geneli konfigürasyon (remote config).
- id, key, value
- Kullanım: minimum_app_version (force update), maintenance_mode (boolean)
- updated_at

### prompt_library
Paylaşılan prompt'lar.
- id, user_id, prompt_text, vote_count
- created_at

### reports
İçerik raporlama.
- id, reporter_id, target_type (generation / mod / user)
- target_id, reason, status (pending / reviewed / resolved / dismissed)
- admin_note, created_at, resolved_at

---

## Supabase Edge Functions

Hassas işlemler client tarafında değil, Edge Functions üzerinden yapılır:

| Fonksiyon | Görev |
|---|---|
| `create-generation-job` | Kredi düşme, generations kaydı oluşturma, fal.ai'ye asenkron istek başlatma |
| `check-generation-status` | Client polling — job durumu kontrol, tamamlandıysa sonuç döndür |
| `on-generation-complete` | fal.ai callback/webhook — görseli Storage'a kaydet, streak güncelle, status=completed |
| `claim-daily-login` | Günlük giriş kredisi tanımlama (çift kazanım engeli) |
| `claim-share-bonus` | Paylaşım bonusu (günde 1 kez kontrolü) |
| `process-purchase` | RevenueCat webhook → kredi paketi server-side doğrulama, kredi tanımlama |
| `process-subscription` | RevenueCat webhook → Pro abonelik doğrulama, is_pro güncelleme, iptal/yenileme |
| `claim-pro-daily-bonus` | Pro kullanıcılara günlük +5 kredi tanımlama |
| `send-email` | Resend üzerinden e-posta gönderimi |
| `sync-leaderboard` | Günlük/haftalık/aylık liderboard hesaplama (cron) |
| `send-push-notification` | Expo Notifications üzerinden bildirim gönderimi |
| `check-streaks` | Gece yarısı çalışan cron: bozulan streak'leri sıfırla |
| `delete-account` | Kullanıcı hesabını ve tüm verisini tamamen sil (KVKK/Apple uyumu) |
| `report-content` | İçerik raporlama (generation, mod, user) |
| `generate-mod-thumbnail` | Topluluk modu oluşturulurken prompt'tan otomatik thumbnail üret |

---

## Supabase Row Level Security (RLS)

Veritabanı güvenliği için RLS politikaları:

- Kullanıcılar sadece kendi credit_transactions, collections kayıtlarını görebilir.
- users tablosu: herkes username, avatar, streak görebilir; sadece sahibi hassas bilgileri (credit_balance, push_token) görebilir.
- generations: is_public=true olanlar herkese açık; private olanlar sadece sahibine.
- Mod istatistikleri (like_count, usage_count) herkese açık okunabilir.
- Kredi bakiyesi güncellemesi sadece Edge Functions (service_role) ile yapılabilir.
- likes tablosu: herkes okuyabilir, sadece kendi beğenisini ekleyip silebilir.

---

## Dosya Depolama (Supabase Storage)

| Bucket | İçerik | Erişim |
|---|---|---|
| `avatars` | Profil fotoğrafları | Public |
| `source-photos` | Yüklenen selfie'ler | Private (sadece sahibi) |
| `generated-images` | Üretilen görseller | Public (is_public=true) / Private |
| `mod-thumbnails` | Mod kapak görselleri | Public |

---

## fal.ai Entegrasyonu

- **Model:** İlk etapta `ip-adapter-face-id` + image-to-image. Use-case'e göre model seçimi netleşecek.
- **Çağrı yeri:** Sadece Supabase Edge Functions üzerinden (FAL_KEY client'a açık değil).
- **Girdi:** Kullanıcının selfie'si + modun prompt'u (veya özelleştirilmiş prompt).
- **Çıktı:** Dönüştürülmüş görsel → Supabase Storage'a kaydedilir.
- **Asenkron işlem:** fal.ai isteği başlatılır → job_id döner → polling ile durum kontrol edilir → tamamlanınca callback/webhook tetiklenir.

---

## Çoklu Dil Desteği (i18n)

Uygulama Türkçe ve İngilizce destekler. **expo-localization** + **i18n-js** kullanılır.

```
locales/
├─ tr.json    # Türkçe çeviriler
└─ en.json    # İngilizce çeviriler
```

- `expo-localization` ile cihaz dili algılanır, `i18n-js` ile çeviri uygulanır.
- Tüm UI metinleri çeviri dosyalarından okunur (`i18n.t('home.title')`).
- Günlük challenge başlıkları ve açıklamaları veritabanında her iki dilde tutulur (title_tr, title_en, description_tr, description_en).
- Kullanıcının dil tercihi profilde saklanır. Varsayılan: cihaz dili.

---

## Push Bildirimleri (Expo Notifications)

- **Streak hatırlatma:** Gün bitmeden üretim yapılmadıysa hatırlatma.
- **Kredi bildirimi:** Günlük giriş kredisi kazanıldığında.
- **Mod kullanıldı:** "Biri senin modunu kullandı" bildirimi.
- **Günlük challenge:** Yeni günlük görev hatırlatması.
- **Varsayılan bildirim saati:** 20:00 (kullanıcının lokal saati). Kullanıcı Settings > Notifications'tan değiştirebilir.
- Push token kullanıcı kaydında saklanır, Edge Function üzerinden gönderilir.

---

## İçerik Moderasyonu

### NSFW Filtre
- Üretilen her görsel fal.ai çıktısı sonrası otomatik NSFW kontrolünden geçer.
- NSFW tespit edilirse görsel kaydedilmez, kullanıcıya uyarı gösterilir, kredi iade edilir.

### Report (Raporlama)
- Topluluk akışındaki her gönderide ve mod detay sayfasında **"Raporla"** butonu.
- Raporlanan içerikler admin review kuyruğuna düşer.

### Admin Review
- Supabase üzerinde admin paneli veya basit bir dashboard ile raporlanmış içerikler incelenir.
- Onaylanan raporlarda: içerik gizlenir/silinir, tekrarlayan ihlallerde kullanıcı uyarılır/banlanır.

---

## Gizlilik ve Uyum (Privacy / KVKK)

- **Privacy Policy:** Uygulama içinden ve App Store listesinden erişilebilir gizlilik politikası.
- **Account Deletion:** Apple zorunluluğu — kullanıcı hesabını tamamen silebilir (Settings > Hesap Sil).
  - Silme işlemi: user row, tüm generations, collections, credit_transactions, Supabase Auth kaydı, Storage'daki fotoğraflar temizlenir.
  - Edge Function: `delete-account`
- **Data Deletion:** Kullanıcı isterse sadece verilerini silebilir (hesabı kapatmadan).
- **KVKK Uyumu:** Kişisel veri işleme (yüz verisi dahil) için açık rıza, aydınlatma metni.

---

## Abuse Önleme

- **Email doğrulama:** Kayıt sonrası email doğrulaması zorunlu (Supabase Auth confirm email).
- **Rate limiting:** Edge Functions üzerinde istek limiti (generation: kullanıcı başına X/saat).
- **Device bazlı limit:** Device fingerprint ile aynı cihazdan çoklu hesap açılması tespit edilir.

---

## Deep Linking

Expo Router ile universal links / app links baştan kurulur.

- `gooflo.app/mod/[slug]` → Mod detay sayfası
- `gooflo.app/g/[id]` → Üretim sonuç sayfası (paylaşılan görseller)
- `gooflo.app/collection/[id]` → Koleksiyon sayfası
- Paylaşım linkleri dış platformlarda (Instagram, WhatsApp vb.) tıklandığında uygulamaya yönlendirir; uygulama yoksa web fallback.

---

## Analitik (PostHog)

- **Funnel takibi:** Kayıt → ilk üretim → paylaşım → ikinci üretim
- **Retention:** Günlük/haftalık aktif kullanıcı
- **Feature kullanımı:** Hangi modlar, challenge tamamlama oranı, Pro dönüşüm
- **Revenue:** Kredi paketi satışları, Pro abonelik dönüşümü

---

## CI/CD (EAS Build + EAS Update)

- **EAS Build:** iOS ve Android build pipeline (development, preview, production profilleri).
- **EAS Update:** OTA güncellemeler ile JS bundle güncellemeleri store review beklemeden yayınlanır.
- **Branching:** `main` → production, `develop` → preview builds.

---

## Topluluk Modu Oluşturma Akışı

```
Kullanıcı → "Mod Oluştur" ekranı
  │
  ├─ 1. Mod ismi, kategori ve prompt girer
  ├─ 2. "Thumbnail Oluştur" butonuna basar
  │     └─ Edge Function: fal.ai ile prompt'tan otomatik thumbnail üretilir
  ├─ 3. Thumbnail onaylanır veya yeniden üretilir
  ├─ 4. "Yayınla" → mods tablosuna kaydedilir (type=community)
  └─ 5. Mod topluluk akışında ve keşfet sayfasında görünür
```

*Manuel thumbnail upload ileride eklenebilir.*

---

## Hata Takibi (Sentry)

- Runtime hataları otomatik yakalanır.
- Sourcemap desteği ile production hatalarında okunabilir stack trace.
- Performans izleme (yavaş ekranlar, API gecikmeleri).
