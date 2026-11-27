# SPIVER BOT — Bot WhatsApp Grup Iseng

Bot WhatsApp multifungsi menggunakan `@whiskeysockets/baileys` dengan autentikasi **Pairing Code 8 Digit** (tanpa QR Code, cukup pakai 1 HP), database **Supabase (PostgreSQL)**, serta **Web Dashboard** siap deploy ke **Vercel** (frontend) dan **Railway** (bot engine).

Sistem ekonomi menggunakan **COIN** (tanpa balance):
- Pakai perintah: **+1 coin**
- Menang game: **+50 coin**
- Menyerah / kalah game: **+1 coin**

---

## Struktur Project

```text
spiver-bot/
├── bot/
│   ├── index.js        # Bot utama Baileys, Pairing Code, Express API & Web Server
│   ├── menus.js        # Semua template menu SPIVER BOT
│   ├── db.js           # Koneksi dan query Supabase PostgreSQL
│   ├── games.js        # Logika game tebak-tebakan & kuis
│   └── downloader.js   # Downloader IG, TikTok, YT, Spotify, dll + .toaudio
├── web/
│   ├── index.html      # Halaman dashboard & pairing code (Vercel)
│   ├── style.css       # Tema dark mode dashboard
│   └── script.js       # Fetch /api/status & /api/pairing
├── supabase.sql        # Skema tabel lengkap untuk Supabase SQL Editor
├── railway.json        # Konfigurasi start command Railway
├── vercel.json         # Rewrites Vercel ke folder web/
├── .env.example        # Contoh environment variables
├── .gitignore
└── package.json
```

---

## Panduan Install & Deploy Lengkap

### 1. Clone Repository
```bash
git clone https://github.com/username/spiver-bot.git
cd spiver-bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Buat Project Supabase & Jalankan `supabase.sql`
1. Buka [https://supabase.com](https://supabase.com) lalu klik **New Project**.
2. Setelah project aktif, buka menu **SQL Editor** di sidebar kiri.
3. Salin seluruh isi file `supabase.sql` dari repository ini, tempel ke SQL Editor, lalu klik **Run**.

### 4. Copy `SUPABASE_URL` dan `SUPABASE_ANON_KEY` ke `.env`
1. Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
2. Di dashboard Supabase, buka **Project Settings > API**.
3. Salin **Project URL** ke `SUPABASE_URL` dan **anon public key** ke `SUPABASE_ANON_KEY` di file `.env`.

### 5. Isi `PHONE_NUMBER` dan `OWNER_NUMBER`
Edit file `.env` dan isi nomor WhatsApp format internasional tanpa `+` atau spasi (contoh: `6281234567890`):
```env
PHONE_NUMBER=6281234567890
OWNER_NUMBER=6281234567890
GEMINI_API_KEY=isi_api_key_gemini_kamu
DOWNLOADER_API_KEY=isi_api_key_downloader_kamu
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxx
PORT=3000
```

### 6. Jalankan Bot Secara Lokal
```bash
node bot/index.js
```
Bot akan meminta **Pairing Code 8 Digit** dan menampilkannya di terminal (`KODE PAIRING KAMU: XXXX-XXXX`) serta di Web Dashboard (`http://localhost:3000/pairing`).

### 7. Masukkan Pairing Code di WhatsApp (1 HP)
1. Buka aplikasi **WhatsApp** di HP kamu.
2. Ketuk ikon **Titik 3** di pojok kanan atas.
3. Pilih **Perangkat Tertaut** > **Tautkan Perangkat**.
4. Ketuk **Tautkan dengan Nomor Telepon**.
5. Masukkan kode pairing 8 digit yang muncul di terminal atau web dashboard.

### 8. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit SPIVER BOT"
git branch -M main
git remote add origin https://github.com/username/spiver-bot.git
git push -u origin main
```

### 9. Deploy Web Dashboard ke Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub.
2. Klik **Add New Project** > pilih repository `spiver-bot`.
3. Biarkan **Framework Preset** pada `Other` (file `vercel.json` sudah otomatis mengarahkan traffic ke folder `web/`).
4. Klik **Deploy**.
5. Setelah live, buka dashboard Vercel kamu dan tempel URL Railway bot kamu di kolom **URL Server Bot Railway** agar dashboard menampilkan status & kode pairing secara real-time.

### 10. Deploy Bot ke Railway
1. Buka [https://railway.app](https://railway.app) dan login dengan akun GitHub.
2. Klik **New Project** > **Deploy from GitHub repo** > pilih `spiver-bot`.
3. Masuk ke tab **Variables** di service Railway kamu dan tambahkan semua variabel dari `.env`:
   - `PHONE_NUMBER`
   - `OWNER_NUMBER`
   - `GEMINI_API_KEY`
   - `DOWNLOADER_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `PORT=3000`
4. Railway otomatis membaca `railway.json` dan menjalankan `node bot/index.js`.
5. Buka **Deploy Logs** atau URL domain Railway (`/pairing`) untuk melihat kode pairing 8 digit dan tautkan ke WhatsApp kamu.
