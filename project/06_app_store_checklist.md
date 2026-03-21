# App Store Yayın Checklist

## Apple Review — Reject Riski Yüksek Olanlar

### 1. Apple Sign-In (Zorunlu)
- Google sign-in sunuluyorsa Apple Sign-In da sunmak **zorunlu** (Apple guideline 4.8).
- Supabase Auth'da Apple provider baştan aktif edilmeli.
- Apple Developer Console'da Sign in with Apple capability açılmalı.

### 2. Restore Purchases Butonu (Zorunlu)
- IAP (abonelik veya consumable) varsa "Satın Alımları Geri Yükle" butonu **zorunlu**.
- Settings ekranında açıkça görünür olmalı.
- RevenueCat SDK: `Purchases.restorePurchases()` ile implement edilir.

### 3. App Tracking Transparency (ATT)
- PostHog analytics kullanıldığı için iOS 14.5+ cihazlarda izleme izni istenmeli.
- `expo-tracking-transparency` paketi ile ATT dialog gösterilir.
- Kullanıcı izin vermezse analytics anonim modda çalışır.
- Info.plist'te `NSUserTrackingUsageDescription` açıklaması eklenmeli.

### 4. AI İçerik İfşası
- App Store açıklamasında AI ile görsel üretildiği açıkça belirtilmeli.
- Uygulama içinde üretilen görsellerde "AI ile üretilmiştir" notu veya watermark.
- Apple Review Notes'a AI kullanımı ve moderasyon önlemleri açıklanmalı.

### 5. Yaş Sınırı (Age Rating)
- AI fotoğraf dönüştürme + kullanıcı tarafından üretilen içerik (UGC) = en az **12+** rating.
- NSFW filtresi aktif olsa bile UGC olduğu için "Infrequent/Mild Mature/Suggestive Themes" işaretlenmeli.
- Yanlış rating = reject.

### 6. Hesap Silme (Zorunlu)
- Apple, hesap oluşturma imkanı varsa hesap silme imkanını da **zorunlu** kılıyor.
- Settings > "Hesabı Sil" butonu ile tüm kullanıcı verisi silinmeli.
- Zaten planlanmış: Edge Function `delete-account`.

---

## App Store Connect Gereksinimleri

### 7. Privacy Nutrition Labels
App Store Connect'te doğru doldurulması gereken veri toplama beyanları:

| Veri Türü | Toplanan | Kullanım Amacı |
|---|---|---|
| Fotoğraflar | Evet | Uygulama işlevselliği (AI üretimi) |
| Email adresi | Evet | Kimlik doğrulama |
| Kullanıcı adı | Evet | Uygulama işlevselliği |
| Satın alma geçmişi | Evet | Uygulama işlevselliği |
| Kullanım verileri | Evet | Analytics (PostHog) |
| Cihaz ID | Evet | Analytics |
| Crash verileri | Evet | Sentry hata takibi |

### 8. Zorunlu URL'ler

| URL | Açıklama | Durum |
|---|---|---|
| Privacy Policy | Gizlilik politikası | Hazırlanacak |
| Terms of Service | Kullanım şartları | Hazırlanacak |
| Support URL | Destek sayfası / email | Hazırlanacak |

Bu URL'ler App Store Connect'e girilmeden submit yapılamaz.

### 9. App Store Görselleri ve Metinler

**App Icon:**
- 1024x1024 PNG (alpha/transparan yok, köşeler yuvarlak olmamalı — Apple otomatik yuvarlar).
- Mevcut: `brand/files/gooflo-lime-1024px.png` kullanılabilir.

**Screenshots (zorunlu boyutlar):**

| Cihaz | Boyut | Zorunlu |
|---|---|---|
| iPhone 6.7" | 1290 x 2796 | Evet |
| iPhone 6.5" | 1284 x 2778 | Evet |
| iPhone 5.5" | 1242 x 2208 | Opsiyonel |
| iPad 12.9" | 2048 x 2732 | iPad destekleniyorsa |

- En az 3, en fazla 10 screenshot.
- İlk 3 screenshot en önemli — App Store arama sonuçlarında görünür.

**Metin:**

| Alan | İçerik | Limit |
|---|---|---|
| App Name | Gooflo | 30 karakter |
| Subtitle | Funny AI Photo Creator | 30 karakter |
| Promotional Text | Güncellenebilir, review gerektirmez | 170 karakter |
| Description | Detaylı uygulama açıklaması | 4000 karakter |
| Keywords | Arama optimizasyonu | 100 karakter |

### 10. Review Notes
İlk submit'te Apple review ekibine açıklama notu yazılmalı:
- Demo hesap bilgileri (test login).
- AI kullanımı ve moderasyon politikası açıklaması.
- NSFW filtreleme mekanizmasının açıklaması.
- IAP ürünlerinin açıklaması.

---

## Teknik Gereksinimler (Build Öncesi)

### 11. EAS Build Konfigürasyonu
- `eas.json` dosyasında `production` profili oluşturulmalı.
- Bundle identifier: `com.gooflo.app` (Apple Developer + App Store Connect'te kayıtlı olmalı).
- Provisioning profile ve distribution certificate hazır olmalı.

### 12. Info.plist Permissions
Expo `app.json` / `app.config.js` içinde tanımlanacak izinler:

| İzin | Key | Açıklama |
|---|---|---|
| Kamera | `NSCameraUsageDescription` | Selfie çekmek için |
| Fotoğraf Galerisi | `NSPhotoLibraryUsageDescription` | Fotoğraf yüklemek için |
| Bildirimler | Push Notifications capability | Streak/challenge hatırlatma |
| Tracking | `NSUserTrackingUsageDescription` | Analytics (PostHog) |

### 13. Abonelik Detay Sayfası
- Apple, abonelik uygulamalarında kullanıcıya gösterilmesi gereken bilgileri zorunlu kılıyor:
  - Abonelik süresi ve fiyatı.
  - Otomatik yenileme bilgisi.
  - İptal ve yönetim yönlendirmesi.
- RevenueCat Paywall ve Customer Center bu gereksinimleri karşılar.

---

## Submit Öncesi Son Kontrol

- [ ] Apple Sign-In çalışıyor
- [ ] Google Sign-In çalışıyor
- [ ] Email doğrulama çalışıyor
- [ ] Restore Purchases butonu Settings'te mevcut ve çalışıyor
- [ ] ATT dialog gösteriliyor (PostHog analytics öncesi)
- [ ] NSFW filtre aktif ve çalışıyor
- [ ] Report butonu mevcut ve çalışıyor
- [ ] Hesap silme çalışıyor (tüm veri temizleniyor)
- [ ] Privacy Policy URL erişilebilir
- [ ] Terms of Service URL erişilebilir
- [ ] Support URL erişilebilir
- [ ] AI ifşası uygulama içinde ve App Store açıklamasında mevcut
- [ ] Tüm Info.plist permission açıklamaları Türkçe + İngilizce
- [ ] Screenshots hazır (6.7" ve 6.5")
- [ ] App Store metinleri hazır (name, subtitle, description, keywords)
- [ ] Review Notes yazıldı (demo hesap + AI açıklaması)
- [ ] Pro abonelik ve kredi paketleri App Store Connect'te tanımlı
- [ ] RevenueCat production API key ayarlandı
- [ ] Sentry production DSN ayarlandı
- [ ] EAS production build başarılı
