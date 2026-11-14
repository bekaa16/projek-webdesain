/**
 * js/cart.js
 * Manajemen keranjang belanja, checkout, dan transaksi pesanan Percetakan TDP menggunakan localStorage.
 */

const CART_KEY = "tdp_printing_cart";
const ORDERS_KEY = "tdp_printing_orders";
const WA_ADMIN_NUMBER = "6281234567890"; // Nomor WhatsApp CS / Admin TDP

// Ambil seluruh item di keranjang
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Gagal membaca cart dari localStorage", e);
    return [];
  }
}

// Simpan data keranjang
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// Hitung total jumlah item di keranjang
function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.qty || 1), 0);
}

// Tambah item ke keranjang
function addToCart(itemObj) {
  const cart = getCart();
  const newItem = {
    cartId: Date.now() + "_" + Math.floor(Math.random() * 1000),
    waktuDibuat: new Date().toISOString(),
    ...itemObj
  };
  cart.push(newItem);
  saveCart(cart);
  return newItem;
}

// Hapus item dari keranjang berdasarkan cartId
function removeFromCart(cartId) {
  const cart = getCart().filter(item => String(item.cartId) !== String(cartId));
  saveCart(cart);
}

// Kosongkan keranjang
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

// Update lencana angka di navbar
function updateCartBadge() {
  const badgeEls = document.querySelectorAll(".cart-count-badge");
  const count = getCartCount();
  badgeEls.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  });
}

// Ambil seluruh daftar pesanan (dengan inisialisasi dummy data jika baru pertama kali)
function getOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      // Inisialisasi dengan data dummy awal dari data.js jika ada
      if (typeof DUMMY_ORDERS !== "undefined") {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(DUMMY_ORDERS));
        return DUMMY_ORDERS;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Gagal membaca orders dari localStorage", e);
    return [];
  }
}

// Simpan daftar pesanan
function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Cari pesanan berdasarkan kode invoice
function getOrderByInvoice(kodeInvoice) {
  if (!kodeInvoice) return null;
  const cleanKode = kodeInvoice.trim().toUpperCase();
  const orders = getOrders();
  return orders.find(o => o.kodeInvoice.toUpperCase() === cleanKode) || null;
}

// Update status pesanan (Simulasi Admin)
function updateOrderStatus(kodeInvoice, statusBaru, biayaDesainUpdate = null, catatanAdmin = "") {
  const orders = getOrders();
  const index = orders.findIndex(o => o.kodeInvoice.toUpperCase() === kodeInvoice.trim().toUpperCase());
  if (index === -1) return false;

  orders[index].statusProduksi = statusBaru;
  orders[index].terakhirDiperbarui = new Date().toLocaleString("id-ID");

  if (biayaDesainUpdate !== null && !isNaN(biayaDesainUpdate)) {
    const selisih = biayaDesainUpdate - (orders[index].biayaDesainTambahan || 0);
    orders[index].biayaDesainTambahan = biayaDesainUpdate;
    orders[index].totalTagihan += selisih;
    orders[index].sisaTagihan += selisih;
  }

  if (catatanAdmin) {
    orders[index].catatanAdmin = catatanAdmin;
  }

  saveOrders(orders);
  return orders[index];
}

function confirmOrderDP(kodeInvoice) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.kodeInvoice.toUpperCase() === kodeInvoice.trim().toUpperCase());
  if (index === -1) return false;

  const order = orders[index];
  if (
    order.statusProduksi !== "Menunggu Konfirmasi DP" ||
    !Number.isFinite(Number(order.nominalBayarSekarang)) ||
    Number(order.nominalBayarSekarang) <= 0
  ) {
    return false;
  }

  order.dpTerkonfirmasi = true;
  order.statusProduksi = "Proses Desain & Revisi";
  order.terakhirDiperbarui = new Date().toLocaleString("id-ID");
  saveOrders(orders);
  return order;
}

// Reset data pesanan ke default demo
function resetOrdersToDemo() {
  if (typeof DUMMY_ORDERS !== "undefined") {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(DUMMY_ORDERS));
  } else {
    localStorage.removeItem(ORDERS_KEY);
  }
}

// Proses Pembuatan Order (Checkout)
function createOrder(customerData, skemaBayar, metodeKirim) {
  const cart = getCart();
  if (cart.length === 0) return null;

  const totalTagihan = cart.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const isDP50 = skemaBayar === "DP_50";
  const nominalBayarSekarang = isDP50 ? Math.round(totalTagihan * 0.5) : totalTagihan;
  const sisaTagihan = totalTagihan - nominalBayarSekarang;

  const randomCode = Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    kodeInvoice: "TDP-" + randomCode,
    tanggal: new Date().toLocaleDateString("id-ID"),
    waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    customer: {
      nama: customerData.nama || "Pelanggan TDP",
      wa: customerData.wa || "-",
      email: customerData.email || "-",
      catatan: customerData.catatan || "-"
    },
    metodeKirim: metodeKirim || "Ambil di Toko",
    skemaBayar: isDP50 ? "DP 50%" : "Lunas 100%",
    totalTagihan: totalTagihan,
    nominalBayarSekarang: nominalBayarSekarang,
    sisaTagihan: sisaTagihan,
    statusProduksi: isDP50 ? "Menunggu Konfirmasi DP" : "Antrian Produksi",
    items: [...cart]
  };

  // Simpan ke riwayat pesanan (paling baru di atas)
  const orders = getOrders();
  orders.unshift(newOrder);
  saveOrders(orders);

  // Kosongkan keranjang
  clearCart();

  return newOrder;
}

// Buat URL WhatsApp untuk kirim konfirmasi pesanan
function generateWhatsAppUrl(order) {
  const itemsText = order.items.map((item, idx) => {
    let spec = "";
    if (item.tipeHitung === "meteran") {
      spec = `Ukuran: ${item.panjang}m x ${item.lebar}m (${item.luasMeter} m²)`;
    } else if (item.tipeHitung === "a3_lembar") {
      spec = `Cetak: ${item.jumlahSisi === 2 ? "2 Sisi (Bolak-balik)" : "1 Sisi"}`;
    } else {
      spec = `Varian: ${item.varianUkuran || item.varianNama}`;
    }

    const addonList = item.addons && item.addons.length > 0
      ? item.addons.map(a => a.nama + (a.isGratis ? " (Gratis)" : "")).join(", ")
      : "Tanpa Addon";

    const desainInfo = item.desain ? `${item.desain.tipe} (${item.desain.link ? item.desain.link : "Upload/Konsul"})` : "-";

    return `${idx + 1}. *${item.namaProduk}*\n` +
      `   - ${spec}\n` +
      `   - Qty: ${item.qty} pcs\n` +
      `   - Finishing: ${addonList}\n` +
      `   - Desain: ${desainInfo}\n` +
      `   - Subtotal: ${formatRupiah(item.subtotal)}`;
  }).join("\n\n");

  const waMessage = 
`Halo Admin Percetakan TDP, saya ingin konfirmasi pesanan berikut:

*INVOICE:* ${order.kodeInvoice}
*Tanggal:* ${order.tanggal} (${order.waktu || ""})

*DATA PEMESAN:*
- Nama: ${order.customer.nama}
- No. WhatsApp: ${order.customer.wa}
- Metode Ambil: ${order.metodeKirim}
- Catatan: ${order.customer.catatan || "-"}

*RINCIAN PESANAN:*
${itemsText}

*RINGKASAN PEMBAYARAN:*
- Total Tagihan: ${formatRupiah(order.totalTagihan)}
- Skema Pembayaran: *${order.skemaBayar}*
- Wajib Bayar Sekarang: *${formatRupiah(order.nominalBayarSekarang)}*
- Sisa Tagihan (Pelunasan saat selesai): ${formatRupiah(order.sisaTagihan)}

Status Saat Ini: ${order.statusProduksi}
Mohon info nomor rekening / QRIS pembayaran. Terima kasih!`;

  return `https://wa.me/${WA_ADMIN_NUMBER}?text=${encodeURIComponent(waMessage)}`;
}

