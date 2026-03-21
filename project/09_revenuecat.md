# RevenueCat Entegrasyonu

## Kurulum

- **SDK:** `react-native-purchases` + `react-native-purchases-ui`
- **Kurulum:** `npx expo install react-native-purchases react-native-purchases-ui`
- **Docs:** https://www.revenuecat.com/docs/getting-started/installation/expo

## API Key

- **Test key:** `test_uuPBIduBueJXTtCelkuEGeOqWAx`
- Tek key, React Native'de hem iOS hem Android için çalışır.

## Entitlement

- **Gooflo Pro** — abonelik aktif olduğunda bu entitlement kontrol edilir.

## Ürünler

### Abonelikler (Gooflo Pro)

| Plan | Product ID | Fiyat |
|---|---|---|
| Aylık | `monthly` | TBD |
| Yıllık | `yearly` | TBD |

*Lifetime şimdilik yok, ileride test edilebilir.*

### Kredi Paketleri (Consumable IAP)

| Paket | Product ID | Fiyat |
|---|---|---|
| 50 kredi | `credits_50` | $1.99 |
| 120 kredi | `credits_120` | $3.99 (best value) |
| 300 kredi | `credits_300` | $8.99 |

Herkes (free + Pro) satın alabilir.

## Uygulama Detayları

- **Paywall:** RevenueCat Paywalls kullanılacak (https://www.revenuecat.com/docs/tools/paywalls)
- **Customer Center:** Abonelik yönetimi için (https://www.revenuecat.com/docs/tools/customer-center)
- **Webhook:** RevenueCat → Supabase Edge Function (server-side doğrulama)
  - `process-purchase` — kredi paketi doğrulama + kredi tanımlama
  - `process-subscription` — Pro abonelik doğrulama, iptal/yenileme yönetimi
- **Customer info:** RevenueCat SDK ile client'ta entitlement kontrol + Supabase'de `is_pro` flag sync
