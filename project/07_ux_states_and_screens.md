# UX Durumları ve Özel Ekranlar

## 1. Splash Screen

Uygulama açılırken gösterilen ilk ekran.

- **Görsel:** Lime (#BFFF00) arka plan üzerinde Gooflo maskotu + "gooflo." logosu.
- **Süre:** Supabase Auth oturum kontrolü tamamlanana kadar (genellikle 1–2 sn).
- **Geçiş:**
  - Oturum varsa + onboarding tamamlanmış → Ana ekran (tabs).
  - Oturum varsa + onboarding tamamlanmamış → Onboarding.
  - Oturum yoksa → Auth (login/register).
- **Teknik:** `expo-splash-screen` ile native splash + custom animated splash.

---

## 2. Onboarding (Ürün Tanıtımı)

İlk kayıt sonrası gösterilen 2–3 ekranlık walkthrough. Ürünü tanıtır ve ilk üretimi yaptırır.

### Ekran 1 — Welcome
- Maskot karşılama animasyonu.
- "gooflo." logosu + tagline: "Make it weird. Make it viral."
- "Başla" butonu.
- Language veya diger onemli ozellikler default secilerek ilertebiliriz.

### Ekran 2 — Nasıl Çalışır
- 3 adımlı mini infographic:
  1. Selfie çek / yükle
  2. Bir mod seç
  3. AI dönüştürsün
- Her adımda kısa animasyon veya illüstrasyon.

### Ekran 3 — İlk Üretim
- Kullanıcıyı doğrudan ilk fotoğraf üretimine yönlendirir.
- Önceden seçilmiş popüler bir mod ile hızlı deneyim.
- İlk üretim ücretsiz (20 krediden düşülmez).
- Üretim tamamlandığında kutlama animasyonu + "Ana ekrana git" butonu.

**Tamamlandıktan sonra:** `onboarding_completed = true` olarak güncellenir, bir daha gösterilmez.

---

## 3. Hata Ekranları

### 3.1 Ağ Hatası (No Connection)
- **Tetiklenir:** İnternet bağlantısı yokken herhangi bir işlem denendiğinde.
- **Görsel:** Maskot üzgün/şaşkın ifade + "Bağlantı yok" mesajı.
- **Aksiyon:** "Tekrar Dene" butonu.
- **Teknik:** `@react-native-community/netinfo` ile bağlantı durumu izlenir.

### 3.2 Sunucu Hatası (5xx / Edge Function Hatası)
- **Tetiklenir:** Supabase Edge Function veya fal.ai'den 5xx yanıt geldiğinde.
- **Görsel:** Maskot "oops" ifadesi + "Bir şeyler ters gitti" mesajı.
- **Aksiyon:** "Tekrar Dene" butonu + "Destek" linki.
- **Detay:** Hata Sentry'ye otomatik raporlanır.

### 3.3 Yetki Hatası (401 / 403)
- **Tetiklenir:** Oturum süresi dolduğunda veya yetkisiz işlem denendiğinde.
- **Aksiyon:** Otomatik olarak login ekranına yönlendirilir.
- **Mesaj:** "Oturumun sona erdi, lütfen tekrar giriş yap."

### 3.4 Bulunamadı (404)
- **Tetiklenir:** Deep link ile açılan mod/gönderi silinmişse veya mevcut değilse.
- **Görsel:** Maskot meraklı ifade + "Bu içerik bulunamadı" mesajı.
- **Aksiyon:** "Ana Ekrana Dön" butonu.

### 3.5 Rate Limit (429)
- **Tetiklenir:** Çok fazla istek gönderildiğinde (abuse önleme).
- **Mesaj:** "Çok hızlı gidiyorsun! Biraz bekle ve tekrar dene."
- **Aksiyon:** Geri sayım timer + "Tekrar Dene" butonu (timer bitince aktif).

### 3.6 Üretim Başarısız (Generation Failed)
- **Tetiklenir:** fal.ai üretimi hata ile sonuçlandığında.
- **Görsel:** Maskot + "Üretim başarısız oldu" mesajı.
- **Aksiyon:** "Tekrar Dene (ücretsiz)" butonu — başarısız üretimde kredi iade edilir.
- **Detay:** `generations.status = failed` olarak kaydedilir.

### 3.7 Yetersiz Kredi
- **Tetiklenir:** Üretim denemesi yapılırken kredi yetersizse.
- **Görsel:** Boş cüzdan ikonu + "Kredin yok" mesajı.
- **Aksiyon:** "Kredi Satın Al" butonu (RevenueCat Paywall'a yönlendir) + "Pro'ya Geç" alternatifi.

### 3.8 Premium Mod Erişim Engeli
- **Tetiklenir:** Free kullanıcı premium modu kullanmaya çalıştığında.
- **Görsel:** Kilit ikonu + Pro rozeti + "Bu mod Pro abonelere özel" mesajı.
- **Aksiyon:** "Pro'ya Geç" butonu (RevenueCat Paywall).

---

## 4. Boş Durumlar (Empty States)

### 4.1 Feed Boş
- **Durum:** Topluluk akışında henüz gönderi yoksa (yeni kullanıcı veya yeni platform).
- **Görsel:** Maskot + "Henüz kimse paylaşmamış. İlk sen ol!"
- **Aksiyon:** "İlk Üretimini Yap" butonu.

### 4.2 Koleksiyon Boş
- **Durum:** Kullanıcının henüz koleksiyonu yoksa veya koleksiyon içi boşsa.
- **Görsel:** Boş albüm ikonu + "Koleksiyona henüz bir şey eklemedin."
- **Aksiyon:** "Keşfet" butonu (explore sayfasına yönlendir).

### 4.3 Üretim Geçmişi Boş
- **Durum:** Kullanıcı henüz hiç üretim yapmadıysa (profil galerisi).
- **Görsel:** Maskot kamerasını gösteriyor + "İlk fotoğrafını dönüştür!"
- **Aksiyon:** "Üret" butonu.

### 4.4 İşlem Geçmişi Boş
- **Durum:** Credit transactions listesi boşsa.
- **Görsel:** Boş liste + "Henüz işlem yok."

### 4.5 Arama Sonuçsuz
- **Durum:** Mod araması veya prompt kütüphanesi aramasında sonuç yoksa.
- **Görsel:** Büyüteç + "Sonuç bulunamadı. Farklı bir şey dene."

---

## 5. İzin Ekranları (Permission Requests)

### 5.1 Kamera İzni
- **Ne zaman:** İlk kez selfie çekmek istediğinde.
- **Özel ekran:** Sistem dialog'undan ÖNCE açıklayıcı bir pre-permission ekranı gösterilir.
- **Görsel:** Maskot kamerasıyla + "Selfie çekebilmemiz için kamera iznine ihtiyacımız var."
- **Butonlar:** "İzin Ver" → sistem dialog açılır | "Şimdi Değil" → galeri upload seçeneği kalır.

### 5.2 Fotoğraf Galerisi İzni
- **Ne zaman:** İlk kez galeriden fotoğraf seçmek istediğinde.
- **Pre-permission ekranı:** "Fotoğraflarına erişebilmemiz için izin gerekiyor."

### 5.3 Bildirim İzni
- **Ne zaman:** Onboarding tamamlandıktan sonra veya ilk streak'te.
- **Pre-permission ekranı:** "Streak'ini kaybetmemen için seni hatırlatalım mı?"
- **Butonlar:** "Bildirimleri Aç" → sistem dialog | "Belki Sonra" → atlanır.

### 5.4 İzin Reddedildi
- **Durum:** Kullanıcı izni daha önce reddettiyse ve ilgili özelliği kullanmaya çalışıyorsa.
- **Mesaj:** "Bu özellik için izin gerekiyor. Ayarlardan açabilirsin."
- **Aksiyon:** "Ayarlara Git" butonu (cihaz ayarlarına yönlendirir).

---

## 6. Bakım ve Güncelleme Ekranları

### 6.1 Zorunlu Güncelleme (Force Update)
- **Tetiklenir:** Eski uygulama versiyonu artık desteklenmediğinde.
- **Görsel:** Maskot + "Yeni bir sürüm var! Devam etmek için güncelle."
- **Aksiyon:** "Güncelle" butonu → App Store / Play Store'a yönlendirir.
- **Teknik:** Supabase'de `app_config` tablosu veya remote config ile minimum versiyon kontrolü.

### 6.2 Bakım Modu
- **Tetiklenir:** Supabase veya fal.ai bakımda olduğunda.
- **Görsel:** Maskot tamirci şapkasıyla + "Bakımdayız, birazdan döneriz."
- **Aksiyon:** Otomatik yeniden kontrol (her 30 sn) veya "Tekrar Dene" butonu.

---

## 7. Yükleme Durumları (Loading States)

### 7.1 Üretim Progress
- **Durum:** fal.ai üretimi devam ederken (5–15 sn).
- **Görsel:** Tam ekran loading — maskot animasyonu + progress bar veya eğlenceli mesajlar döngüsü:
  - "Piksellerle oynuyoruz..."
  - "Yapay zeka çalışıyor..."
  - "Neredeyse hazır..."
- **Teknik:** Polling ile status kontrol, progress UI güncellenir.

### 7.2 Skeleton Loading
- **Durum:** Feed, explore, profil gibi sayfalar yüklenirken.
- **Görsel:** İçerik yapısına uygun skeleton placeholder (NativeWind ile).

### 7.3 Pull to Refresh
- **Durum:** Feed ve explore sayfalarında aşağı çekmekle yenileme.
- **Görsel:** Lime rengi refresh indicator.
