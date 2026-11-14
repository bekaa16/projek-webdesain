const CUSTOMER_ACCOUNTS_STORAGE_KEY = "tdp_customer_accounts";
const STAFF_LOGIN_ACCOUNTS = {
  kasir: { username: "kasir", password: "kasir123" },
  admin: { username: "admin", password: "admin123" }
};

function showAuthMessage(message, isError = false) {
  const element = document.getElementById("auth-message");
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("text-magenta", isError);
  element.classList.toggle("text-cyan", !isError);
}

function getCustomerAccounts() {
  const savedAccounts = localStorage.getItem(CUSTOMER_ACCOUNTS_STORAGE_KEY);
  if (!savedAccounts) return [];

  const accounts = JSON.parse(savedAccounts);
  if (!Array.isArray(accounts)) {
    throw new TypeError("Data akun pelanggan tersimpan tidak valid.");
  }
  return accounts;
}

function normalizeCustomerIdentifier(value) {
  return String(value || "").trim().toLowerCase();
}

function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) {
    throw new TypeError("Salt password tersimpan tidak valid.");
  }
  return new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}

async function hashCustomerPassword(password, salt) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Fitur keamanan password tidak tersedia. Jalankan situs melalui localhost.");
  }

  const key = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hash = await window.crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt,
    iterations: 120000,
    hash: "SHA-256"
  }, key, 256);
  return bytesToHex(new Uint8Array(hash));
}

function setCustomerMode(mode) {
  document.getElementById("customer-login-form").hidden = mode !== "login";
  document.getElementById("customer-register-form").hidden = mode !== "register";
  document.querySelectorAll("[data-auth-prompt]").forEach(prompt => {
    prompt.hidden = prompt.dataset.authPrompt !== mode;
  });
  document.getElementById("auth-dialog-title").textContent = mode === "login" ? "Masuk" : "Daftar Pelanggan";
  showAuthMessage("");
}

function openWorkspace(role, details) {
  const activeForm = document.querySelector("#customer-register-form:not([hidden])") ||
    document.getElementById("customer-login-form");
  const rememberCheckbox = activeForm && activeForm.querySelector("[data-auth-remember]");
  setActorSession(role, details, rememberCheckbox ? rememberCheckbox.checked : true);
  if (window.top !== window) {
    window.top.location.href = ACTOR_WORKSPACE_ROUTES[role];
  } else {
    window.location.href = ACTOR_WORKSPACE_ROUTES[role];
  }
}

function initAuthPage() {
  const authPage = document.getElementById("auth-page-root");
  if (!authPage) return;
  const isEmbedded = new URLSearchParams(window.location.search).get("embedded") === "1";
  if (isEmbedded) document.body.classList.add("auth-embedded");

  document.querySelectorAll("[data-auth-open-register]").forEach(button => {
    button.addEventListener("click", () => setCustomerMode("register"));
  });

  document.querySelectorAll("[data-auth-open-login]").forEach(button => {
    button.addEventListener("click", () => setCustomerMode("login"));
  });

  document.querySelectorAll("[data-password-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      const showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";
      button.setAttribute("aria-label", showPassword ? "Sembunyikan password" : "Tampilkan password");
    });
  });

  document.querySelectorAll("[data-google-login]").forEach(button => {
    button.addEventListener("click", () => {
      showAuthMessage("Login Google belum terhubung. Silakan gunakan akun yang terdaftar.", true);
    });
  });

  const closeButton = document.getElementById("auth-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      if (isEmbedded && window.parent !== window) {
        window.parent.postMessage("tdp-close-auth", "*");
        return;
      }

      const referrer = document.referrer;
      const referrerUrl = referrer ? new URL(referrer) : null;
      const referrerPath = referrerUrl ? referrerUrl.pathname.toLowerCase() : "";
      const cameFromAuthPage = referrerPath.endsWith("/login.html") || referrerPath.endsWith("/masuk.html");
      if (referrerUrl && referrerUrl.origin === window.location.origin && !cameFromAuthPage) {
        window.history.back();
      } else {
        window.location.href = "index.html";
      }
    });
  }

  document.getElementById("customer-login-form").addEventListener("submit", async event => {
    event.preventDefault();
    const identifier = document.getElementById("customer-login-identifier").value.trim().toLowerCase();
    const password = document.getElementById("customer-login-password").value;

    const staffRole = Object.keys(STAFF_LOGIN_ACCOUNTS).find(role =>
      STAFF_LOGIN_ACCOUNTS[role].username === identifier
    );
    if (staffRole) {
      const account = STAFF_LOGIN_ACCOUNTS[staffRole];
      if (password === account.password) {
        openWorkspace(staffRole, { name: account.username });
      } else {
        showAuthMessage("Username atau password tidak cocok.", true);
      }
      return;
    }

    try {
      const accounts = getCustomerAccounts().filter(item =>
        normalizeCustomerIdentifier(item.username) === identifier ||
        normalizeCustomerIdentifier(item.nama) === identifier
      );
      if (!accounts.length) {
        showAuthMessage("Username/nama atau password tidak cocok.", true);
        return;
      }

      for (const account of accounts) {
        const hash = await hashCustomerPassword(password, hexToBytes(account.salt));
        if (hash === account.passwordHash) {
          openWorkspace("pelanggan", { name: account.nama, username: account.username });
          return;
        }
      }
      showAuthMessage("Username/nama atau password tidak cocok.", true);
    } catch (error) {
      console.error("Gagal memproses login pelanggan.", error);
      showAuthMessage(error.message || "Login pelanggan gagal diproses.", true);
    }
  });

  document.getElementById("customer-register-form").addEventListener("submit", async event => {
    event.preventDefault();
    const username = document.getElementById("customer-register-username").value.trim();
    const nama = document.getElementById("customer-register-name").value.trim();
    const whatsapp = document.getElementById("customer-register-whatsapp").value.trim();
    const password = document.getElementById("customer-register-password").value;
    const passwordConfirm = document.getElementById("customer-register-password-confirm").value;

    if (password !== passwordConfirm) {
      showAuthMessage("Konfirmasi password belum sama.", true);
      return;
    }
    if (password.length < 8) {
      showAuthMessage("Password harus memiliki minimal 8 karakter.", true);
      return;
    }
    if (username.length < 3) {
      showAuthMessage("Username harus terdiri dari minimal 3 karakter.", true);
      return;
    }

    try {
      if (Object.values(STAFF_LOGIN_ACCOUNTS).some(account =>
        normalizeCustomerIdentifier(account.username) === normalizeCustomerIdentifier(username)
      )) {
        showAuthMessage("Username tersebut sudah digunakan. Silakan pilih username lain.", true);
        return;
      }

      const accounts = getCustomerAccounts();
      if (accounts.some(account => normalizeCustomerIdentifier(account.username) === normalizeCustomerIdentifier(username))) {
        showAuthMessage("Username tersebut sudah digunakan. Silakan pilih username lain.", true);
        return;
      }

      if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Fitur keamanan password tidak tersedia. Jalankan situs melalui localhost.");
      }
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const account = {
        username,
        nama,
        whatsapp,
        salt: bytesToHex(salt),
        passwordHash: await hashCustomerPassword(password, salt)
      };
      accounts.push(account);
      localStorage.setItem(CUSTOMER_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      openWorkspace("pelanggan", { name: nama, username });
    } catch (error) {
      console.error("Gagal mendaftarkan akun pelanggan.", error);
      showAuthMessage(error.message || "Pendaftaran gagal diproses.", true);
    }
  });
}

document.addEventListener("DOMContentLoaded", initAuthPage);
