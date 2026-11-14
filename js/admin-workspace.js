const MATERIAL_STOCK_STORAGE_KEY = "tdp_material_stock";
const DEFAULT_MATERIAL_STOCK = [
  { id: "akrilik-3mm", nama: "Akrilik 3 mm", satuan: "lembar", jumlah: 24, minimum: 5 },
  { id: "sticker-vinyl", nama: "Sticker Vinyl", satuan: "lembar", jumlah: 38, minimum: 8 },
  { id: "art-paper", nama: "Art Paper", satuan: "lembar", jumlah: 120, minimum: 20 },
  { id: "tinta-uv", nama: "Tinta UV", satuan: "botol", jumlah: 12, minimum: 3 },
  { id: "bahan-banner", nama: "Bahan Banner", satuan: "meter", jumlah: 75, minimum: 15 }
];

function escapeWorkspaceHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

function loadMaterialStock() {
  const savedStock = localStorage.getItem(MATERIAL_STOCK_STORAGE_KEY);
  if (!savedStock) return JSON.parse(JSON.stringify(DEFAULT_MATERIAL_STOCK));

  try {
    const stock = JSON.parse(savedStock);
    if (!Array.isArray(stock)) {
      throw new TypeError("Data stok tersimpan bukan sebuah daftar.");
    }
    return stock;
  } catch (error) {
    console.error("Gagal membaca data stok tersimpan.", error);
    return JSON.parse(JSON.stringify(DEFAULT_MATERIAL_STOCK));
  }
}

let MATERIAL_STOCK = loadMaterialStock();

function saveMaterialStock() {
  localStorage.setItem(MATERIAL_STOCK_STORAGE_KEY, JSON.stringify(MATERIAL_STOCK));
}

function initAdminWorkspace() {
  if (!requireActorRole("admin")) return;

  const tabButtons = document.querySelectorAll("[data-admin-tab]");
  const tabPanels = document.querySelectorAll("[data-admin-panel]");
  const catalogTableBody = document.getElementById("catalog-table-body");
  const stockTableBody = document.getElementById("stock-table-body");
  const reportsTableBody = document.getElementById("reports-table-body");
  const productSelect = document.getElementById("variant-product");

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(tab => {
        const isActive = tab === button;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });
      tabPanels.forEach(panel => {
        panel.hidden = panel.dataset.adminPanel !== button.dataset.adminTab;
      });
      if (button.dataset.adminTab === "reports") renderReports();
    });
  });

  function populateProductSelect() {
    if (!productSelect) return;
    productSelect.innerHTML = KATALOG_TDP.map((product, index) =>
      `<option value="${index}">${escapeWorkspaceHTML(product.nama)}</option>`
    ).join("");
  }

  function renderCatalog() {
    if (!catalogTableBody) return;
    catalogTableBody.innerHTML = KATALOG_TDP.flatMap((product, productIndex) =>
      product.varian.map((variant, variantIndex) => `
        <tr>
          <td>${escapeWorkspaceHTML(product.nama)}</td>
          <td><input class="form-control" data-catalog-field="name" value="${escapeWorkspaceHTML(variant.nama)}" aria-label="Nama varian"></td>
          <td><input class="form-control" data-catalog-field="size" value="${escapeWorkspaceHTML(variant.ukuran)}" aria-label="Ukuran"></td>
          <td><input class="form-control" data-catalog-field="price" type="number" min="0" step="1" value="${Number(variant.harga) || 0}" aria-label="Harga"></td>
          <td><input class="form-control" data-catalog-field="moq" type="number" min="1" step="1" value="${Number(variant.moq) || 1}" aria-label="Minimum pesanan"></td>
          <td style="white-space: nowrap;">
            <button type="button" class="btn btn-primary btn-sm" data-save-variant="${productIndex}:${variantIndex}">Simpan</button>
            <button type="button" class="btn btn-outline btn-sm" data-delete-variant="${productIndex}:${variantIndex}">Hapus</button>
          </td>
        </tr>
      `)
    ).join("");
  }

  function renderStock() {
    if (!stockTableBody) return;
    stockTableBody.innerHTML = MATERIAL_STOCK.map((item, index) => `
      <tr>
        <td>${escapeWorkspaceHTML(item.nama)}</td>
        <td>${escapeWorkspaceHTML(item.satuan)}</td>
        <td><input class="form-control" data-stock-field="quantity" type="number" min="0" step="1" value="${Number(item.jumlah) || 0}" aria-label="Jumlah stok"></td>
        <td><input class="form-control" data-stock-field="minimum" type="number" min="0" step="1" value="${Number(item.minimum) || 0}" aria-label="Batas minimum"></td>
        <td>${Number(item.jumlah) <= Number(item.minimum) ? "Perlu restok" : "Aman"}</td>
        <td><button type="button" class="btn btn-primary btn-sm" data-save-stock="${index}">Simpan</button></td>
      </tr>
    `).join("");
  }

  function renderReports() {
    const orders = getOrders();
    const pending = orders.filter(order => order.statusProduksi.includes("DP")).length;
    const active = orders.filter(order =>
      order.statusProduksi.includes("Antrian") ||
      order.statusProduksi.includes("Cetak") ||
      order.statusProduksi.includes("Finishing")
    ).length;
    const orderValue = orders.reduce((total, order) => total + (Number(order.totalTagihan) || 0), 0);

    document.getElementById("report-total-orders").textContent = orders.length;
    document.getElementById("report-pending-orders").textContent = pending;
    document.getElementById("report-active-orders").textContent = active;
    document.getElementById("report-order-value").textContent = formatRupiah(orderValue);

    if (!reportsTableBody) return;
    reportsTableBody.innerHTML = orders.length ? orders.map(order => `
      <tr>
        <td><strong>${escapeWorkspaceHTML(order.kodeInvoice)}</strong><br><span style="color: var(--text-muted);">${escapeWorkspaceHTML(order.tanggal)}</span></td>
        <td>${escapeWorkspaceHTML(order.customer.nama)}</td>
        <td>${order.items.map(item => `${escapeWorkspaceHTML(item.namaProduk)} (${Number(item.qty) || 0}x)`).join(", ")}</td>
        <td>${formatRupiah(Number(order.totalTagihan) || 0)}</td>
        <td>${escapeWorkspaceHTML(order.statusProduksi)}</td>
      </tr>
    `).join("") : `<tr><td colspan="5" class="text-center">Belum ada pesanan.</td></tr>`;
  }

  if (catalogTableBody) {
    catalogTableBody.addEventListener("click", event => {
      const saveButton = event.target.closest("[data-save-variant]");
      const deleteButton = event.target.closest("[data-delete-variant]");

      if (saveButton) {
        const [productIndex, variantIndex] = saveButton.dataset.saveVariant.split(":").map(Number);
        const row = saveButton.closest("tr");
        const name = row.querySelector('[data-catalog-field="name"]').value.trim();
        const size = row.querySelector('[data-catalog-field="size"]').value.trim();
        const price = Number(row.querySelector('[data-catalog-field="price"]').value);
        const moq = Number(row.querySelector('[data-catalog-field="moq"]').value);
        if (!name || !size || !Number.isFinite(price) || price < 0 || !Number.isInteger(moq) || moq < 1) {
          window.alert("Periksa nama, ukuran, harga, dan MoQ varian.");
          return;
        }

        const variant = KATALOG_TDP[productIndex].varian[variantIndex];
        variant.nama = name;
        variant.ukuran = size;
        variant.harga = price;
        variant.moq = moq;
        saveKatalogTDP();
        renderCatalog();
        showToast("Varian katalog berhasil disimpan.", "success");
      }

      if (deleteButton) {
        const [productIndex, variantIndex] = deleteButton.dataset.deleteVariant.split(":").map(Number);
        const product = KATALOG_TDP[productIndex];
        if (product.varian.length <= 1) {
          window.alert("Setiap produk harus memiliki minimal satu varian.");
          return;
        }
        product.varian.splice(variantIndex, 1);
        saveKatalogTDP();
        renderCatalog();
        showToast("Varian katalog berhasil dihapus.", "success");
      }
    });
  }

  if (productSelect) {
    populateProductSelect();
    document.getElementById("variant-form").addEventListener("submit", event => {
      event.preventDefault();
      const product = KATALOG_TDP[Number(productSelect.value)];
      const name = document.getElementById("variant-name").value.trim();
      const size = document.getElementById("variant-size").value.trim();
      const price = Number(document.getElementById("variant-price").value);
      const moq = Number(document.getElementById("variant-moq").value);
      if (!product || !name || !size || !Number.isFinite(price) || price < 0 || !Number.isInteger(moq) || moq < 1) {
        window.alert("Periksa kembali data varian yang akan ditambahkan.");
        return;
      }

      product.varian.push({
        id: `${product.id}-varian-${Date.now()}`,
        nama: name,
        ukuran: size,
        moq,
        harga: price
      });
      saveKatalogTDP();
      event.currentTarget.reset();
      document.getElementById("variant-moq").value = "1";
      renderCatalog();
      showToast("Varian baru berhasil ditambahkan.", "success");
    });
  }

  document.getElementById("reset-catalog-btn").addEventListener("click", () => {
    if (!window.confirm("Pulihkan seluruh katalog ke data awal?")) return;
    resetKatalogTDP();
    populateProductSelect();
    renderCatalog();
    showToast("Katalog berhasil dipulihkan.", "info");
  });

  if (stockTableBody) {
    stockTableBody.addEventListener("click", event => {
      const button = event.target.closest("[data-save-stock]");
      if (!button) return;

      const index = Number(button.dataset.saveStock);
      const row = button.closest("tr");
      const quantity = Number(row.querySelector('[data-stock-field="quantity"]').value);
      const minimum = Number(row.querySelector('[data-stock-field="minimum"]').value);
      if (!Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(minimum) || minimum < 0) {
        window.alert("Jumlah stok dan batas minimum harus berupa bilangan bulat nol atau lebih.");
        return;
      }

      MATERIAL_STOCK[index].jumlah = quantity;
      MATERIAL_STOCK[index].minimum = minimum;
      saveMaterialStock();
      renderStock();
      showToast("Stok bahan berhasil disimpan.", "success");
    });
  }

  document.getElementById("stock-form").addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("stock-name").value.trim();
    const unit = document.getElementById("stock-unit").value.trim();
    const quantity = Number(document.getElementById("stock-quantity").value);
    const minimum = Number(document.getElementById("stock-minimum").value);
    if (!name || !unit || !Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(minimum) || minimum < 0) {
      window.alert("Periksa kembali nama, satuan, dan jumlah stok bahan.");
      return;
    }

    MATERIAL_STOCK.push({
      id: `bahan-${Date.now()}`,
      nama: name,
      satuan: unit,
      jumlah: quantity,
      minimum
    });
    saveMaterialStock();
    event.currentTarget.reset();
    renderStock();
    showToast("Bahan berhasil ditambahkan.", "success");
  });

  document.getElementById("refresh-reports-btn").addEventListener("click", renderReports);
  renderCatalog();
  renderStock();
  renderReports();
}

document.addEventListener("DOMContentLoaded", initAdminWorkspace);
