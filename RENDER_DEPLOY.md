# 🚀 TekReklam — Render Deploy Rehberi

## ✅ ADIM 1 — Supabase Veritabanı (TAMAMLANDIN)

- **Project Ref**: `ahqtkxulxckumobepuvu`
- **Connection String**: `postgresql://postgres.ahqtkxulxckumobepuvu:Boss1905.smt.@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`

---

## ⏳ ADIM 2 — Render Deploy

### 2.1 Render Hesabı Oluştur
1. **https://render.com** adresine git
2. **"Get Started for Free"** tıkla
3. **"GitHub"** ile giriş yap

### 2.2 Web Service Oluştur
1. Render dashboard → **"New +"** → **"Web Service"**
2. **"Connect a repository"** bölümünde `devorks1905/single-ad-auction-model-v1` reposunu ara
3. **"Connect"** tıkla

### 2.3 Ayarlar
Aşağıdaki ayarları yap:

**Basic Settings**:
- **Name**: `tekreklam`
- **Region**: `Frankfurt (EU Central)` — Türkiye'ye en yakın
- **Branch**: `arena/01a019a6-single-ad-auction-model-v1`
- **Runtime**: `Node`
- **Build Command**: `npm install && npx tsx scripts/db-push.ts && npm run build`
- **Start Command**: `npm start`

**Instance Type**:
- **Free** (0$/ay) — Cold start var ama çalışır

### 2.4 Environment Variables
**"Environment Variables"** bölümüne şunları ekle:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.ahqtkxulxckumobepuvu:Boss1905.smt.@aws-0-eu-west-1.pooler.supabase.com:6543/postgres` |
| `ADMIN_PASSWORD` | `CNfpxT3e5tp60kji` |
| `NODE_ENV` | `production` |

### 2.5 Deploy
1. **"Create Web Service"** tıkla
2. 3-5 dakika bekle (ilk deploy biraz uzun sürer)
3. Deploy başarılı olduktan sonra bir URL alacaksın: `https://tekreklam.onrender.com`

---

## ⏳ ADIM 3 — Site Test

Deploy başarılı olduktan sonra:

1. **Ana sayfa**: `https://tekreklam.onrender.com` → Site yüklenmeli
2. **Admin paneli**: `https://tekreklam.onrender.com/admin`
   - Şifre: `CNfpxT3e5tp60kji`
3. **API sağlık**: `https://tekreklam.onrender.com/api/health`
   - `{"ok":true,"timestamp":"..."}` dönmeli

### Cold Start Notu
Render free tier'da cold start var. İlk istek 30-60 saniye sürebilir. Sonraki istekler hızlı olur.

---

## ⏳ ADIM 4 — Domain Bağlama (Opsiyonel)

### Seçenek A: Render Subdomain (Varsayılan)
- `https://tekreklam.onrender.com` — Zaten hazır

### Seçenek B: Custom Domain
1. Render dashboard → **Settings** → **Custom Domain**
2. Domain ekle (örn: `tekreklam.com`)
3. Render sana DNS kayıtları gösterecek
4. Domain registrar'ında DNS ayarlarını yap

### Seçenek C: Ücretsiz Domain (.tk, .ml)
1. **https://www.freenom.com** → Domain ara
2. Kaydet
3. Render'da custom domain olarak ekle

---

## ⏳ ADIM 5 — Ödeme Yöntemi (Stripe)

### 5.1 Stripe Hesabı
1. **https://stripe.com** → Kayıt ol
2. Dashboard → **Developers** → **API keys**
3. **"Reveal test key"** → `sk_test_xxxxx` kopyala

### 5.2 Render'a Ekle
1. Render dashboard → **Environment Variables**
2. Yeni ekle:
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_test_xxxxx`
3. **"Save Changes"** → Render otomatik redeploy yapar

### 5.3 Test Et
1. Admin panelinde bir teklife **"Stripe linki oluştur"** tıkla
2. Stripe ödeme linki oluşmalı

---

## ⏳ ADIM 6 — E-posta (Resend - Ücretsiz)

### 6.1 Resend Hesabı
1. **https://resend.com** → GitHub ile giriş yap
2. **"API Keys"** → **"Create API Key"**
3. Key'i kopyala (`re_xxxxx`)

### 6.2 Render'a Ekle
1. Render dashboard → **Environment Variables**
2. Yeni ekle:
   - Key: `RESEND_API_KEY`
   - Value: `re_xxxxx`
3. Opsiyonel:
   - Key: `EMAIL_FROM`
   - Value: `TekReklam <onboarding@resend.dev>` (ücretsiz test domain)
4. **"Save Changes"**

---

## ⏳ ADIM 7 — Cron Job (Otomatik Kapanış)

Render free tier'da built-in cron yok. Alternatif:

### Ücretsiz Alternatif: cron-job.org
1. **https://cron-job.org** → Kayıt ol (ücretsiz)
2. **"Create Cronjob"** tıkla
3. Ayarlar:
   - **URL**: `https://tekreklam.onrender.com/api/cron/close`
   - **Schedule**: `0 0 * * *` (her gece 00:00 UTC)
   - **Request Method**: `GET`
4. **"Create"** tıkla

---

## 📋 Özet Bilgiler

| Bilgi | Değer |
|-------|-------|
| **Site URL** | `https://tekreklam.onrender.com` |
| **Admin URL** | `https://tekreklam.onrender.com/admin` |
| **Admin Şifresi** | `CNfpxT3e5tp60kji` |
| **API Health** | `https://tekreklam.onrender.com/api/health` |
| **Supabase Project** | `ahqtkxulxckumobepuvu` |

---

## 🔧 Sorun Giderme

### "Application failed to start" hatası
→ Render logs'larını kontrol et. Genellikle `DATABASE_URL` hatasıdır.

### "relation does not exist" hatası
→ Build loglarında `db-push.ts`'in çalışıp çalışmadığını kontrol et.

### Site çok yavaş (cold start)
→ Render free tier'da normal. İlk istek30-60 saniye sürebilir.

### Admin paneline erişemiyorum
→ `ADMIN_PASSWORD` env değişkenini kontrol et.

### Stripe linki oluşmuyor
→ `STRIPE_SECRET_KEY` env değişkenini kontrol et.

### E-posta gitmiyor
→ `RESEND_API_KEY` env değişkenini kontrol et.

---

## 🎯 Hızlı Başlangıç Checklist

- [ ] Supabase connection string hazır
- [ ] Render'da web service oluşturuldu
- [ ] Environment variables eklendi
- [ ] Deploy başarılı
- [ ] Ana sayfa yükleniyor
- [ ] Admin paneline giriş yapılıyor
- [ ] API health endpoint çalışıyor
- [ ] Test teklif verilebiliyor
- [ ] Stripe (opsiyonel) bağlandı
- [ ] E-posta (opsiyonel) bağlandı
- [ ] Cron job ayarlandı
