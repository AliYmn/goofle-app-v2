# Gooflo -- Eksik Ozellikler ve Gorevler

Proje dokumanlarindaki (project/, brand/) spec ile mevcut kod karsilastirilarak olusturuldu.
Tarih: 2026-03-22

---

## P0 -- Kritik (Uygulama calismasini engelliyor)

- [x] **lib/images.ts olustur** -- Dosya zaten mevcuttu, sadece git'e commit edilmemisti.

---

## P1 -- Cekirdek Ozellikler (MVP icin spec'te tanimli)

### Profil ve Hesap
- [x] **Profil duzenleme ekrani** -- app/edit-profile.tsx, useAuthStore.updateProfile, avatar upload, ceviriler
- [x] **Sifre sifirlama akisi** -- app/(auth)/forgot-password.tsx, signup'a link eklendi

### Koleksiyonlar (spec: 04, bolum 3)
- [x] **Koleksiyon listeleme** -- profil ekraninda collections tab'i, FlatList ile
- [x] **Koleksiyon olusturma** -- Alert.prompt ile isim girisi
- [x] **Koleksiyona ekleme/cikarma** -- generation detail ekraninda "Add to Collection" butonu
- [x] **Koleksiyon detay ekrani** -- app/collection/[id].tsx grid gorunumu, silme

### Topluluk Modu Olusturma (spec: 02, bolum 4)
- [x] **Mod olustur ekrani** -- app/create-mod.tsx, isim/kategori/prompt formu
- [x] **Thumbnail uretimi** -- generate-mod-thumbnail edge function'a baglanildi
- [x] **Yayinla akisi** -- mods tablosuna type=community insert

### Prompt Kutuphanesi (spec: 02, bolum 3)
- [x] **Prompt listeleme** -- vote_count ile siralama
- [x] **Prompt paylasma** -- kullanici kendi prompt'unu ekleyebiliyor
- [x] **Prompt kopyalama** -- expo-clipboard ile tek dokunusla kopyala
- [x] **Prompt'tan mod olusturma** -- "Create Mod" butonu ile /create-mod'a yonlendirme

### Gunluk Challenge (spec: 03, bolum 2)
- [x] **Challenge UI** -- app/daily-challenge.tsx, TR/EN baslik, bonus kredi gosterimi
- [x] **Challenge entegrasyonu** -- claim-daily-challenge edge function baglandi

### Kredi Islem Gecmisi (spec: 03, bolum 2)
- [x] **Transaction history ekrani** -- app/transaction-history.tsx, tip etiketleri, renk kodlari
- [x] **Profil'den erisim** -- CreditPill onPress ile /transaction-history'ye yonlendirme

### Sosyal Paylasim (spec: 04, bolum 2)
- [x] **Paylasim** -- generation detail'da Share API ile calisiyor, claim-share-bonus entegre
- [ ] **Paylasim bottom sheet** -- platform-spesifik secenekler (Instagram, TikTok, WhatsApp, X) -- React Native Share API zaten platformlari gosteriyor
- [ ] **Oncesi/sonrasi format** -- source + result birlesik gorsel uretimi (canvas rendering gerekli)
- [ ] **Gooflo filigrami** -- paylasilan gorsellerde watermark (canvas rendering gerekli)

### Ayarlar Refactoru (spec: 05, Expo Router yapisi)
- [x] **Settings bolum genisletme** -- bildirim ve gizlilik satirlari eklendi (tek dosyada, gereksiz route bolunmesi onlendi)
- [x] **Bildirim ayarlari** -- gunluk hatirlatma saati satiri
- [x] **Gizlilik ayarlari** -- orijinal selfie'yi gizle secenegi
- [x] **Hesap silme akisi** -- zaten calisiyor, dogrulandi

---

## P2 -- UX Durumları (spec: 07_ux_states_and_screens.md)

### Izin Ekranlari (Pre-permission pattern)
- [x] **Pre-permission component** -- PrePermission.tsx, camera/photoLibrary/notifications destegi
- [x] **Izin reddedildi ekrani** -- isDenied prop ile "Ayarlara Git" yonlendirme

### Bakim ve Guncelleme Ekranlari
- [x] **Force update ekrani** -- ForceUpdate.tsx + useAppGate hook, app_config kontrolu
- [x] **Bakim modu ekrani** -- MaintenanceMode.tsx, 30s otomatik retry countdown

### Hata Ekrani Iyilestirmeleri
- [x] **Rate limit (429) countdown** -- ErrorState'e countdown timer, disabled button

---

## P3 -- App Store Hazirligi (spec: 06_app_store_checklist.md)

- [x] **AI ifsa metni** -- generation detail'da Badge ile "Generated with AI" gosteriliyor
- [x] **Privacy Policy URL** -- Settings'te mevcut (gooflo.yamapps.com/privacy)
- [x] **Terms of Service URL** -- Settings'te mevcut (gooflo.yamapps.com/terms)
- [x] **Support URL** -- Settings'te mevcut (support@gooflo.yamapps.com)
- [x] **Deep linking** -- iOS associatedDomains + Android intentFilters + Expo Router origin konfigurasyonu
- [x] **ATT dialog uygulamasi** -- root layout'ta analytics.init() oncesi ATT request eklendi

---

## P4 -- Iyilestirmeler

- [ ] **RevenueCat Paywalls** -- RC dashboard konfigurasyonu sonrasi aktive edilecek
- [ ] **RevenueCat Customer Center** -- RC dashboard konfigurasyonu sonrasi aktive edilecek
- [x] **NSFW filtre** -- on-generation-complete'te has_nsfw_concepts kontrolu, fail + kredi iade
- [x] **Device fingerprint** -- expo-application installationId signup metadata'ya eklendi
- [x] **Rate limiting** -- create-generation-job'da saatte 10 uretim limiti

---

## Tamamlanmis Ozellikler (referans)

- [x] Auth akislari (Apple, Google, Email)
- [x] Onboarding (3 ekran + ilk uretim)
- [x] Community Feed (ana ekran)
- [x] Mod kesfet (trending/new/top liked, arama, kategori)
- [x] Fotograf uretimi (selfie -> AI donusum -> sonuc)
- [x] Generation detail (paylasim, public/private toggle, regenerate CTA)
- [x] Mod detay sayfasi
- [x] Leaderboard (gunluk/haftalik/aylik, 3 kategori)
- [x] Pro paywall (aylik/yillik)
- [x] Kredi sistemi (bakiye, gunluk giris, Pro bonus)
- [x] Streak sistemi
- [x] Profil (galeri, istatistikler)
- [x] Dark mode
- [x] Animasyonlar + haptics
- [x] i18n (TR + EN)
- [x] 16 edge function
- [x] DB schema (14 tablo + RLS)
- [x] Splash screen
- [x] Error states (6 tur)
- [x] Empty states
- [x] Skeleton loading
- [x] Progress overlay
- [x] Toast notifications
