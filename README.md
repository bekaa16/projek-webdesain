# Percetakan TDP

Website katalog dan pemesanan layanan cetak digital yang dibuat sebagai landing page dan sistem order demo untuk percetakan. Proyek ini fokus pada tampilan katalog produk, kalkulator harga real-time, keranjang belanja, status pesanan, serta panel admin untuk mengelola katalog dan stok bahan.

## Deskripsi Proyek

Percetakan TDP adalah aplikasi frontend berbasis HTML, CSS, dan JavaScript murni yang digunakan untuk menampilkan layanan cetak seperti:

- Akrilik 3 mm
- Sticker RGB
- Artprint poster dan kartu koleksi
- Print digital A3+
- Spanduk/banner/decal meteran

Pengguna dapat memilih produk, mengatur spesifikasi, menambahkan addon/finishing, melihat subtotal secara langsung, dan melakukan checkout simulasi. Data demo disimpan di browser menggunakan `localStorage`, sehingga sistem terasa seperti aplikasi order yang sederhana namun fungsional.

## Fitur Utama

- Katalog produk dengan kategori dan filter
- Kalkulator harga otomatis berdasarkan varian, ukuran, quantity, dan addon
- Keranjang belanja untuk mengumpulkan produk yang akan dipesan
- Simulasi checkout dan rincian pembayaran
- Cek antrian dan status produksi pesanan
- Form login dan registrasi pelanggan
- Workspace admin untuk mengelola katalog, stok bahan, dan laporan pesanan
- Tampilan responsif untuk desktop maupun mobile

## Struktur Folder

- `index.html` — halaman beranda dan katalog utama
- `kalkulator.html` — halaman kalkulator harga produk
- `keranjang.html` — halaman keranjang belanja
- `pesanan.html` — halaman cek status dan riwayat pesanan
- `login.html` — halaman masuk/daftar akun
- `admin.html` — panel admin untuk pengelolaan data
- `css/` — file stylesheet utama dan komponen UI
- `js/` — script aplikasi, katalog, kalkulator, keranjang, autentikasi, dan admin
- `assets/` — logo, ikon, dan aset visual

## Teknologi yang Digunakan

- HTML5
- CSS3
- JavaScript Vanilla
- Local Storage Browser

## Cara Menjalankan

Karena proyek ini adalah aplikasi frontend statis, Anda tidak perlu install dependency tambahan.

### Opsi 1: Buka Langsung
Buka file `index.html` di browser.

### Opsi 2: Jalankan Server Lokal
Masuk ke folder proyek lalu jalankan perintah:

```bash
python -m http.server 8000
```

Lalu buka:

```text
http://localhost:8000
```

## Catatan Penting

- Proyek ini merupakan frontend demo, bukan aplikasi backend penuh.
- Semua data order, katalog, dan akun demo disimpan di browser pengguna.
- Untuk kebutuhan produksi nyata, perlu ditambahkan backend, database, autentikasi server-side, dan integrasi pembayaran.

## Lisensi

Proyek ini dibuat untuk keperluan projek web desain dan dapat dikembangkan lebih lanjut sesuai kebutuhan bisnis percetakan.
