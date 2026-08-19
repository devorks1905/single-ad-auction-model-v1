# 🚀 TekReklam — Adım Adım Deploy Rehberi

## ✅ ADIM 1 — Supabase Veritabanı (TAMAMLANDIN)

Veritabanı bilgilerin:
- **Project Ref**: `ahqtkxulxckumobepuvu`
- **Region**: EU West (Ireland)
- **Connection String**: `.env.local` dosyasında kayıtlı

---

## ⏳ ADIM 2 — Vercel Deploy

### 2.1 Vercel'e Git
1. **https://vercel.com** adresine git
2. **"Sign Up"** → **"Continue with GitHub"** tıkla
3. GitHub hesabınla giriş yap

### 2.2 Proje Oluştur
1. Vercel dashboard'da **"Add New..."** → **"Project"** tıkla
2. **"Import Git Repository"** bölümünde `devorks1905/single-ad-auction-model-v1` reposunu ara
3. **"Import"** tıkla

### 2.3 Yapılandırma
Aşağıdaki ayarları yap:

**Framework Preset**: Next.js (otomatik algılanır)

**Root Directory**: `./` (varsayılan)

**Build and Output Settings**:
- Build Command: `npx tsx scripts/db-push.ts && next build`
- Output Directory: `.next` (varsayılan)

### 2.4 Ortam Değişkenleri (ENVIRONMENT VARIABLES)
**"Environment Variables"** bölümüne şunları ekle:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.ahqtkxulxckumobepuvu:Boss1905.smt.@aws-0-eu-west-1.pooler.supabase.com:6543/postgres` |
| `ADMIN_PASSWORD` | `CNfpxT3e5tp60kji` |

### 2.5 Deploy
1. **"Deploy"** tıkla
2. 2-3 dakika bekle
3. Deploy başarılı olursa bir URL alacaksın (örn: `tekreklam-xxxxx.vercel.app`)

---

## ⏳ ADIM 3 — Site Test

Deploy başarılı olduktan sonra:

1. **Ana sayfa**: `https://tekreklam-xxxxx.vercel.app` → Site yüklenmeli
2. **Admin paneli**: `https://tekreklam-xxxxx.vercel.app/admin` → Şifre: `CNfpxT3e5tp60kji`
3. **API sağlık**: `https://tekreklam-xxxxx.vercel.app/api/health` → `{"ok":true}` dönmeli

### Hata alırsan:
- Vercel dashboard → **Deployments** → Son deploy → **"Logs"** tıkla
- Hata mesajını bana gönder

---

## ⏳ ADIM 4 — Ücretsiz Domain Bağlama

### Seçenek A: Vercel Subdomain (En Kolay - Ücretsiz)
1. Vercel dashboard → **Settings** → **Domains**
2. Özel bir subdomain ekle: `tekreklam.vercel.app` (zaten var)
3. Veya custom: `tekreklam-xxxxx.vercel.app`

### Seçenek B: Freenom Ücretsiz Domain (.tk, .ml, .ga)
1. **https://www.freenom.com** adresine git
2. Ücretsiz domain ara (örn: `tekreklam.tk`)
3. Kaydet
4. Vercel dashboard → **Settings** → **Domains** → Domain ekle
5. Vercel sana DNS kayıtları gösterecek — Freenom'da ayarla

### Seçenek C: GitHub Pages Subdomain (Ücretsiz)
1. GitHub repo → **Settings** → **Pages**
2. Custom domain: `tekreklam.github.io`
3. (Not: Bu sadece statik site için, API çalışmaz)

---

## ⏳ ADIM 5 — Ödeme Yöntemi (Stripe)

### 5.1 Stripe Hesabı Oluştur
1. **https://stripe.com** adresine git
2. **"Start now"** → Kayıt ol
3. Doğrulama adımlarını tamamla

### 5.2 API Key Al
1. Stripe dashboard → **Developers** → **API keys**
2. **"Reveal test key"** → `sk_test_xxxxx` kopyala

### 5.3 Vercel'e Ekle
1. Vercel dashboard → **Settings** → **Environment Variables**
2. Yeni ekle:
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_test_xxxxx` (test key)
3. **"Save"** tıkla
4. **Redeploy** yap (Deployments → ... → Redeploy)

### 5.4 Test Et
1. Admin paneline git
2. Bir teklif oluştur
3. **"Stripe linki oluştur"** butonuna tıkla
4. Stripe ödeme linki oluşmalı

---

## ⏳ ADIM 6 — E-posta (Resend - Ücretsiz)

### 6.1 Resend Hesabı
1. **https://resend.com** adresine git
2. GitHub ile giriş yap
3. **"API Keys"** → **"Create API Key"**
4. Key'i kopyala

### 6.2 Vercel'e Ekle
1. Vercel dashboard → **Settings** → **Environment Variables**
2. Yeni ekle:
   - Key: `RESEND_API_KEY`
   - Value: `re_xxxxx`
3. Opsiyonel:
   - Key: `EMAIL_FROM`
   - Value: `TekReklam <noreply@domain.com>` (domain gerekli)
4. **Redeploy** yap

### 6.3 Test Et
1. Admin panelinde bir teklife **"Kazanana e-posta"** tıkla
2. E-posta gönderilmeli

---

## ⏳ ADIM 7 — Cron Job (Otomatik Kapanış)

Vercel ücretsiz planında cron job sınırlıdır. Alternatif:

### Ücretsiz Alternatif: Upstash Redis + Cron
1. **https://upstash.com** → Kayıt ol
2. Redis database oluştur
3. **https://cron-job.org** → Kayıt ol
4. Yeni cron job oluştur:
   - URL: `https://tekreklam-xxxxx.vercel.app/api/cron/close?key=SENIN_CRON_SECRET`
   - Schedule: `0 0 * * *` (her gece 00:00 UTC)
5. Vercel'de `CRON_SECRET` ekle

---

## 📋 Özet Bilgiler

| Bilgi | Değer |
|-------|-------|
| **Supabase Project** | `ahqtkxulxckumobepuvu` |
| **Admin Şifresi** | `CNfpxT3e5tp60kji` |
| **Admin URL** | `https://tekreklam-xxxxx.vercel.app/admin` |
| **API Health** | `https://tekreklam-xxxxx.vercel.app/api/health` |
| **Canlı Açık Artırma** | `https://tekreklam-xxxxx.vercel.app/auction` |

---

## 🔧 Sorun Giderme

### "DATABASE_URL is required" hatası
→ Vercel'de `DATABASE_URL` env değişkenini ekle

### "relation does not exist" hatası
→ Build loglarını kontrol et, `db:init` script'inin çalışıp çalışmadığını gör

### Admin paneline erişemiyorum
→ `ADMIN_PASSWORD` env değişkenini kontrol et

### Stripe linki oluşmuyor
→ `STRIPE_SECRET_KEY` env değişkenini kontrol et

### E-posta gitmiyor
→ `RESEND_API_KEY` env değişkenini kontrol et
