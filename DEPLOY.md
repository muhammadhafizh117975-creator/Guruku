# 🚀 Panduan Penyebaran (Deployment) - GuruKu

Dokumen ini menjelaskan langkah-langkah mudah untuk mempublikasikan aplikasi **GuruKu** ke **GitHub Pages** dan **Vercel** agar dapat diakses secara online oleh guru dan rekan sekolah Anda dari mana saja.

---

## 💻 1. Penyebaran Otomatis ke GitHub Pages

Kami telah menyertakan Alur Kerja GitHub Actions (`.github/workflows/deploy.yml`) yang akan secara otomatis mengompilasi dan mengunggah aplikasi Anda ke GitHub Pages setiap kali Anda mengirimkan (*push*) kode baru ke repositori Anda (`main` atau `master`).

### Langkah-langkah Pengaturan di GitHub:

1. **Buat Repositori Baru di GitHub**:
   - Masuk ke akun GitHub Anda dan buat repositori publik baru (misalnya dengan nama `guruku` atau `Sistem-Administrasi-Guru`).
   - **PENTING**: Jangan tambahkan file README, `.gitignore`, atau lisensi bawaan saat membuat repositori di GitHub, karena semua file tersebut sudah tersedia lengkap di folder proyek Anda.

2. **Hubungkan Kode Lokal ke Repositori GitHub**:
   Buka terminal di direktori proyek lokal Anda, lalu jalankan rangkaian perintah berikut untuk mengunggah proyek ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Inisialisasi aplikasi GuruKu dan konfigurasi deployment"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPOSITORI.git
   git push -u origin main
   ```
   *(Ganti `USERNAME_ANDA` dan `NAMA_REPOSITORI` sesuai akun dan nama repositori Anda).*

3. **Aktifkan GitHub Actions untuk GitHub Pages**:
   - Masuk ke halaman repositori Anda di situs **GitHub**.
   - Klik tab **Settings** (Pengaturan) di bagian menu atas.
   - Di panel menu sebelah kiri, klik menu **Pages**.
   - Pada bagian **Build and deployment** -> **Source**, pilih opsi **GitHub Actions** (bukan *Deploy from a branch*).
   - Selesai! Alur kerja otomatis akan berjalan seketika.

4. **Periksa Status Penyebaran**:
   - Klik tab **Actions** di bagian atas repositori GitHub Anda untuk memantau status pembangunan (*build*).
   - Setelah proses selesai (biasanya kurang dari 2 menit), Anda akan melihat tautan web publik aplikasi Anda yang siap dibagikan! Tautan ini biasanya berformat:
     `https://USERNAME_ANDA.github.io/NAMA_REPOSITORI/`

---

## ⚡ 2. Penyebaran Instan ke Vercel

Vercel adalah platform hosting yang sangat cepat dan ideal untuk aplikasi frontend modern berbasis React dan Vite.

### Langkah-langkah Penyebaran ke Vercel:

1. **Daftar & Masuk ke Vercel**:
   - Buka [Vercel](https://vercel.com/) dan masuk menggunakan akun GitHub Anda.

2. **Impor Proyek**:
   - Pada halaman Dashboard Vercel, klik tombol **Add New** lalu pilih **Project**.
   - Cari dan pilih repositori GitHub Anda (misal: `guruku`) kemudian klik tombol **Import**.

3. **Konfigurasi Proyek**:
   - Vercel akan secara otomatis mendeteksi konfigurasi **Vite** dan menyelaraskan pengaturan build:
     - **Framework Preset**: `Vite` (Otomatis)
     - **Build Command**: `npm run build` (Otomatis)
     - **Output Directory**: `dist` (Otomatis)
   - Anda tidak perlu mengubah pengaturan bawaan ini.

4. **Deploy & Selesai**:
   - Klik tombol **Deploy**.
   - Dalam hitungan detik, aplikasi GuruKu Anda akan aktif secara online lengkap dengan domain gratis berakhiran `.vercel.app` yang dapat Anda bagikan langsung kepada rekan sejawat.

---

## 🔒 Catatan Keamanan & Penyimpanan Data

Aplikasi GuruKu mengusung prinsip **Offline-First**. Semua data tersimpan dengan aman pada memori lokal (*Local Storage* / *IndexedDB*) dari browser guru masing-masing.

- **Keamanan Akun & Google Sheets**: Koneksi ke awan (cloud) Google Sheets diaktifkan secara mandiri oleh masing-masing guru melalui menu **Pengaturan Aplikasi** -> **Hubungkan ke Google Workspace**. Data sekolah atau nilai siswa tidak akan bocor ke publik karena integrasi Sheets terhubung langsung ke drive Google pribadi masing-masing pengguna.
- **Kunci Rahasia (API Keys)**: Aplikasi ini tidak menyimpan kunci rahasia secara keras (*hardcoded*). Semua variabel lingkungan dikelola secara aman lewat pengaturan platform.
