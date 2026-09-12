# Web Phone Tracker

## SnapBooth React

Versi React SnapBooth tersedia di proyek ini. Jalankan `npm ci` lalu `npm run dev` dan buka `http://127.0.0.1:5173`.
Panduan lengkap, audit, struktur source, dan pengujian ada di [SNAPBOOTH.md](SNAPBOOTH.md).
Perintah Flask di bawah menjalankan aplikasi legacy, bukan entry point React.

Versi web-only. Tidak perlu Android Studio.

## Cara kerja

HP -> browser `/track` -> browser Geolocation API -> Flask -> SQLite -> `/dashboard`

## 1. Install dependency

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Install:

```bash
pip install -r requirements.txt
```

## 2. Buat file .env

Copy `.env.example` menjadi `.env`.

Windows CMD:

```bash
copy .env.example .env
```

PowerShell / Linux / macOS:

```bash
cp .env.example .env
```

Isi contoh:

```env
TRACKER_TOKEN=token-rahasia-panjang-123456789
DASHBOARD_USER=admin
DASHBOARD_PASS=password-kuat
PORT=5001
```

> **Catatan Windows:** Jika port 5000 ditolak oleh Windows (`WinError 10013` karena port exclusion), gunakan `PORT=5001` di `.env`, lalu sesuaikan perintah ngrok ke port yang sama (`ngrok http 5001`).

## 3. Jalankan Flask

```bash
python app.py
```

## 4. Jalankan ngrok

Gunakan port sesuai file `.env` (misal 5001 atau 5000):

```bash
ngrok http 5001
```

Contoh URL:

```text
https://abc123.ngrok-free.app
```

## 5. Dari HP yang ingin dilacak

Buka:

```text
https://abc123.ngrok-free.app/track
```

Masukkan `TRACKER_TOKEN`, lalu klik **Mulai Tracking**.

Browser akan meminta izin lokasi.

## 6. Lihat dashboard

Dari laptop / HP lain buka:

```text
https://abc123.ngrok-free.app/dashboard
```

Masukkan username dan password dashboard dari `.env`.

## 7. Menjalankan pengujian otomatis (Opsional)

Untuk memverifikasi fungsionalitas API dan logika frontend:

Python/Flask (15 pengujian):
```bash
python -m unittest discover -s tests -v
```

JavaScript/Frontend (13 pengujian, membutuhkan Node.js):
```bash
node --test tests/track.test.cjs tests/dashboard.test.cjs
```

## Batasan penting web browser

Web browser bukan aplikasi native.

Tracking dapat berhenti jika:

- tab ditutup;
- browser ditutup;
- HP mematikan browser di background;
- mode hemat baterai agresif;
- koneksi internet putus;
- izin lokasi dicabut.

Karena itu proyek ini cocok untuk pembelajaran dan penggunaan saat halaman tracking aktif.
Untuk sistem anti-hilang yang benar-benar bisa bekerja setelah browser ditutup, aplikasi native atau layanan bawaan OS seperti Find My Device lebih cocok.

## Keamanan

- Pakai URL HTTPS dari ngrok.
- Jangan bagikan `TRACKER_TOKEN`.
- Jangan pakai password dashboard yang sama dengan akun penting.
- Hanya gunakan untuk perangkat milik sendiri atau perangkat yang pemiliknya memberi izin.
