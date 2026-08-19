# TekReklam — Tek Reklamlı Site

Günde **tek** bir reklam alanı. O slot her gece canlı açık artırmayla satılır.

## Çalıştırma (yerel)

```bash
echo 'DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db' > .env.local
npm install
npm run db:push      # tabloları oluşturur
npm run dev          # http://localhost:3000
```

Üretim: `npm run build && npm start`

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL bağlantısı (Neon/Supabase free tier olur) |
| `ADMIN_PASSWORD` | ✅ önerilir | `/admin` paneli şifresi (varsayılan: `tekreklam`) |
| `ADMIN_SECRET` | opsiyonel | Oturum çerezi imzalama anahtarı |
| `STRIPE_SECRET_KEY` | opsiyonel | Tek tıkla Stripe Payment Link üretir |
| `RESEND_API_KEY` | opsiyonel | Kazanana otomatik e-posta |
| `EMAIL_FROM` | opsiyonel | Gönderen adresi |
| `CRON_SECRET` | opsiyonel | `/api/cron/close` erişim anahtarı |
| `NEXT_PUBLIC_SITE_URL` | opsiyonel | sitemap/OG için tam alan adı |

## Yayına alma ($0 altyapı)

1. Repoyu GitHub'a yükle.
2. Neon.tech'te ücretsiz Postgres aç, connection string'i al.
3. Vercel'de import et, `DATABASE_URL` + `ADMIN_PASSWORD` ekle, Deploy.
4. `DATABASE_URL` Neon'a ayarlıyken bir kez `npm run db:push`.
5. Alan adını bağla. `vercel.json` içindeki cron her gece kapanışı otomatik yapar.

## Yönetim

`/admin` → şifreyle giriş. Yapabildiklerin:

- Canlı ve geçmiş tüm teklifleri görme
- Teklif reddetme / geri alma, e-posta engelleme
- Stripe ödeme linki üretme veya manuel link kaydetme
- "Ödendi / Ödemedi" işaretleme — ödemeyen olursa slot **otomatik** ikinci teklife geçer
- Kazanana e-posta gönderme
- Taban fiyat, minimum artış, kapanış saati, slogan ayarları
- Açık artırmayı elle kapatma / yeniden açma

## Güvenlik özellikleri

- **Rate limiting**: Teklif ve admin giriş endpoint'lerinde IP bazlı rate limiting
- **CSRF koruması**: Admin aksiyonlarında cookie + header tabanlı CSRF doğrulaması
- **Zod validasyonu**: Tüm API endpoint'lerinde schema tabanlı input doğrulama
- **XSS önleme**: E-posta HTML'inde karakter escape
- **Güvenlik başlıkları**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Content filter**: Otomatik yasaklı kelime filtresi (porn, casino, bahis vb.)
- **Blocklist**: E-posta ve domain bazlı engelleme
- **Tekrarlanan teklif kontrolü**: Aynı e-posta ile aynı auction'da sadece bir teklif
- **HMAC tabanlı admin auth**: timing-safe karşılaştırma ile güvenli oturum yönetimi

## Abonelik yönetimi

Kullanıcılar `/unsubscribe` sayfasından veya e-posta altındaki bağlantıdan abonelikten çıkabilir.

## Demo veriyi temizleme

```bash
psql "$DATABASE_URL" -c "TRUNCATE bids, auctions, events RESTART IDENTITY;"
```
