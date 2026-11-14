/**
 * js/app.js
 * Logika interaksi antarmuka pengguna (DOM manipulation, routing sederhana, & event handlers)
 * untuk seluruh halaman Percetakan TDP.
 */

const APP_ICON_IDS = new Set([
  "shopping-cart", "shopping-bag", "search", "rotate-ccw", "clock", "map-pin", "phone",
  "printer", "arrow-left", "arrow-right", "check-circle", "info", "alert-triangle",
  "lightbulb", "zap", "clipboard-list", "sparkles", "palette", "pencil-line", "trash",
  "gem", "layers", "image", "maximize", "wallet", "pen-tool", "scissors", "package", "lock"
]);

function iconMarkup(name, className = "icon") {
  const iconName = APP_ICON_IDS.has(name) ? name : "package";
  return `<svg class="${className}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#${iconName}"></use></svg>`;
}

// ==========================================================================
// Toast Notifications
// ==========================================================================
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "info";
  if (type === "success") icon = "check-circle";
  if (type === "error") icon = "alert-triangle";

  toast.innerHTML = `${iconMarkup(icon, "icon toast-icon")}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

// Inisialisasi Umum saat Halaman Dimuat
document.addEventListener("DOMContentLoaded", () => {
  // 1. Update Cart Badge di Navbar
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }

  // 2. Setup Hamburger Menu Mobile
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector(".nav-menu");
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

  // 3. Deteksi Halaman Aktif & Jalankan Modul Terkait
  if (document.getElementById("catalog-products-grid")) {
    initCatalogPage();
  } else if (document.getElementById("calculator-page-root")) {
    initCalculatorPage();
  } else if (document.getElementById("cart-page-root")) {
    initCartPage();
  } else if (document.getElementById("tracking-page-root")) {
    initTrackingPage();
  }
});

// ==========================================================================
// Halaman Utama / Katalog (index.html)
// ==========================================================================
function initCatalogPage() {
  const filterContainer = document.getElementById("category-filter-bar");
  const catalogGrid = document.getElementById("catalog-products-grid");

  if (!catalogGrid) return;

  const categories = getDaftarKategori();
  let currentCategory = "Semua";

  // Render Filter Buttons
  if (filterContainer) {
    filterContainer.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === currentCategory ? "active" : ""}" data-category="${cat}">
        ${cat}
      </button>
    `).join("");

    filterContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  }

  function getMinPrice(product) {
    if (!product.varian || product.varian.length === 0) return 0;
    return Math.min(...product.varian.map(v => v.harga));
  }

  function renderProducts() {
    const filtered = currentCategory === "Semua"
      ? KATALOG_TDP
      : KATALOG_TDP.filter(p => p.kategori === currentCategory);

    catalogGrid.innerHTML = filtered.map(item => {
      const minPrice = getMinPrice(item);

      return `
        <article class="product-card">
          <div class="product-banner">
            <span class="product-banner-badge badge badge-cyan">${item.badge || item.kategori}</span>
            <span class="product-banner-category">${item.kategori}</span>
            ${iconMarkup(item.icon, "icon product-icon-display")}
          </div>
          <div class="product-card-body">
            <h3 class="product-card-title">${item.nama}</h3>
            <p class="product-card-desc">${item.deskripsi}</p>
            <div class="product-card-footer">
              <div>
                <span class="product-price-label">Mulai dari</span>
                <span class="product-price-value">${formatRupiah(minPrice)}</span>
              </div>
              <a href="kalkulator.html?id=${item.id}" class="btn btn-primary btn-sm">
                Pesan / Hitung Harga ${iconMarkup("arrow-right")}
              </a>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  renderProducts();
}

// ==========================================================================
// Halaman Kalkulator & Pemesanan Real-Time (kalkulator.html)
// ==========================================================================
function initCalculatorPage() {
  const urlParams = new URLSearchParams(window.location.search);
  let productId = urlParams.get("id") || "akrilik-3mm";
  let activeProduct = getProdukById(productId) || KATALOG_TDP[0];

  // DOM Elements
  const productSelectEl = document.getElementById("calc-product-select");
  const productBadgeEl = document.getElementById("calc-product-badge");
  const productTitleEl = document.getElementById("calc-product-title");
  const productDescEl = document.getElementById("calc-product-desc");
  const productEstEl = document.getElementById("calc-product-est");
  const dynamicFieldsEl = document.getElementById("calc-dynamic-fields");
  const addonsContainerEl = document.getElementById("calc-addons-container");
  const qtyInputEl = document.getElementById("calc-qty-input");
  const qtyMinusBtn = document.getElementById("calc-qty-minus");
  const qtyPlusBtn = document.getElementById("calc-qty-plus");
  const designOptionsEl = document.getElementById("calc-design-options");
  const designFileWrapper = document.getElementById("calc-design-file-wrapper");
  const designFileInput = document.getElementById("calc-design-file-link");
  const customerNotesInput = document.getElementById("calc-customer-notes");

  // Summary Elements
  const summaryProductLabel = document.getElementById("summary-product-name");
  const summarySpecLabel = document.getElementById("summary-spec-detail");
  const summaryPrintPrice = document.getElementById("summary-print-price");
  const summaryAddonPrice = document.getElementById("summary-addon-price");
  const summaryDesignPrice = document.getElementById("summary-design-price");
  const summaryTotalSubtotal = document.getElementById("summary-total-subtotal");
  const summaryDp50 = document.getElementById("summary-dp-50");
  const summaryErrorBanner = document.getElementById("summary-error-banner");
  const btnAddToCart = document.getElementById("btn-add-to-cart");
  const btnDirectCheckout = document.getElementById("btn-direct-checkout");

  // Isi dropdown pilihan produk jika ada
  if (productSelectEl) {
    productSelectEl.innerHTML = KATALOG_TDP.map(p => `
      <option value="${p.id}" ${p.id === activeProduct.id ? "selected" : ""}>
        ${p.kategori} - ${p.nama}
      </option>
    `).join("");

    productSelectEl.addEventListener("change", (e) => {
      const newProduct = getProdukById(e.target.value);
      if (newProduct) {
        activeProduct = newProduct;
        // Update URL tanpa reload
        window.history.replaceState({}, "", `kalkulator.html?id=${activeProduct.id}`);
        renderProductForm();
      }
    });
  }

  // Render Pilihan Jasa Desain
  if (designOptionsEl) {
    designOptionsEl.innerHTML = OPSI_JASA_DESAIN.map((opt, idx) => `
      <label class="radio-card-label">
        <input type="radio" name="jasa_desain" value="${opt.id}" ${idx === 0 ? "checked" : ""}>
        <div class="radio-card-content">
          <div class="radio-card-title">
            <span>${opt.nama}</span>
            <span class="badge ${opt.biaya === 0 ? "badge-green" : "badge-yellow"}">
              ${opt.biaya === 0 ? "Gratis Rp0" : formatRupiah(opt.biaya)}
            </span>
          </div>
          <p class="radio-card-sub">${opt.keterangan}</p>
        </div>
      </label>
    `).join("");

    designOptionsEl.addEventListener("change", (e) => {
      const selectedOpt = getSelectedDesignOption();
      if (designFileWrapper) {
        if (selectedOpt.id === "desain-ada") {
          designFileWrapper.style.display = "block";
        } else {
          designFileWrapper.style.display = "block"; // tetap sediakan jika ingin upload referensi
        }
      }
      recalculate();
    });
  }

  function getSelectedDesignOption() {
    const checked = document.querySelector('input[name="jasa_desain"]:checked');
    const val = checked ? checked.value : "desain-ada";
    return OPSI_JASA_DESAIN.find(o => o.id === val) || OPSI_JASA_DESAIN[0];
  }

  // Setup Qty Stepper
  if (qtyMinusBtn && qtyPlusBtn && qtyInputEl) {
    qtyMinusBtn.addEventListener("click", () => {
      const currentVal = parseInt(qtyInputEl.value, 10) || 1;
      const moq = getActiveMoq();
      if (currentVal > moq && currentVal > 1) {
        qtyInputEl.value = currentVal - 1;
        recalculate();
      } else {
        showToast(`Minimal pemesanan varian ini adalah ${moq} pcs`, "error");
      }
    });

    qtyPlusBtn.addEventListener("click", () => {
      const currentVal = parseInt(qtyInputEl.value, 10) || 1;
      qtyInputEl.value = currentVal + 1;
      recalculate();
    });

    qtyInputEl.addEventListener("input", () => {
      recalculate();
    });
  }

  function getActiveMoq() {
    const variantSelect = document.getElementById("calc-variant-select");
    if (variantSelect && activeProduct.varian) {
      const variant = activeProduct.varian.find(v => v.id === variantSelect.value);
      if (variant) return variant.moq || 1;
    }
    return 1;
  }

  // Render Seluruh Form Berdasarkan Jenis Produk
  function renderProductForm() {
    // Info Produk Header
    if (productBadgeEl) productBadgeEl.textContent = activeProduct.badge || activeProduct.kategori;
    if (productTitleEl) productTitleEl.textContent = activeProduct.nama;
    if (productDescEl) productDescEl.textContent = activeProduct.deskripsi;
    if (productEstEl) productEstEl.innerHTML = `${iconMarkup("clock")} Estimasi: ${activeProduct.estimasi}`;

    // Reset Qty ke MoQ varian pertama
    const defaultMoq = activeProduct.varian && activeProduct.varian[0] ? activeProduct.varian[0].moq || 1 : 1;
    if (qtyInputEl) qtyInputEl.value = defaultMoq;

    // Render Field Khusus berdasarkan Tipe Hitung
    let fieldsHtml = "";

    if (activeProduct.tipe_hitung === "meteran") {
      // Produk Meteran (Banner / Decal): Ada P & L (L max 1.5m)
      fieldsHtml = `
        <div class="form-group">
          <label class="form-label" for="calc-variant-select">Pilih Bahan / Material</label>
          <select id="calc-variant-select" class="form-control">
            ${activeProduct.varian.map(v => `
              <option value="${v.id}" data-harga="${v.harga}" data-moq="${v.moq || 1}">
                ${v.nama} - ${formatRupiah(v.harga)} / m²
              </option>
            `).join("")}
          </select>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="calc-panjang-meter">Panjang (Meter)</label>
            <input type="number" id="calc-panjang-meter" class="form-control" value="2" min="0.1" step="0.1" placeholder="Contoh: 2">
            <span class="form-hint">Contoh: 2 atau 2.5 meter</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="calc-lebar-meter">Lebar (Meter)</label>
            <input type="number" id="calc-lebar-meter" class="form-control" value="1" min="0.1" max="1.5" step="0.1" placeholder="Contoh: 1">
            <span class="form-hint text-magenta">Maksimal 1.5 meter (150 cm)</span>
          </div>
        </div>
      `;
    } else if (activeProduct.tipe_hitung === "a3_lembar") {
      // Produk Lembaran A3+: Pilihan 1 Sisi vs 2 Sisi
      fieldsHtml = `
        <div class="form-group">
          <label class="form-label" for="calc-variant-select">Pilih Kertas / Bahan A3+</label>
          <select id="calc-variant-select" class="form-control">
            ${activeProduct.varian.map(v => `
              <option value="${v.id}" data-harga="${v.harga}" data-moq="${v.moq || 1}">
                ${v.nama} (${formatRupiah(v.harga)} / lbr)
              </option>
            `).join("")}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Cetak Sisi</label>
          <div class="radio-cards-grid">
            <label class="radio-card-label">
              <input type="radio" name="calc_sisi_a3" value="1" checked>
              <div class="radio-card-content">
                <div class="radio-card-title">1 Sisi (Single Side)</div>
                <p class="radio-card-sub">Tarif standar 1x harga lembaran</p>
              </div>
            </label>
            <label class="radio-card-label">
              <input type="radio" name="calc_sisi_a3" value="2">
              <div class="radio-card-content">
                <div class="radio-card-title">2 Sisi (Bolak-Balik)</div>
                <p class="radio-card-sub text-cyan">2x Tarif (Rp x 2)</p>
              </div>
            </label>
          </div>
        </div>
      `;
    } else {
      // Varian Baku Tetap (Akrilik, Sticker RGB, Artprint)
      fieldsHtml = `
        <div class="form-group">
          <label class="form-label" for="calc-variant-select">Pilih Varian & Ukuran</label>
          <select id="calc-variant-select" class="form-control">
            ${activeProduct.varian.map(v => `
              <option value="${v.id}" data-harga="${v.harga}" data-moq="${v.moq || 1}">
                ${v.nama} [${v.ukuran}] - ${formatRupiah(v.harga)} (Min. ${v.moq || 1} pcs)
              </option>
            `).join("")}
          </select>
          <span class="form-hint" id="calc-variant-moq-info">Minimal pemesanan varian ini sesuai MoQ.</span>
        </div>
      `;
    }

    if (dynamicFieldsEl) {
      dynamicFieldsEl.innerHTML = fieldsHtml;

      // Pasang Event Listeners ke field dinamis
      const variantSelect = document.getElementById("calc-variant-select");
      if (variantSelect) {
        variantSelect.addEventListener("change", () => {
          const opt = variantSelect.selectedOptions[0];
          const moq = parseInt(opt.dataset.moq, 10) || 1;
          const currentQty = parseInt(qtyInputEl.value, 10) || 1;
          if (currentQty < moq) {
            qtyInputEl.value = moq;
          }
          const moqInfo = document.getElementById("calc-variant-moq-info");
          if (moqInfo) moqInfo.textContent = `Minimal order (MoQ) varian ini adalah ${moq} pcs.`;
          recalculate();
        });
      }

      const pInput = document.getElementById("calc-panjang-meter");
      const lInput = document.getElementById("calc-lebar-meter");
      if (pInput) pInput.addEventListener("input", recalculate);
      if (lInput) lInput.addEventListener("input", recalculate);

      const sisiRadios = document.querySelectorAll('input[name="calc_sisi_a3"]');
      sisiRadios.forEach(r => r.addEventListener("change", recalculate));
    }

    // Render Addons / Finishing Checkbox
    if (addonsContainerEl) {
      if (activeProduct.addons && activeProduct.addons.length > 0) {
        addonsContainerEl.innerHTML = activeProduct.addons.map(ad => `
          <label class="addon-item">
            <input type="checkbox" class="calc-addon-check" value="${ad.id}" data-nama="${ad.nama}" data-harga="${ad.harga}" data-minqty="${ad.min_qty_berbayar || 1}">
            <div class="addon-info">
              <div class="addon-name">
                <span>${ad.nama}</span>
                <span class="addon-price">${formatRupiah(ad.harga)} / pcs</span>
              </div>
              <p class="form-hint">
                ${ad.min_qty_berbayar > 1 ? `${iconMarkup("sparkles")} <strong>Gratis</strong> jika pesan di bawah ${ad.min_qty_berbayar} pcs!` : "Addon langsung dihitung per pcs."}
              </p>
            </div>
          </label>
        `).join("");

        document.querySelectorAll(".calc-addon-check").forEach(cb => {
          cb.addEventListener("change", recalculate);
        });
      } else {
        addonsContainerEl.innerHTML = `<p class="form-hint">Tidak ada addon khusus untuk produk ini.</p>`;
      }
    }

    recalculate();
  }

  // Hitung Ulang Total Harga Real-Time
  function recalculate() {
    const variantSelect = document.getElementById("calc-variant-select");
    if (!variantSelect) return;

    const selectedOption = variantSelect.selectedOptions[0];
    const hargaDasar = parseFloat(selectedOption ? selectedOption.dataset.harga : 0);
    const moq = parseInt(selectedOption ? selectedOption.dataset.moq : 1, 10) || 1;
    const qty = parseInt(qtyInputEl.value, 10) || 0;

    // Ambil parameter spesifik
    let panjang = 1;
    let lebar = 1;
    let jumlahSisi = 1;

    if (activeProduct.tipe_hitung === "meteran") {
      panjang = parseFloat(document.getElementById("calc-panjang-meter")?.value || 1);
      lebar = parseFloat(document.getElementById("calc-lebar-meter")?.value || 1);
    } else if (activeProduct.tipe_hitung === "a3_lembar") {
      const checkedSisi = document.querySelector('input[name="calc_sisi_a3"]:checked');
      jumlahSisi = checkedSisi ? parseInt(checkedSisi.value, 10) : 1;
    }

    // Ambil addons terpilih
    const selectedAddons = [];
    document.querySelectorAll(".calc-addon-check:checked").forEach(cb => {
      selectedAddons.push({
        id: cb.value,
        nama: cb.dataset.nama,
        harga: parseFloat(cb.dataset.harga),
        min_qty_berbayar: parseInt(cb.dataset.minqty, 10) || 1
      });
    });

    // Ambil opsi desain
    const designOpt = getSelectedDesignOption();

    // Jalankan rumus calculator.js
    const hasil = hitungHargaPesanan({
      tipeHitung: activeProduct.tipe_hitung,
      hargaDasar,
      moq,
      qty,
      panjang,
      lebar,
      jumlahSisi,
      selectedAddons,
      biayaDesain: designOpt.biaya
    });

    // Render ke Sticky Summary Card
    if (summaryProductLabel) summaryProductLabel.textContent = activeProduct.nama;

    let specText = "";
    if (activeProduct.tipe_hitung === "meteran") {
      specText = `${selectedOption.text.split(" - ")[0]} | ${panjang}m x ${lebar}m (${(panjang * lebar).toFixed(2)} m²) | ${qty} pcs`;
    } else if (activeProduct.tipe_hitung === "a3_lembar") {
      specText = `${selectedOption.text.split(" (")[0]} | Cetak ${jumlahSisi === 2 ? "2 Sisi" : "1 Sisi"} | ${qty} lbr`;
    } else {
      specText = `${selectedOption.text.split(" [")[0]} | ${qty} pcs`;
    }
    if (summarySpecLabel) summarySpecLabel.textContent = specText;

    if (!hasil.valid) {
      if (summaryErrorBanner) {
        summaryErrorBanner.textContent = hasil.pesanError;
        summaryErrorBanner.style.display = "block";
      }
      if (btnAddToCart) btnAddToCart.disabled = true;
      if (btnDirectCheckout) btnDirectCheckout.disabled = true;

      if (summaryPrintPrice) summaryPrintPrice.textContent = "-";
      if (summaryAddonPrice) summaryAddonPrice.textContent = "-";
      if (summaryDesignPrice) summaryDesignPrice.textContent = "-";
      if (summaryTotalSubtotal) summaryTotalSubtotal.textContent = "Rp 0";
      if (summaryDp50) summaryDp50.textContent = "Rp 0";
      return;
    }

    // Jika Valid
    if (summaryErrorBanner) summaryErrorBanner.style.display = "none";
    if (btnAddToCart) btnAddToCart.disabled = false;
    if (btnDirectCheckout) btnDirectCheckout.disabled = false;

    if (summaryPrintPrice) summaryPrintPrice.textContent = formatRupiah(hasil.rincian.hargaCetakUtama);
    
    // Status addon berbayar/gratis
    let addonText = formatRupiah(hasil.rincian.totalBiayaAddon);
    if (selectedAddons.length > 0 && hasil.rincian.totalBiayaAddon === 0) {
      addonText = "Rp 0 (Gratis Promo)";
    }
    if (summaryAddonPrice) summaryAddonPrice.textContent = addonText;

    if (summaryDesignPrice) {
      summaryDesignPrice.textContent = designOpt.biaya === 0 ? "Gratis Rp0" : formatRupiah(designOpt.biaya);
    }

    if (summaryTotalSubtotal) summaryTotalSubtotal.textContent = formatRupiah(hasil.rincian.subtotal);
    if (summaryDp50) summaryDp50.textContent = formatRupiah(hasil.rincian.dp50Persen);

    // Simpan data kalkulasi terakhir di closure objek window untuk diakses button order
    window._CURRENT_CALC_RESULT = {
      produkId: activeProduct.id,
      namaProduk: activeProduct.nama,
      varianId: selectedOption.value,
      varianNama: selectedOption.text,
      tipeHitung: activeProduct.tipe_hitung,
      hargaDasar: hargaDasar,
      moq: moq,
      qty: qty,
      panjang: panjang,
      lebar: lebar,
      luasMeter: activeProduct.tipe_hitung === "meteran" ? (panjang * lebar) : null,
      jumlahSisi: jumlahSisi,
      addons: hasil.rincian.rincianAddons,
      desain: {
        id: designOpt.id,
        tipe: designOpt.nama,
        biaya: designOpt.biaya,
        link: designFileInput ? designFileInput.value.trim() : ""
      },
      catatanCustomer: customerNotesInput ? customerNotesInput.value.trim() : "",
      subtotal: hasil.rincian.subtotal,
      dp50: hasil.rincian.dp50Persen
    };
  }

  // Action Button: Tambah ke Keranjang
  if (btnAddToCart) {
    btnAddToCart.addEventListener("click", () => {
      if (!window._CURRENT_CALC_RESULT) return;
      addToCart(window._CURRENT_CALC_RESULT);
      showToast("Produk berhasil ditambahkan ke keranjang belanja!", "success");
    });
  }

  // Action Button: Beli Langsung (Checkout)
  if (btnDirectCheckout) {
    btnDirectCheckout.addEventListener("click", () => {
      if (!window._CURRENT_CALC_RESULT) return;
      addToCart(window._CURRENT_CALC_RESULT);
      window.location.href = "keranjang.html";
    });
  }

  // Jalankan render awal
  renderProductForm();
}

// ==========================================================================
// Halaman Keranjang & Checkout (keranjang.html)
// ==========================================================================
function initCartPage() {
  const cartListContainer = document.getElementById("cart-items-container");
  const cartEmptyContainer = document.getElementById("cart-empty-container");
  const cartLayout = document.getElementById("cart-main-layout");
  const invoiceContainer = document.getElementById("invoice-view-container");

  // Summary Checkout
  const subtotalTagihanEl = document.getElementById("checkout-subtotal-tagihan");
  const nominalWajibBayarEl = document.getElementById("checkout-nominal-wajib-bayar");
  const sisaTagihanEl = document.getElementById("checkout-sisa-tagihan");
  const checkoutForm = document.getElementById("checkout-form");

  function renderCartView() {
    const cart = getCart();

    if (cart.length === 0) {
      if (cartLayout) cartLayout.style.display = "none";
      if (cartEmptyContainer) cartEmptyContainer.style.display = "block";
      return;
    }

    if (cartLayout) cartLayout.style.display = "grid";
    if (cartEmptyContainer) cartEmptyContainer.style.display = "none";

    let total = 0;

    if (cartListContainer) {
      cartListContainer.innerHTML = cart.map(item => {
        total += item.subtotal;

        let specHtml = "";
        if (item.tipeHitung === "meteran") {
          specHtml = `Ukuran: ${item.panjang}m x ${item.lebar}m (${item.luasMeter} m²)`;
        } else if (item.tipeHitung === "a3_lembar") {
          specHtml = `Cetak: ${item.jumlahSisi === 2 ? "2 Sisi (Bolak-balik)" : "1 Sisi"}`;
        } else {
          specHtml = `Varian: ${item.varianNama}`;
        }

        const addonList = item.addons && item.addons.length > 0
          ? item.addons.map(a => `<span class="badge ${a.isGratis ? "badge-green" : "badge-cyan"}">${a.nama} ${a.isGratis ? "(Gratis)" : `(${formatRupiah(a.biayaTotal)})`}</span>`).join(" ")
          : `<span class="text-muted">Tanpa Addon</span>`;

        const designInfo = item.desain ? `${item.desain.tipe} ${item.desain.biaya > 0 ? `(${formatRupiah(item.desain.biaya)})` : ""}` : "-";

        return `
          <div class="cart-item-card" data-cart-id="${item.cartId}">
            <div>
              <h4 class="cart-item-title">${item.namaProduk}</h4>
              <div class="cart-item-specs">
                <div>${iconMarkup("clipboard-list")} <strong>${specHtml}</strong></div>
                <div>${iconMarkup("sparkles")} Finishing: ${addonList}</div>
                <div>${iconMarkup("palette")} Desain: ${designInfo}</div>
                ${item.catatanCustomer ? `<div>${iconMarkup("pencil-line")} <em>Catatan: ${item.catatanCustomer}</em></div>` : ""}
              </div>
              <div class="badge badge-dark">Qty: ${item.qty} pcs</div>
            </div>
            <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;">
              <div class="cart-item-subtotal">${formatRupiah(item.subtotal)}</div>
              <button class="btn btn-outline btn-sm btn-delete-cart" data-id="${item.cartId}" title="Hapus Item">
                ${iconMarkup("trash")} Hapus
              </button>
            </div>
          </div>
        `;
      }).join("");

      // Listener tombol hapus item
      document.querySelectorAll(".btn-delete-cart").forEach(btn => {
        btn.addEventListener("click", () => {
          const cartId = btn.dataset.id;
          removeFromCart(cartId);
          showToast("Item berhasil dihapus dari keranjang", "info");
          renderCartView();
        });
      });
    }

    updateCheckoutCalculations(total);
  }

  function updateCheckoutCalculations(total) {
    const isDP50 = document.querySelector('input[name="skema_bayar"]:checked')?.value === "DP_50";
    const nominalBayar = isDP50 ? Math.round(total * 0.5) : total;
    const sisa = total - nominalBayar;

    if (subtotalTagihanEl) subtotalTagihanEl.textContent = formatRupiah(total);
    if (nominalWajibBayarEl) nominalWajibBayarEl.textContent = formatRupiah(nominalBayar);
    if (sisaTagihanEl) sisaTagihanEl.textContent = formatRupiah(sisa);
  }

  // Listener Pilihan Skema Pembayaran (DP 50% vs Lunas)
  document.querySelectorAll('input[name="skema_bayar"]').forEach(radio => {
    radio.addEventListener("change", () => {
      document.querySelectorAll(".payment-scheme-option").forEach(el => el.classList.remove("selected"));
      radio.closest(".payment-scheme-option").classList.add("selected");
      const cart = getCart();
      const total = cart.reduce((sum, i) => sum + i.subtotal, 0);
      updateCheckoutCalculations(total);
    });
  });

  // Handler Submit Checkout
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nama = document.getElementById("checkout-nama").value.trim();
      const wa = document.getElementById("checkout-wa").value.trim();
      const email = document.getElementById("checkout-email")?.value.trim() || "";
      const catatan = document.getElementById("checkout-catatan")?.value.trim() || "";
      const metodeKirim = document.getElementById("checkout-metode-kirim")?.value || "Ambil di Toko";
      const skemaBayar = document.querySelector('input[name="skema_bayar"]:checked')?.value || "DP_50";

      if (!nama || !wa) {
        showToast("Harap lengkapi Nama Pemesan dan Nomor WhatsApp!", "error");
        return;
      }

      // Buat Pesanan Baru
      const newOrder = createOrder(
        { nama, wa, email, catatan },
        skemaBayar,
        metodeKirim
      );

      if (!newOrder) {
        showToast("Keranjang belanja kosong!", "error");
        return;
      }

      showToast("Pesanan berhasil dibuat! Invoice siap dicetak.", "success");
      renderInvoiceView(newOrder);
    });
  }

  // Tampilkan Halaman Nota / Faktur Pembayaran
  function renderInvoiceView(order) {
    if (cartLayout) cartLayout.style.display = "none";
    if (cartEmptyContainer) cartEmptyContainer.style.display = "none";
    if (!invoiceContainer) return;

    invoiceContainer.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    const waLink = generateWhatsAppUrl(order);

    invoiceContainer.innerHTML = `
      <div class="invoice-container" id="printable-invoice">
        <div class="invoice-header">
          <div class="invoice-shop-info">
            <h2>PERCETAKAN TDP</h2>
            <p>Jalan Kreatif No. 12, Kota Produksi</p>
            <p>WhatsApp CS: +62 812-3456-7890 | Website: percetakan-tdp.com</p>
          </div>
          <div class="invoice-meta">
            <div class="invoice-code">${order.kodeInvoice}</div>
            <p style="font-size: 0.85rem; color: var(--text-muted);">${order.tanggal} ${order.waktu || ""}</p>
            <span class="invoice-status-badge badge badge-yellow">${order.statusProduksi}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.9rem;">
          <div>
            <strong>Pelanggan:</strong><br>
            ${order.customer.nama}<br>
            WA: ${order.customer.wa}<br>
            ${order.customer.catatan ? `<em>Catatan: ${order.customer.catatan}</em>` : ""}
          </div>
          <div style="text-align: right;">
            <strong>Metode Pengambilan:</strong><br>
            ${order.metodeKirim}<br>
            <strong>Skema Pembayaran:</strong><br>
            <span class="text-cyan font-bold">${order.skemaBayar}</span>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Deskripsi Item</th>
              <th>Qty</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <strong>${item.namaProduk}</strong><br>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">
                    ${item.tipeHitung === "meteran" ? `${item.panjang}m x ${item.lebar}m` : (item.varianNama || "")}
                    ${item.addons && item.addons.length ? " | Addon: " + item.addons.map(a => a.nama).join(", ") : ""}
                    ${item.desain ? " | " + item.desain.tipe : ""}
                  </span>
                </td>
                <td>${item.qty} pcs</td>
                <td style="text-align: right;">${formatRupiah(item.subtotal)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="max-width: 320px; margin-left: auto;">
          <div class="invoice-total-row">
            <span>Total Tagihan:</span>
            <strong>${formatRupiah(order.totalTagihan)}</strong>
          </div>
          <div class="invoice-total-row" style="color: var(--cyan); font-weight: 700; border-top: 1px dashed var(--border); padding-top: 0.5rem;">
            <span>Bayar Sekarang (${order.skemaBayar}):</span>
            <span style="font-size: 1.2rem;">${formatRupiah(order.nominalBayarSekarang)}</span>
          </div>
          <div class="invoice-total-row" style="color: var(--text-muted); font-size: 0.85rem;">
            <span>Sisa Pelunasan:</span>
            <span>${formatRupiah(order.sisaTagihan)}</span>
          </div>
        </div>

        <div style="margin-top: 2rem; padding: 1rem; background: var(--bg); border-radius: var(--radius-md); font-size: 0.8rem; line-height: 1.4;">
          <strong>Informasi Pembayaran & Antrian:</strong><br>
          • Pembayaran DP minimal 50% wajib dikonfirmasi agar pesanan masuk ke sistem antrian produksi.<br>
          • Rekening Transfer: BCA 1234-567-890 a/n Percetakan TDP.<br>
          • Simpan nomor invoice untuk melacak antrian produksi di menu <strong>Cek Pesanan</strong>.
        </div>

        <div class="invoice-actions no-print">
          <a href="${waLink}" target="_blank" class="btn btn-success">
            ${iconMarkup("phone")} Kirim Pesanan via WhatsApp
          </a>
          <button class="btn btn-dark" onclick="window.print()">
            ${iconMarkup("printer")} Cetak Nota / PDF
          </button>
          <a href="pesanan.html?inv=${order.kodeInvoice}" class="btn btn-primary">
            ${iconMarkup("search")} Lacak Status Antrian
          </a>
          <a href="index.html" class="btn btn-outline">
            ${iconMarkup("arrow-left")} Kembali ke Katalog
          </a>
        </div>
      </div>
    `;
  }

  renderCartView();
}

// ==========================================================================
// Halaman Pelacakan Antrian & Simulasi Admin (pesanan.html)
// ==========================================================================
function initTrackingPage() {
  const tabCustomer = document.getElementById("tab-btn-customer");
  const tabAdmin = document.getElementById("tab-btn-admin");
  const panelCustomer = document.getElementById("panel-customer-track");
  const panelAdmin = document.getElementById("panel-admin-sim");
  const activeRole = typeof getActorRole === "function" ? getActorRole() : null;
  const requestedWorkspace = new URLSearchParams(window.location.search).get("workspace");
  const isCashierWorkspace = activeRole === "kasir";

  if (requestedWorkspace === "kasir" && !isCashierWorkspace) {
    requireActorRole("kasir");
    return;
  }

  const searchInput = document.getElementById("tracking-search-input");
  const searchBtn = document.getElementById("tracking-search-btn");
  const trackingResultBox = document.getElementById("tracking-result-box");
  const adminTableBody = document.getElementById("admin-orders-table-body");
  const btnResetDemo = document.getElementById("admin-reset-demo-btn");

  // Tab Switching
  if (tabCustomer && tabAdmin && panelCustomer && panelAdmin) {
    tabCustomer.addEventListener("click", () => {
      tabCustomer.classList.add("active");
      tabAdmin.classList.remove("active");
      panelCustomer.style.display = "block";
      panelAdmin.style.display = "none";
    });

    tabAdmin.addEventListener("click", () => {
      tabAdmin.classList.add("active");
      tabCustomer.classList.remove("active");
      panelCustomer.style.display = "none";
      panelAdmin.style.display = "block";
      renderAdminDashboard();
    });

    if (isCashierWorkspace) {
      tabAdmin.hidden = false;
      tabAdmin.click();
    } else {
      tabAdmin.hidden = true;
      panelAdmin.style.display = "none";
    }
  }

  // Cek parameter URL ?inv=...
  const urlParams = new URLSearchParams(window.location.search);
  const invFromUrl = urlParams.get("inv");
  if (invFromUrl && searchInput) {
    searchInput.value = invFromUrl;
    lacakPesanan(invFromUrl);
  }

  // Search Button
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const code = searchInput.value.trim();
      if (!code) {
        showToast("Harap masukkan kode invoice (contoh: TDP-782194)", "error");
        return;
      }
      lacakPesanan(code);
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchBtn.click();
      }
    });
  }

  // Logika Pelacakan Status Antrian Pelanggan
  function lacakPesanan(kodeInvoice) {
    const order = getOrderByInvoice(kodeInvoice);

    if (!order) {
      if (trackingResultBox) {
        trackingResultBox.innerHTML = `
          <div class="cart-empty-state">
            <div class="cart-empty-icon">${iconMarkup("search")}</div>
            <h3>Pesanan Tidak Ditemukan</h3>
            <p>Kode invoice <strong>"${kodeInvoice}"</strong> belum terdaftar di sistem kami.</p>
            <p class="form-hint">Pastikan penulisan kode benar, contoh: TDP-782194</p>
          </div>
        `;
        trackingResultBox.style.display = "block";
      }
      return;
    }

    // Tentukan nomor tahap saat ini (1 sampai 6)
    const currentStatus = order.statusProduksi;
    const stages = [
      { id: "Menunggu Konfirmasi DP", label: "Menunggu DP" },
      { id: "Proses Desain & Revisi", label: "Proses Desain" },
      { id: "Antrian Produksi", label: "Antrian Produksi" },
      { id: "Proses Cetak", label: "Proses Cetak" },
      { id: "Finishing & QC", label: "Finishing & QC" },
      { id: "Siap Diambil / Dikirim", label: "Siap Diambil" }
    ];

    let currentStepIndex = stages.findIndex(s => s.id.toLowerCase() === currentStatus.toLowerCase());
    if (currentStepIndex === -1) {
      // Default matching
      if (currentStatus.includes("DP")) currentStepIndex = 0;
      else if (currentStatus.includes("Desain")) currentStepIndex = 1;
      else if (currentStatus.includes("Antrian")) currentStepIndex = 2;
      else if (currentStatus.includes("Cetak")) currentStepIndex = 3;
      else if (currentStatus.includes("Finishing")) currentStepIndex = 4;
      else if (currentStatus.includes("Siap") || currentStatus.includes("Selesai")) currentStepIndex = 5;
      else currentStepIndex = 2;
    }

    const stepperHtml = stages.map((stg, idx) => {
      let stateClass = "";
      if (idx < currentStepIndex) stateClass = "completed";
      else if (idx === currentStepIndex) stateClass = "active";

      return `
        <div class="step-node ${stateClass}">
          <div class="step-circle">${idx < currentStepIndex ? "✓" : idx + 1}</div>
          <div class="step-label">${stg.label}</div>
        </div>
      `;
    }).join("");

    const waLink = generateWhatsAppUrl(order);

    if (trackingResultBox) {
      trackingResultBox.innerHTML = `
        <div class="invoice-container" style="margin-top: 1rem;">
          <div class="invoice-header">
            <div>
              <span class="badge badge-cyan" style="margin-bottom: 0.5rem;">STATUS PESANAN</span>
              <h2>${order.kodeInvoice}</h2>
              <p>Pemesan: <strong>${order.customer.nama}</strong> (${order.customer.wa})</p>
            </div>
            <div style="text-align: right;">
              <span class="badge badge-yellow" style="font-size: 0.95rem; padding: 0.4rem 1rem;">
                ${order.statusProduksi}
              </span>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem;">
                Tanggal Pesan: ${order.tanggal}
              </p>
            </div>
          </div>

          <!-- Stepper Timeline -->
          <div class="timeline-stepper">
            ${stepperHtml}
          </div>

          <!-- Queue Rule Notice -->
          <div class="queue-policy-box" style="margin-bottom: 1.5rem;">
            <div class="queue-icon">${iconMarkup("clock")}</div>
            <div>
              <h4>Transparansi Antrian Produksi Percetakan TDP</h4>
              <p>Pesanan dikerjakan secara tertib sesuai kapasitas mesin tanpa pungutan biaya ekspres/kilat. Estimasi pengerjaan bergantung pada antrian yang sedang berjalan.</p>
            </div>
          </div>

          <!-- Order Summary Details -->
          <div style="background: var(--bg); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.75rem;">Item yang Sedang Diproses:</h4>
            <ul style="list-style: none; font-size: 0.9rem;">
              ${order.items.map(item => `
                <li style="margin-bottom: 0.6rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--border);">
                  <strong>${item.namaProduk}</strong> (${item.qty} pcs)<br>
                  <span style="font-size: 0.8rem; color: var(--text-sub);">
                    ${item.tipeHitung === "meteran" ? `Ukuran: ${item.panjang}m x ${item.lebar}m` : (item.varianNama || "")}
                  </span>
                </li>
              `).join("")}
            </ul>
            <div style="display: flex; justify-content: space-between; margin-top: 0.75rem; font-size: 0.9rem;">
              <span>Skema Pembayaran: <strong>${order.skemaBayar}</strong></span>
              <span>Sisa Tagihan: <strong class="text-magenta">${formatRupiah(order.sisaTagihan)}</strong></span>
            </div>
          </div>

          <div class="invoice-actions">
            <a href="${waLink}" target="_blank" class="btn btn-success btn-sm">
              ${iconMarkup("phone")} Hubungi Admin TDP via WhatsApp
            </a>
            <button class="btn btn-outline btn-sm" onclick="window.print()">
              ${iconMarkup("printer")} Cetak Bukti Antrian
            </button>
          </div>
        </div>
      `;
      trackingResultBox.style.display = "block";
    }
  }

  // Logika Simulasi Admin Dashboard
  function renderAdminDashboard() {
    const orders = getOrders();

    // Update Counter Stats
    const totalCount = orders.length;
    const waitingDp = orders.filter(o => o.statusProduksi.includes("DP")).length;
    const inProduction = orders.filter(o => o.statusProduksi.includes("Antrian") || o.statusProduksi.includes("Cetak") || o.statusProduksi.includes("Finishing")).length;
    const completed = orders.filter(o => o.statusProduksi.includes("Siap") || o.statusProduksi.includes("Selesai")).length;

    const elTotal = document.getElementById("admin-stat-total");
    const elWaiting = document.getElementById("admin-stat-dp");
    const elProd = document.getElementById("admin-stat-prod");
    const elDone = document.getElementById("admin-stat-done");

    if (elTotal) elTotal.textContent = totalCount;
    if (elWaiting) elWaiting.textContent = waitingDp;
    if (elProd) elProd.textContent = inProduction;
    if (elDone) elDone.textContent = completed;

    // Render Tabel Pesanan
    if (adminTableBody) {
      if (orders.length === 0) {
        adminTableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 2rem;">Belum ada pesanan masuk.</td></tr>`;
        return;
      }

      adminTableBody.innerHTML = orders.map(ord => {
        const itemSummary = ord.items.map(i => `${i.namaProduk} (${i.qty}x)`).join(", ");
        const isWaitingForDP = ord.statusProduksi === "Menunggu Konfirmasi DP";
        const statusOptions = isWaitingForDP ? [ord.statusProduksi] : [
          "Proses Desain & Revisi",
          "Antrian Produksi",
          "Proses Cetak",
          "Finishing & QC",
          "Siap Diambil / Dikirim"
        ];

        return `
          <tr>
            <td>
              <strong>${ord.kodeInvoice}</strong><br>
              <span style="font-size: 0.75rem; color: #111111;">${ord.tanggal}</span>
            </td>
            <td>
              <strong>${ord.customer.nama}</strong><br>
              <span style="font-size: 0.8rem; color: #111111;">${ord.customer.wa}</span>
            </td>
            <td style="max-width: 200px; font-size: 0.85rem;">
              ${itemSummary}
            </td>
            <td>
              <div>Total: <strong>${formatRupiah(ord.totalTagihan)}</strong></div>
              <div style="font-size: 0.75rem; color: #111111;">
                ${ord.sisaTagihan === 0 ? "Lunas" : `Sisa: ${formatRupiah(ord.sisaTagihan)}`}
              </div>
            </td>
            <td>
              <select class="form-control admin-status-select" data-invoice="${ord.kodeInvoice}" ${isWaitingForDP ? "disabled" : ""} style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
                ${statusOptions.map(st => `
                  <option value="${st}" ${ord.statusProduksi === st ? "selected" : ""}>${st}</option>
                `).join("")}
              </select>
            </td>
            <td>
              ${isWaitingForDP ? `<button class="btn btn-primary btn-sm admin-btn-confirm-dp" data-invoice="${ord.kodeInvoice}">Konfirmasi DP</button><br>` : ""}
              <button class="btn btn-outline btn-sm admin-btn-detail" data-invoice="${ord.kodeInvoice}">
                ${iconMarkup("search")} Lacak
              </button>
            </td>
          </tr>
        `;
      }).join("");

      // Listener Ubah Status Pesanan
      document.querySelectorAll(".admin-status-select").forEach(sel => {
        sel.addEventListener("change", (e) => {
          const inv = e.target.dataset.invoice;
          const newSt = e.target.value;
          updateOrderStatus(inv, newSt);
          showToast(`Status ${inv} berhasil diubah ke: ${newSt}`, "success");
          renderAdminDashboard();
        });
      });

      // Listener Tombol Lacak dari Admin
      document.querySelectorAll(".admin-btn-detail").forEach(btn => {
        btn.addEventListener("click", () => {
          const inv = btn.dataset.invoice;
          if (tabCustomer) tabCustomer.click();
          if (searchInput) {
            searchInput.value = inv;
            lacakPesanan(inv);
          }
        });
      });

      document.querySelectorAll(".admin-btn-confirm-dp").forEach(btn => {
        btn.addEventListener("click", () => {
          const order = confirmOrderDP(btn.dataset.invoice);
          if (!order) {
            showToast("DP tidak dapat dikonfirmasi. Periksa status pesanan.", "error");
            return;
          }
          showToast(`DP ${order.kodeInvoice} berhasil dikonfirmasi.`, "success");
          renderAdminDashboard();
        });
      });
    }
  }

  // Reset Demo Button
  if (btnResetDemo) {
    btnResetDemo.addEventListener("click", () => {
      if (confirm("Reset seluruh data pesanan ke simulasi awal?")) {
        resetOrdersToDemo();
        showToast("Data pesanan berhasil direset ke demo default.", "info");
        renderAdminDashboard();
      }
    });
  }
}

