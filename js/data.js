/**
 * js/data.js
 * Database JSON katalog produk Percetakan TDP, varian, ukuran, MoQ, addon, serta sample data.
 */

const DEFAULT_KATALOG_TDP = [
  {
    id: "akrilik-3mm",
    kategori: "Akrilik",
    nama: "Gantungan Kunci / Standee Akrilik 3mm",
    tipe_hitung: "varian_tetap", // varian_tetap | meteran | a3_lembar
    estimasi: "Sesuai antrian produksi (1-3 hari)",
    deskripsi: "Akrilik bening ketebalan 3mm dengan hasil cetak UV tajam, potongan laser presisi. Cocok untuk merchandise anime, souvenir event, atau gantungan kunci custom.",
    badge: "Best Seller",
    icon: "gem",
    varian: [
      { id: "akr-1m-4", nama: "Print 1 Muka", ukuran: "4x4 cm", moq: 1, harga: 6500 },
      { id: "akr-1m-5", nama: "Print 1 Muka", ukuran: "5x5 cm", moq: 1, harga: 8800 },
      { id: "akr-1m-6", nama: "Print 1 Muka", ukuran: "6x6 cm", moq: 1, harga: 11500 },
      { id: "akr-1m-7", nama: "Print 1 Muka", ukuran: "7x7 cm", moq: 1, harga: 15300 },
      { id: "akr-1m-8", nama: "Print 1 Muka", ukuran: "8x8 cm", moq: 1, harga: 21000 },
      { id: "akr-2m-4", nama: "Print 2 Muka", ukuran: "4x4 cm", moq: 1, harga: 7300 },
      { id: "akr-2m-5", nama: "Print 2 Muka", ukuran: "5x5 cm", moq: 1, harga: 10000 },
      { id: "akr-2m-6", nama: "Print 2 Muka", ukuran: "6x6 cm", moq: 1, harga: 13300 },
      { id: "akr-2m-7", nama: "Print 2 Muka", ukuran: "7x7 cm", moq: 1, harga: 17700 },
      { id: "akr-2m-8", nama: "Print 2 Muka", ukuran: "8x8 cm", moq: 1, harga: 24200 },
      { id: "akr-2mc-4", nama: "Print 2 Muka + Coating", ukuran: "4x4 cm", moq: 1, harga: 8100 },
      { id: "akr-2mc-5", nama: "Print 2 Muka + Coating", ukuran: "5x5 cm", moq: 1, harga: 11300 },
      { id: "akr-2mc-6", nama: "Print 2 Muka + Coating", ukuran: "6x6 cm", moq: 1, harga: 15100 },
      { id: "akr-2mc-7", nama: "Print 2 Muka + Coating", ukuran: "7x7 cm", moq: 1, harga: 20200 },
      { id: "akr-2mc-8", nama: "Print 2 Muka + Coating", ukuran: "8x8 cm", moq: 1, harga: 27400 },
      { id: "akr-tp-4", nama: "Tanpa Print (Polos)", ukuran: "4x4 cm", moq: 1, harga: 4400 },
      { id: "akr-tp-5", nama: "Tanpa Print (Polos)", ukuran: "5x5 cm", moq: 1, harga: 5800 },
      { id: "akr-tp-6", nama: "Tanpa Print (Polos)", ukuran: "6x6 cm", moq: 1, harga: 7400 },
      { id: "akr-tp-7", nama: "Tanpa Print (Polos)", ukuran: "7x7 cm", moq: 1, harga: 9900 },
      { id: "akr-tp-8", nama: "Tanpa Print (Polos)", ukuran: "8x8 cm", moq: 1, harga: 13600 }
    ],
    addons: [
      { id: "hook-custom", nama: "Ganti Hook Custom (Bintang/Hati)", harga: 4500, min_qty_berbayar: 1 }
    ]
  },
  {
    id: "sticker-rgb",
    kategori: "Sticker RGB",
    nama: "Sticker RGB Ukuran A2 (60x45 cm)",
    tipe_hitung: "varian_tetap",
    estimasi: "Sesuai antrian produksi (1-2 hari)",
    deskripsi: "Cetak sticker kualitas tinggi gamut warna RGB tajam lembaran 60x45 cm. Tinta pekat, anti air, daya rekat kuat.",
    badge: "Warna Tajam",
    icon: "layers",
    varian: [
      { id: "stk-vinyl", nama: "Vinyl Glossy (Sudah termasuk Lam. Doff/Glossy)", ukuran: "60x45 cm (A2)", moq: 2, harga: 50000 },
      { id: "stk-holo-1", nama: "Hologram - Hanya Tinta Warna", ukuran: "60x45 cm (A2)", moq: 2, harga: 90000 },
      { id: "stk-holo-2", nama: "Hologram - Tinta Warna + Tinta Putih", ukuran: "60x45 cm (A2)", moq: 2, harga: 125000 }
    ],
    addons: [
      { id: "lam-doff-glossy", nama: "Tambah Laminasi Doff / Glossy", harga: 15000, min_qty_berbayar: 1 },
      { id: "lam-glitter-vinyl", nama: "Ganti Laminasi Glitter (Khusus Vinyl)", harga: 25000, min_qty_berbayar: 1 },
      { id: "lam-glitter-holo", nama: "Tambah Laminasi Glitter (Khusus Hologram)", harga: 40000, min_qty_berbayar: 1 }
    ]
  },
  {
    id: "artprint",
    kategori: "Artprint",
    nama: "Artprint Poster & Kartu Koleksi",
    tipe_hitung: "varian_tetap",
    estimasi: "Sesuai antrian produksi (1-2 hari)",
    deskripsi: "Cocok untuk poster anti air maupun kartu collectibles fotocard (1 A3 jadi 20 kartu 55x90mm). Kertas pilihan bermutu tinggi.",
    badge: "Koleksi & Fanmerch",
    icon: "image",
    varian: [
      { id: "art-luster", nama: "Poster Luster A0 (Anti Air)", ukuran: "120x80 cm", moq: 1, harga: 90000 },
      { id: "art-ap150", nama: "Kertas Art Paper 150/210 gsm + Lam. Doff/Glossy", ukuran: "42x28 cm (A3)", moq: 1, harga: 10000 },
      { id: "art-ap260", nama: "Kertas Art Paper Tebal 260 gsm + Lam. Doff/Glossy", ukuran: "42x28 cm (A3)", moq: 1, harga: 12000 },
      { id: "art-holo1", nama: "Kertas Hologram 1 Muka (Warna + Putih)", ukuran: "42x28 cm (A3)", moq: 4, harga: 70000 },
      { id: "art-holo2", nama: "Kertas Hologram 2 Muka (Warna + Putih)", ukuran: "42x28 cm (A3)", moq: 2, harga: 140000 }
    ],
    addons: [
      { id: "potong-a4", nama: "Potong A4 (Minimal potong A3)", harga: 10000, min_qty_berbayar: 1 },
      { id: "ganti-holo", nama: "Ganti Laminasi Hologram (Art Paper 150/210)", harga: 15000, min_qty_berbayar: 1 },
      { id: "ganti-glitter", nama: "Ganti Laminasi Glitter (Art Paper 150/210)", harga: 10000, min_qty_berbayar: 1 },
      { id: "ap260-2muka", nama: "Print Dua Muka (Khusus Art Paper 260 gsm)", harga: 6000, min_qty_berbayar: 1 },
      { id: "holo1-belakang", nama: "Print Bagian Kertas + Lam. Doff/Glossy (Holo 1 Muka)", harga: 15000, min_qty_berbayar: 1 },
      { id: "holo2-lam", nama: "Tambah Laminasi Doff/Glossy (Holo 2 Muka)", harga: 7500, min_qty_berbayar: 1 },
      { id: "holo2-glitter", nama: "Tambah Laminasi Glitter (Holo 2 Muka)", harga: 20000, min_qty_berbayar: 1 }
    ]
  },
  {
    id: "print-a3-plus",
    kategori: "Print A3+",
    nama: "Print Digital A3+ (Satuan / Grosir)",
    tipe_hitung: "a3_lembar",
    estimasi: "1 - 2 menit / lembar (file siap cetak)",
    deskripsi: "Cetak lembaran digital A3+ berbagai pilihan kertas (Art Paper, Linen, Chromo, Vinyl). Cetak 2 sisi dikenakan 2x tarif 1 sisi.",
    badge: "Cepat & Fleksibel",
    icon: "printer",
    varian: [
      { id: "a3-ap150", nama: "Art Paper 150 gsm", ukuran: "A3+", moq: 1, harga: 5000 },
      { id: "a3-ap260", nama: "Art Paper 260 gsm", ukuran: "A3+", moq: 1, harga: 6500 },
      { id: "a3-linen", nama: "Kertas Linen / Concorde", ukuran: "A3+", moq: 1, harga: 7500 },
      { id: "a3-chromo", nama: "Sticker Chromo A3+", ukuran: "A3+", moq: 1, harga: 7000 },
      { id: "a3-vinyl", nama: "Sticker Vinyl A3+", ukuran: "A3+", moq: 1, harga: 12000 }
    ],
    addons: [
      { id: "fin-cutting", nama: "Cutting / Pond Presisi (Gratis jika pesan < 10 pcs)", harga: 2000, min_qty_berbayar: 10 }
    ]
  },
  {
    id: "print-meteran",
    kategori: "Print Meteran",
    nama: "Spanduk / Banner / Decal Outdoor (Meteran)",
    tipe_hitung: "meteran",
    max_lebar: 1.5, // Maksimal lebar 150 cm (1.5 meter)
    estimasi: "10 menit / meter (sesuai antrian)",
    deskripsi: "Ukuran custom bebas (lebar maksimal 1.5 meter). Perhitungan presisi sesuai ukuran riil tanpa pembulatan ke atas.",
    badge: "Outdoor & Event",
    icon: "maximize",
    varian: [
      { id: "mtr-flexy280", nama: "Flexy China 280 gr (Standar Spanduk)", ukuran: "Custom (Max L: 1.5m)", moq: 1, harga: 25000 },
      { id: "mtr-korcin440", nama: "Korcin 440 gr (Tebal & Halus)", ukuran: "Custom (Max L: 1.5m)", moq: 1, harga: 45000 },
      { id: "mtr-vinyl90", nama: "Sticker Vinyl 90 gr / Max Decal", ukuran: "Custom (Max L: 1.5m)", moq: 1, harga: 65000 },
      { id: "mtr-luster", nama: "Luster / Albatros (High Resolution)", ukuran: "Custom (Max L: 1.5m)", moq: 1, harga: 75000 }
    ],
    addons: [
      { id: "fin-mata-itik", nama: "Finishing Mata Itik / Seaming Keliling (Gratis jika < 10 pcs)", harga: 5000, min_qty_berbayar: 10 }
    ]
  }
];

const KATALOG_STORAGE_KEY = "tdp_printing_catalog";

function cloneDefaultKatalogTDP() {
  return JSON.parse(JSON.stringify(DEFAULT_KATALOG_TDP));
}

function loadKatalogTDP() {
  const savedCatalog = localStorage.getItem(KATALOG_STORAGE_KEY);
  if (!savedCatalog) return cloneDefaultKatalogTDP();

  try {
    const catalog = JSON.parse(savedCatalog);
    if (!Array.isArray(catalog)) {
      throw new TypeError("Data katalog tersimpan bukan sebuah daftar.");
    }
    return catalog;
  } catch (error) {
    console.error("Gagal membaca data katalog tersimpan.", error);
    return cloneDefaultKatalogTDP();
  }
}

let KATALOG_TDP = loadKatalogTDP();

function saveKatalogTDP() {
  localStorage.setItem(KATALOG_STORAGE_KEY, JSON.stringify(KATALOG_TDP));
}

function resetKatalogTDP() {
  localStorage.removeItem(KATALOG_STORAGE_KEY);
  KATALOG_TDP = cloneDefaultKatalogTDP();
}

// Opsi Jasa Desain
const OPSI_JASA_DESAIN = [
  { id: "desain-ada", nama: "Punya File Sendiri (Siap Cetak PDF/TIFF/Canva/CDR)", biaya: 0, keterangan: "File siap cetak, langsung masuk antrian produksi." },
  { id: "desain-ringan", nama: "Jasa Desain Ringan (Layout, tambah teks, ubah background)", biaya: 0, keterangan: "Gratis Rp0 untuk perapihan sederhana." },
  { id: "desain-rumit-50", nama: "Jasa Desain Rumit Standar (Konsep baru, max 5x revisi)", biaya: 50000, keterangan: "Maksimal 5x revisi minor. Dikerjakan desainer TDP." },
  { id: "desain-rumit-100", nama: "Jasa Desain Rumit Kompleks (Full custom / ilustrasi, max 5x revisi)", biaya: 100000, keterangan: "Desain dari nol dengan detail tinggi & maksimal 5x revisi." }
];

// Tahapan Status Produksi
const STATUS_PRODUKSI_LIST = [
  { id: "menunggu_dp", label: "Menunggu Konfirmasi DP", step: 1, color: "#111111", icon: "wallet" },
  { id: "proses_desain", label: "Proses Desain & Revisi", step: 2, color: "#111111", icon: "pen-tool" },
  { id: "antrian_produksi", label: "Antrian Produksi", step: 3, color: "#111111", icon: "clock" },
  { id: "proses_cetak", label: "Proses Cetak Mesin", step: 4, color: "#111111", icon: "printer" },
  { id: "finishing", label: "Finishing & QC", step: 5, color: "#111111", icon: "scissors" },
  { id: "siap_diambil", label: "Siap Diambil / Dikirim", step: 6, color: "#111111", icon: "check-circle" }
];

// Helper: Format Rupiah
function formatRupiah(number) {
  if (isNaN(number) || number === null || number === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// Helper: Dapatkan Produk berdasarkan ID
function getProdukById(id) {
  return KATALOG_TDP.find(p => p.id === id) || null;
}

// Helper: Ambil semua kategori unik
function getDaftarKategori() {
  return ["Semua", ...new Set(KATALOG_TDP.map(p => p.kategori))];
}

// Data Awal Riwayat Pesanan Demo (Jika localStorage belum ada data)
const DUMMY_ORDERS = [
  {
    kodeInvoice: "TDP-782194",
    tanggal: "11/11/2026",
    customer: {
      nama: "Rian Pratama",
      wa: "081298765432",
      catatan: "Warna mohon agak kontras, jangan terlalu gelap."
    },
    metodeKirim: "Ambil di Toko",
    skemaBayar: "DP_50",
    totalTagihan: 140000,
    nominalBayarSekarang: 70000,
    sisaTagihan: 70000,
    statusProduksi: "Proses Cetak",
    items: [
      {
        cartId: 1731300001,
        produkId: "akrilik-3mm",
        namaProduk: "Gantungan Kunci / Standee Akrilik 3mm",
        varianNama: "Print 2 Muka + Coating (5x5 cm)",
        hargaSatuan: 11300,
        qty: 10,
        tipeHitung: "varian_tetap",
        addons: [{ nama: "Ganti Hook Custom (Bintang/Hati)", harga: 4500, min_qty_berbayar: 1 }],
        desain: { tipe: "Punya File Sendiri", biaya: 0, link: "https://drive.google.com/contoh-file" },
        subtotal: 158000
      }
    ]
  },
  {
    kodeInvoice: "TDP-512044",
    tanggal: "12/11/2026",
    customer: {
      nama: "Studio Kreatif Aurora",
      wa: "085711223344",
      catatan: "Untuk event Sabtu besok, terima kasih."
    },
    metodeKirim: "Kurir Instan (Gojek/Grab)",
    skemaBayar: "LUNAS",
    totalTagihan: 135000,
    nominalBayarSekarang: 135000,
    sisaTagihan: 0,
    statusProduksi: "Antrian Produksi",
    items: [
      {
        cartId: 1731300002,
        produkId: "print-meteran",
        namaProduk: "Spanduk / Banner / Decal Outdoor (Meteran)",
        varianNama: "Korcin 440 gr (Tebal & Halus)",
        hargaSatuan: 45000,
        qty: 1,
        panjang: 2.0,
        lebar: 1.5,
        tipeHitung: "meteran",
        addons: [{ nama: "Finishing Mata Itik / Seaming Keliling", harga: 5000, min_qty_berbayar: 10 }],
        desain: { tipe: "Jasa Desain Ringan", biaya: 0, link: "" },
        subtotal: 135000
      }
    ]
  }
];

