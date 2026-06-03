# KAMIL OTP 🔑

Website jual nomor OTP virtual — **[otp.kamilshop.my.id](https://otp.kamilshop.my.id)**

Stack: Next.js 14 · TypeScript · Tailwind CSS · Firebase · RumahOTP · Pakasir

---

## ✅ Fitur

- **Auth**: Email/password, Google OAuth, GitHub OAuth, lupa password
- **Beli Nomor**: 200+ negara, 500+ layanan, harga real-time dari RumahOTP
- **SMS Watcher**: Auto-refresh setiap 5 detik, highlight OTP otomatis
- **Top Up QRIS**: Generate QR via Pakasir, webhook auto-update saldo
- **Dashboard**: Saldo, riwayat order, quick buy
- **Dark Mode**: Cyan + Violet, glassmorphism

---

## 🚀 Setup Lokal

### 1. Clone & install
```bash
git clone https://github.com/youruser/kamil-otp.git
cd kamil-otp
npm install
```

### 2. Firebase
1. Buat project di [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email, Google, GitHub)
3. Enable **Firestore** (mode production)
4. Buat Service Account di Project Settings → Service Accounts → Generate new private key

### 3. Environment Variables
```bash
cp .env.local.example .env.local
# Edit .env.local dengan semua credentials
```

### 4. Firestore Rules
Deploy rules keamanan:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 5. Jalankan
```bash
npm run dev
# → http://localhost:3000
```

---

## ☁️ Deploy ke Vercel

```bash
npm install -g vercel
vercel --prod
```

Tambahkan semua env variables di **Vercel Dashboard → Settings → Environment Variables**.

Pastikan set **Webhook URL** Pakasir ke:
```
https://otp.kamilshop.my.id/api/webhook/pakasir
```

---

## 📁 Struktur File

```
/app
  /page.tsx              → Landing page
  /(auth)/login          → Login
  /(auth)/register       → Register
  /(dashboard)/dashboard → Dashboard utama
  /(dashboard)/buy       → Beli nomor
  /(dashboard)/orders    → Riwayat + detail order
  /(dashboard)/topup     → Top up QRIS
  /(dashboard)/profile   → Profil & ganti password
  /api/RumahOTP/*            → Proxy RumahOTP API
  /api/payment/*         → Pakasir payment
  /api/webhook/pakasir   → Webhook callback
  /docs                  → Panduan lengkap
/lib
  /firebase.ts           → Firebase client config
  /firebase-admin.ts     → Firebase Admin SDK
  /firestore.ts          → Firestore helpers + atomic operations
  /RumahOTP.ts               → RumahOTP API wrapper
  /pakasir.ts            → Pakasir payment wrapper
  /utils.ts              → Helper functions
/types/index.ts          → TypeScript types
```

---

## 💡 Konfigurasi Harga

Edit di `.env.local`:
```
          # Kurs RUB → IDR
RUMAHOTP_MARKUP_PERCENT=30 # Markup 30% dari harga RumahOTP
```

Formula: `ceil(harga_rub × 185 × 1.30)`

---

## 🛡️ Keamanan

- Semua operasi saldo menggunakan **Firestore transaction** (atomic)
- API routes diproteksi dengan **Firebase Admin token verification**
- Rate limiting: 10 request/menit per user di endpoint `/api/RumahOTP/buy`
- Firestore Rules: user hanya bisa baca data miliknya sendiri
