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

---

## UI/UX Audit -- Kritik Duzeltmeler (2026-03-22)

Kullanici raporu: feed yuklenmiyor, streak/credit ayni icon, tasarim premium degil.
Kaynaklar: ui-auditor agent tam raporu.

### P0 -- Aninda Duzeltilmeli (Bug / Crash)

- [x] **Feed yuklenmiyor -- initialize() try/finally eksik** -- `supabase.auth.getSession()` atarsa `isLoading: true` kalir, index.tsx sonsuza null doner. `stores/useAuthStore.ts` try/finally sarmalandi.
- [x] **StreakBadge ve CreditPill ayni icon** -- Her ikisi de `flash` + `#BFFF00`. StreakBadge soguk state'i `calendar-outline` + `#4DA8FF` yapildi.
- [x] **verify-email emoji** -- `📬` Ionicons kuralini cigniyordu. `mail-outline` ile degistirildi.
- [x] **Alert.prompt Android'de calismaz** -- Modal + TextInput ile degistirildi (profile.tsx + generation/[id].tsx).
- [x] **Explore.tsx hata yutma** -- `{ data, error }` destructure edildi, ErrorState gosteriliyor.

### P1 -- Tasarim Tutarsizliklari ve Teknik Eksikler (Gorunur / Kritik)

- [ ] **verify-email polling ve resend eksik** -- Kullanici epostayi onayladiginda uygulama otomatik fark etmiyor (polling) ve eposta gelmezse tekrar gonderemiyor (resend).
- [ ] **useAppGate cok esnek (Permissive)** -- `hooks/useAppGate.ts`'te fetch hatasi durumunda status direkt `'ok'` donuyor. Bakim modu veya zorunlu guncelleme bypass edilebilir.
- [ ] **Supabase error handling eksik** -- `app/generation/[id].tsx` ve bircok ekranda `error` objesi kontrol edilmiyor, sessiz hatalar (silent failures) olusuyor.
- [x] **`#1C1C1C` phantom renk (kismi)** -- generation/[id].tsx ve explore.tsx `bg-dark` yapildi. Kalan: ImageCard, ModCard, mod/[slug].tsx.
- [x] **`#F5F5F5` yanlis light mode bg** -- explore.tsx + profile.tsx `bg-[#F2F2F0] dark:bg-black` yapildi.
- [ ] **`#3A3A3A` raw hex 5+ yerde** -- profile.tsx'te kaliyor. `border-[#3A3A3A]` token haline getirilmeli.
- [ ] **ModCard resmi `✓` emoji** -- `<Badge label="✓">` Ionicons kuralini cigniyordu. Duzeltilmeli.
- [x] **profile.tsx `›` text chevron** -- `<Ionicons name="chevron-forward">` ile degistirildi.
- [x] **Hardcoded Turkce stringler (kismi)** -- profile.tsx, generation/[id].tsx, StreakBadge duzeltildi. Kalan: mod/[slug].tsx.
- [x] **StreakBadge `gun` label hardcoded** -- `t('streak.dayLabel')` yapildi.
- [ ] **welcome.tsx core RN Image** -- Onboarding splash asset `expo-image` ile render edilmeli (blurhash, lazy loading).
- [x] **`border-[#BFFF00]` ve `text-[#BFFF00]` raw hex** -- profile.tsx active tab `border-lime` / `text-lime` yapildi.

### P2 -- Erisilebilirlik ve Kullanici Deneyimi

- [ ] **profile.tsx static GRID_SIZE** -- `Dimensions.get` kullanimi oryantasyon degisikliklerini algilamaz. `useWindowDimensions`'a gecilmeli.
- [ ] **useAuthStore race condition riski** -- `onAuthStateChange` tetiklendiginde birden fazla `fetchUser` cakisabilir. AbortController veya timestamp kontrolu eklenmeli.
- [ ] **44pt minimum dokunu alani** -- close butonlari `w-10 h-10` (40pt). generation/[id].tsx:158, mod/[slug].tsx:110. `w-11 h-11` yapilmali.
- [x] **Search clear butonu kucuk** -- explore.tsx'te `p-2` eklendi, renk color scheme'e gore uyarlandı.
- [ ] **accessibilityLabel eksik** -- CreditPill, StreakBadge, ImageCard like/try butonlari, ModCard try butonu, Avatar, profile GenerationGridTile, explore filter tablari.
- [ ] **verify-email yeniden gonder CTA yok** -- Eposta kaybolursa kullanici tuzaga dusuyor. "Tekrar Gonder" butonu + Supabase `resend()` eklenmeli.
- [ ] **verify-email poll eksik** -- Masaustunden onaylarsa `onAuthStateChange` tetiklenmez. `supabase.auth.refreshSession()` ile 5s interval polling eklenmeli.
- [ ] **explore.tsx arama isLoading reset eksik** -- Debounce path'te skeleton gosterilmiyor, eski sonuclar cakisiyor.
- [ ] **Dimensions.get profile.tsx** -- Satir 20. `GRID_SIZE` module seviyesinde hesaplaniyor, orientation degismelerinde yeniden hesaplanmiyor. `useWindowDimensions` kullanilmali.

### P3 -- Kucuk Tutarsizliklar

- [x] **explore.tsx icon rengi light modeda gorunmez** -- `useColorScheme()` ile adaptif renk yapildi.
- [x] **explore.tsx arama placeholder i18n degil** -- `t('mods.searchPlaceholder')` yapildi.
- [ ] **signup.tsx geri butonu text, icon degil** -- `t('common.back')` text ile gorunuyor; `<Ionicons name="arrow-back">` olmali.
- [ ] **generation/[id].tsx paylasim mesaji hardcoded** -- Satir 66. `'gooflo.yamapps.com ile urettim!'` - i18n ve config sabiti olmali.
- [ ] **mod/[slug].tsx null category badge** -- `mod.category` null olabilir, bos badge render eder. Null guard eklenmeli.
- [ ] **ImageCard fallback core RN Image** -- Hata fallback'i `expo-image` olmali.

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
