

# Mapan - Aplikasi Manajemen Keuangan Pribadi

**Mapan** adalah aplikasi web modern yang dirancang untuk membantu Anda mengelola keuangan pribadi dengan lebih mudah dan efektif. Lacak pemasukan, pengeluaran, buat anggaran, dan capai target finansial Anda di satu tempat.

---

## ✨ Fitur Utama

-   **Dashboard Interaktif**: Dapatkan ringkasan visual dari kondisi keuangan Anda, termasuk kekayaan bersih, arus kas bulanan, dan progres target terdekat.
-   **Manajemen Transaksi**: Catat setiap pemasukan dan pengeluaran dengan mudah. Gunakan kategori kustom untuk analisis yang lebih mendalam.
-   **Anggaran Fleksibel**: Buat anggaran bulanan atau tahunan untuk setiap kategori pengeluaran dan pantau penggunaannya secara real-time dengan progress bar.
-   **Target Finansial**: Tetapkan tujuan keuangan Anda, seperti dana darurat atau liburan, dan lacak progres tabungan Anda untuk setiap target.
-   **Laporan Komprehensif**: Hasilkan laporan keuangan periodik yang dapat dicetak atau disimpan sebagai PDF, lengkap dengan ringkasan, grafik, dan rincian transaksi.
-   **Responsif & Modern**: Tampilan yang bersih dan dapat diakses dengan baik di perangkat desktop maupun mobile.

---

## 🛠️ Teknologi yang Digunakan

-   **Frontend**: [Vue.js 3](https://vuejs.org/) (Composition API)
-   **Backend & Database**: [Supabase](https://supabase.io/)
-   **Routing**: [Vue Router](https://router.vuejs.org/)
-   **Manajemen State**: [Pinia](https://pinia.vuejs.org/)
-   **Visualisasi Data**: [Chart.js](https://www.chartjs.org/)
-   **Ikon**: [Feather Icons](https://feathericons.com/)

---

## 🚀 Instalasi & Menjalankan Proyek

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer lokal Anda.

### Prasyarat

-   [Node.js](https://nodejs.org/en/) (v16 atau lebih tinggi)
-   [Git](https://git-scm.com/)
-   Akun [Supabase](https://supabase.io/) (untuk database dan otentikasi)

### 1. Clone Repositori

```bash
git clone [https://github.com/USERNAME/mapan-app.git](https://github.com/USERNAME/mapan-app.git)
cd mapan-app
````

*Ganti `USERNAME/mapan-app` dengan URL repositori Anda.*

### 2\. Instal Dependensi

```bash
npm install
```

### 3\. Konfigurasi Environment Variables

Anda memerlukan **URL Proyek** dan **Kunci Anon (Public Key)** dari Supabase.

1.  Buat akun atau login di [Supabase](https://supabase.io/).
2.  Buat proyek baru.
3.  Di dashboard proyek Anda, buka **Settings \> API**.
4.  Salin **Project URL** dan **Project API Keys** (kunci `anon`).

Selanjutnya, buat file `.env` di root folder proyek Anda dengan menyalin dari `.env.example` (jika ada) atau membuatnya secara manual.

**File: `.env`**

```
VITE_SUPABASE_URL="URL_PROYEK_SUPABASE_ANDA"
VITE_SUPABASE_ANON_KEY="KUNCI_ANON_SUPABASE_ANDA"
```

### 4\. Setup Database di Supabase

Jalankan skrip SQL berikut di **SQL Editor** Supabase untuk membuat tabel yang dibutuhkan oleh aplikasi:

```sql
-- (Masukkan skrip SQL untuk membuat tabel transactions, budgets, goals, dll. di sini)
-- Contoh:
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tambahkan tabel lain (budgets, goals) sesuai struktur Anda
```

### 5\. Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi sekarang akan berjalan di `http://localhost:5173` (atau port lain yang tersedia).

-----

## 📂 Struktur Proyek

```
/src
|-- /assets         # Aset statis seperti gambar dan CSS global
|-- /components     # Komponen Vue yang dapat digunakan kembali (Sidebar, dll.)
|-- /router         # Konfigurasi routing aplikasi
|-- /store          # Manajemen state dengan Pinia (financeStore)
|-- /views          # Komponen halaman (Dashboard, Transaksi, dll.)
|-- App.vue         # Komponen root aplikasi
|-- main.js         # Titik masuk utama aplikasi
`-- supabaseClient.js # Konfigurasi klien Supabase
```

-----

## 🤝 Kontribusi

Kontribusi sangat kami harapkan\! Jika Anda ingin membantu, silakan fork repositori ini dan buat *pull request*. Untuk perubahan besar, mohon buka *issue* terlebih dahulu untuk mendiskusikan apa yang ingin Anda ubah.

-----

```
```
