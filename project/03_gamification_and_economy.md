# Oyunlaştırma ve Kullanıcı Ekonomisi

## 1. Gooflo Pro (Abonelik Sistemi)

Aylık veya yıllık abonelikle açılan premium deneyim. RevenueCat ile yönetilir.

### Pro Avantajları

| Avantaj | Açıklama |
|---|---|
| Günlük +5 kredi | Her gün otomatik tanımlanır |
| Premium modlara erişim | Free kullanıcılar premium modları kullanamaz |
| %50 kredi indirimi | Standart mod: 1→1, Premium mod: 2–3→1–2 kredi |
| Öncelikli üretim | Daha hızlı kuyruk, öncelikli fal.ai işleme |
| Reklamsız deneyim | Uygulama genelinde reklam yok |
| Pro rozeti | Profilde ve topluluk akışında görünür |

### Abonelik Planları

| Plan | Fiyat |
|---|---|
| Aylık (Monthly) | TBD |
| Yıllık (Yearly) | TBD |

*Lifetime şimdilik yok, ileride test edilebilir.*

---

## 2. Kredi Sistemi (Kullanıcı Ekonomisi)

Platform içi işlemlerin merkezinde **kredi** bulunur. Sistem şeffaf, mantıklı ve takip edilebilir şekilde çalışır.

### Kredi Maliyeti

| Mod Türü | Free Kullanıcı | Pro Kullanıcı |
|---|---|---|
| Standart mod | 1 kredi | 1 kredi |
| Premium mod | Erişim yok | 1–2 kredi (%50 indirimli) |

### Kredi Kazanım Yolları

Herkes (free + Pro) için geçerli:

- **Kayıt Bonusu:** İlk katılımda **20 hediye kredi**.
- **Günlük Giriş Ödülü:** Her gün uygulamaya giren kullanıcıya otomatik +1 kredi.
- **Pro Günlük Bonus:** Pro abonelere ek günlük +5 kredi.
- **Paylaşım Bonusu:** Günde 1 kez içerik paylaşıldığında +1 kredi.

### Kredi Paketleri (Satın Alma)

Herkes (free + Pro) satın alabilir. RevenueCat ile cross-platform IAP:

| Paket | Fiyat | Not |
|---|---|---|
| 50 kredi | $1.99 | |
| 120 kredi | $3.99 | Best value |
| 300 kredi | $8.99 | |

### İşlem Geçmişi (Transaction History)

- Kullanıcının hangi tarihte, hangi kaynaktan (günlük giriş, Pro bonus, satın alım, paylaşım bonusu) kredi kazandığı ve hangi üretim için harcadığı şeffaf bir listeyle gösterilir.

---

## 2. Streak Sistemi

Günlük kullanımın alışkanlığa dönüşmesini hedefleyen mekanizma. Duolingo veya Snapchat mantığıyla çalışır.

### Günlük Streak

- Streak'i başlatmak veya sürdürmek için her gün en az **1 adet fotoğraf üretimi** yapılması gerekir. Sadece uygulamaya giriş yapmak yetmez.
- Üretim yapıldığında streak güncellenir ve kutlama animasyonu gösterilir.
- Gün bitiminde üretim yapılmadıysa seri sıfırlanır.

### En Uzun Streak (Longest Streak)

- Seri bozulsa bile, kullanıcının ulaştığı en yüksek streak rakamı kayıt altında tutulur ve profilinde sergilenir.

### Günlük Challenge

- Kullanıcılara her gün farklı, eğlenceli görevler sunulur.
- Örnek: "Bugün yüzünü bir ortaçağ şövalyesine çevir" veya "Bir topluluk modu kullanarak üretim yap".
- Görevler tamamlandığında streak devam eder ve sürpriz bonus krediler kazanılabilir.

---

## 3. Liderboard (Sıralama Tablosu)

Topluluğun en iyilerini öne çıkararak rekabet ortamı yaratan sıralama sistemi.

- **En çok kullanılan topluluk modlarının sahipleri** listelenir.
- **En uzun streak'i bozmayan** kullanıcılar öne çıkar.
- **En çok beğeni toplayan** üreticiler sıralanır.
- **Günlük, haftalık ve aylık** periyotlarla ayrı sıralama tabloları bulunur.
- Liderboard'da üst sıralara çıkmak kullanıcı profiline prestij katar.
