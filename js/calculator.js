/**
 * js/calculator.js
 * Logika rumus kalkulator harga dinamis Percetakan TDP sesuai panduan bisnis:
 * - Varian tetap: hargaDasar * qty
 * - Meteran: panjang * lebar (tanpa pembulatan ke atas) * hargaDasar * qty (maksimal lebar 1.5 meter)
 * - A3+ lembaran: hargaDasar * (2 jika cetak 2 sisi) * qty
 * - Addon / Finishing: gratis jika qty < min_qty_berbayar
 * - Biaya Jasa Desain: Rp0 (file sendiri/desain ringan) atau Rp50.000 / Rp100.000 (desain rumit)
 * - Skema DP minimal 50%
 */

function hitungHargaPesanan(params) {
  const {
    tipeHitung = "varian_tetap",
    hargaDasar = 0,
    moq = 1,
    qty = 1,
    panjang = 1,
    lebar = 1,
    jumlahSisi = 1,
    selectedAddons = [],
    biayaDesain = 0
  } = params;

  // 1. Validasi Qty dasar
  const cleanQty = parseInt(qty, 10);
  if (isNaN(cleanQty) || cleanQty <= 0) {
    return {
      valid: false,
      pesanError: "Jumlah pesanan (Qty) minimal 1."
    };
  }

  // Validasi Minimum Order (MoQ)
  if (cleanQty < moq) {
    return {
      valid: false,
      pesanError: `Minimal pemesanan untuk varian ini adalah ${moq} pcs.`
    };
  }

  let hargaCetakUtama = 0;
  let luasMeter = 0;

  // 2. Hitung Harga Cetak Utama sesuai Tipe Produk
  if (tipeHitung === "meteran") {
    const p = parseFloat(panjang);
    const l = parseFloat(lebar);

    if (isNaN(p) || p <= 0 || isNaN(l) || l <= 0) {
      return {
        valid: false,
        pesanError: "Harap masukkan panjang dan lebar yang valid (lebih dari 0)."
      };
    }

    if (l > 1.5) {
      return {
        valid: false,
        pesanError: "Lebar maksimal untuk cetak meteran adalah 1.5 meter (150 cm)."
      };
    }

    // Luas m2 presisi tanpa pembulatan ke atas (sesuai spesifikasi TDP)
    luasMeter = p * l;
    if (luasMeter * cleanQty < 1) {
      return {
        valid: false,
        pesanError: `Total luas cetak adalah ${(luasMeter * cleanQty).toFixed(2)} m². Minimal total order meteran adalah 1 m².`
      };
    }

    hargaCetakUtama = Math.round(luasMeter * hargaDasar * cleanQty);

  } else if (tipeHitung === "a3_lembar") {
    // Jika 2 sisi, harga dikali 2
    const pengaliSisi = parseInt(jumlahSisi, 10) === 2 ? 2 : 1;
    hargaCetakUtama = (hargaDasar * pengaliSisi) * cleanQty;

  } else {
    // Varian tetap (Akrilik, Sticker RGB, Artprint)
    hargaCetakUtama = hargaDasar * cleanQty;
  }

  // 3. Hitung Total Addon & Finishing
  let totalBiayaAddon = 0;
  const rincianAddons = [];

  selectedAddons.forEach(addon => {
    // Aturan TDP: Jika min_qty_berbayar = 10, maka qty < 10 gratis (Rp0)
    const isGratis = cleanQty < addon.min_qty_berbayar;
    const biayaAddon = isGratis ? 0 : addon.harga * cleanQty;
    totalBiayaAddon += biayaAddon;

    rincianAddons.push({
      nama: addon.nama,
      hargaSatuan: addon.harga,
      isGratis: isGratis,
      biayaTotal: biayaAddon,
      catatan: isGratis ? `Gratis (Promo Qty < ${addon.min_qty_berbayar} pcs)` : `Dikenakan biaya untuk Qty >= ${addon.min_qty_berbayar} pcs`
    });
  });

  // 4. Total Keseluruhan
  const subtotal = hargaCetakUtama + totalBiayaAddon + biayaDesain;

  return {
    valid: true,
    rincian: {
      tipeHitung,
      hargaDasar,
      cleanQty,
      luasMeter,
      hargaCetakUtama,
      rincianAddons,
      totalBiayaAddon,
      biayaDesain,
      subtotal,
      dp50Persen: Math.round(subtotal * 0.5) // DP 50%
    }
  };
}

