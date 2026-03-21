# Gooflo - Marka ve Tasarım Rehberi (Brand Design Guide)

Bu doküman, Gooflo mobil uygulamasının görsel kimliğini, tasarım dilini, marka kişiliğini ve front-end tarafında kullanılacak CSS token'larını yapılandırmak amacıyla oluşturulmuştur. Tasarımcılar ve geliştiriciler yeni bir özellik eklerken buradaki renk, tipografi ve layout kurallarına uymalıdır.

**Sürüm:** V1.0 | **Hedef Kitle:** Gen Z (15-25) | **Kimlik:** Enerjik, modern ve cool.

---

## 1. Marka Genel Bakış (Brand Overview)
Gooflo, kullanıcıların fotoğraflarını AI ile komik, absurd ve viral içeriklere dönüştürmesini sağlayan bir mobil uygulamadır.
* **Ton:** Cool, rahat, kendinden emin, hafif yaramaz. Asla çocuksu değil.
* **Enerji:** Duolingo'nun samimiyeti + Discord'un "cool"luğu + Snapchat'in oyunculuğu.
* **Dil:** Gündelik (Casual), gerektiğinde Gen Z jargonu. İngilizce ağırlıklı global marka.

### App Store Konumlandırması
* **İsim:** Gooflo
* **Alt Başlık:** Funny AI Photo Creator
* **Bütünlük:** Gooflo: Funny AI Photo Creator
* **Motto (Tagline):** "Make it weird. Make it viral." | "Your photos, but funnier."

---

## 2. Renk Sistemi (Color System)
Gooflo'nun renk sistemi yüksek kontrast ve enerji üzerine kuruludur. Gradient (renk geçişi) kullanılmaz, tüm renkler **solid (düz)** olmalıdır.

### 2.1 Ana Palet (Primary Palette)
| Renk Kodu | İsim | Rol | Kullanım Alanı |
| :--- | :--- | :--- | :--- |
| **#BFFF00** | Lime | Primary | Ana arka plan, CTA butonları, aktif durumlar, vurgular |
| **#1A1A1A** | Black | Primary | Karakter gövdesi, temel metinler, başlıklar, ikonlar |
| **#FFFFFF** | White | Primary | Gözlük, açık arka planlar, kart zeminleri |
| **#FF5C5C** | Coral | Accent | Kamera detayı, logo noktası, uyarılar, CTA hover (Maks %15 kullanım) |
| **#F2F2F0** | Off-white | Neutral | Sayfa arkaplanı, alt metin alanları, ayraçlar (separator) |

### 2.2 Genişletilmiş Palet (Extended Palette)
Sadece UI elementlerinde, bilgi uyarılarında ve illüstrasyonlarda destekleyici olarak kullanılır.
* **Lime Dark (#9ED600):** Hover state, aktif buton, gölge.
* **Coral Dark (#E04545):** Hata state'leri, buton basılma anı.
* **Blue (#4DA8FF):** Bilgilendirme, link, info rozetleri.
* **Purple (#8B5CF6):** Premium/Pro özellikleri, özel rozetler.
* **Orange (#FF9F43):** Uyarı, streak bildirimi, geri sayım vs.
* **Teal (#2DD4A8):** Başarı, onay, olumlu geri bildirim.

### 2.3 Kontrast ve Erişilebilirlik
Lime (#BFFF00) çok parlak olduğundan okunabilirlik kurallarına sıkı uyulmalıdır:
* ✅ Lime zemin üzerine Siyah metin **kullanılır** (WCAG AA)
* ✅ Siyah zemin üzerine Beyaz metin (Dark Mode) **kullanılır** (WCAG AAA)
* ✅ Siyah zemin üzerine Coral vurgu **kullanılır**.
* ❌ Beyaz zemin üzerine Lime metin **ASLA KULLANILAMAZ** (Kontrast yetersiz).

### 2.4 Dark Mode Renk Eşlemesi
Uygulama Dark/Light/System seçenekli tema destekler. Lime ve Coral her iki modda da değişmez.

| Token | Light Mode | Dark Mode |
| :--- | :--- | :--- |
| Sayfa Arka Planı | `#F2F2F0` (Off-white) | `#1A1A1A` (Black) |
| Kart / Yüzey | `#FFFFFF` (White) | `#2D2D2D` (Dark) |
| Yükseltilmiş Yüzey | `#FFFFFF` (White) | `#363636` |
| Birincil Metin | `#1A1A1A` (Black) | `#FFFFFF` (White) |
| İkincil Metin | `#2D2D2D` (Dark) | `#F2F2F0` (Off-white) |
| Muted Metin | `#8A8A8A` | `#8A8A8A` |
| Divider / Border | `#E5E5E3` | `#3A3A3A` |
| Lime | `#BFFF00` — değişmez | `#BFFF00` — değişmez |
| Coral | `#FF5C5C` — değişmez | `#FF5C5C` — değişmez |

---

## 3. Tipografi (Typography)
Tipografi temiz, modern, kalın (bold) ve yuvarlak hatlara (rounded) sahip olmalı ancak çocuksu durmamalıdır.
* **Logo:** *Nunito - Black (900)*. Daima tamamen küçük harfler ("gooflo.") ve sonundaki nokta Coral (#FF5C5C) rengindedir.
* **Başlıklar (Headings):** *Nunito - Bold/ExtraBold (700-800)*
* **Gövde Metni (Body):** *Nunito - Regular/SemiBold (400-600)*
* **Kod Blokları:** *SF Mono / Fira Code (400)*

---

## 4. Maskot Karakter (Mascot)
Markanın yüzü olan maskot; cool, minimal ve hemen tanınabilen yapıda tasarlanmıştır.
* **Anatomi:** Siyah yuvarlak veya dikdörtgenimsi bir gövdeden oluşur (Dark mode: Lime). Mutlaka karakteristik geniş gözlüğünü takar.
* **Aksesuar:** Karakter daima elinde mercan (Coral) renkli, flaşı ("Lime" noktalı) patlayan retro bir kamera tutar. Sol eliyle kamerayı tutarken sağ eliyle "✌️" barış işareti yapar.
* **Kurallar:** Kesinlikle gözlük çıkarılmaz, gölge/gradient verilmez ve ağız yapısı koca bir kahkaha yerine hafif çarpık bir gülümseme (smirk) şeklindedir.

---

## 5. Boşluklar, Gölgeler ve Köşeler (Spacing & Layout)
Tasarımın bütünü 4px Grid sistemine dayanır. (Örn: sm=12px, md=16px, lg=24px).
* **Köşeler (Border Radius):** Gooflo'da *keskin köşe yoktur*. En az 8px radius kullanılır. Butonlar 8px veya 12px, kartlar ise 12px veya 16px radius'a sahiptir.
* **Gölgeler (Shadows):** Çok minimaldir ve sadece işlevsellik için (örn: Modal, Floating Buton, Dropdown) %8-16 arası opaklığa sahip siyah gölge kullanılır. Kesinlikle renkli gölge (örn. neon lime glo) yapılmaz.

---

## 6. CSS Değişkenleri (Design Tokens)
Front-end tarafı kodlanırken standart sağlanması adına global `index.css` veya `theme` ayarlarına uygulanması gereken temel CSS değişkenleri şunlardır:

```css
/* ===== GOOFLO DESIGN TOKENS ===== */
:root {
  /* Colors */
  --color-lime: #BFFF00;
  --color-lime-dark: #9ED600;
  --color-black: #1A1A1A;
  --color-dark: #2D2D2D;
  --color-white: #FFFFFF;
  --color-off-white: #F2F2F0;
  --color-coral: #FF5C5C;

  /* Typography */
  --font-heading: 'Nunito', sans-serif;
  --font-body: 'Nunito', sans-serif;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-1: 0 2px 8px rgba(0,0,0,0.08); /* Kartlar */
  --shadow-2: 0 4px 16px rgba(0,0,0,0.12); /* Modallar */
}
```

---

## 7. AI Üretim Komutları (Generation Prompts)
Görsel kimliğin Midjourney ve DALL-E gibi araçlarla tutarlı şekilde üretilmesi ve genişletilmesi için aşağıdaki prompt'lar kullanılmalıdır:

### Midjourney - App Icon
> A mobile app icon for "gooflo", a funny AI photo editor. Flat minimal vector mascot — a cool, confident character with a round black head, wearing rectangular white sunglasses with rounded corners (one lens shows a glowing lime-green pupil, the other lens is winking with a small curved line). Asymmetric smirk mouth — a single confident curved line, not a big grin. Small compact black body with stubby arms — one arm down holding a small coral-red retro camera, the other arm up making a peace sign ✌️. Text "gooflo" below in lowercase bold rounded sans-serif font (like Nunito Black), black color, with a coral-red period/dot at the end. Background: solid electric lime green (#BFFF00). Style: flat vector, minimal, no gradients, no outlines, solid shapes only. Inspired by Duolingo owl simplicity meets Discord mascot coolness. App icon rounded corners. --ar 1:1 --v 6.1 --style raw

### Midjourney - Mascot Only
> A cool minimal cartoon mascot character on a transparent background, full body, centered. Round black head with white rectangular sunglasses — left lens has a glowing lime green (#BFFF00) pupil dot, right lens shows a wink (small curved line). Subtle asymmetric smirk, just one curved line — confident, not silly. Small black rounded body, stubby proportions. Left arm holds a coral-red (#FF5C5C) small vintage camera with a lime-green indicator dot. Right arm raised with a ✌️ peace gesture. No legs, body tapers to rounded bottom. Personality: effortlessly cool, laid-back, slightly mischievous. Style: flat vector, solid colors, no outlines, no gradients, geometric shapes, ultra minimal. Think: if Duolingo's owl was a cool teenager with sunglasses. --ar 1:1 --v 6.1 --no background shadow gradient outline

### DALL-E 3 - App Store Hero
> Promotional hero image for "gooflo" app. Center: the gooflo mascot — a cool minimal black round-headed character wearing white rectangular sunglasses (one lime eye, one winking), smirking confidently, holding a coral-red camera, other hand peace sign. Around the mascot: floating phone screens showing before/after photo transformations — normal selfie → Renaissance painting, cat → superhero, group photo → anime style. Background: solid lime green (#BFFF00) with scattered minimal geometric shapes (small circles, squares in black and coral). Logo "gooflo." in bold lowercase at the bottom. Clean, flat vector style, no gradients, ultra modern, Gen Z energy.
