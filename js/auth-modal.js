function initAuthModal() {
  const overlay = document.createElement("div");
  overlay.id = "auth-frame-overlay";
  overlay.className = "auth-frame-overlay";
  overlay.hidden = true;

  const shell = document.createElement("div");
  shell.className = "auth-frame-shell";

  const frame = document.createElement("iframe");
  frame.className = "auth-frame";
  frame.title = "Panel Masuk dan Daftar";
  frame.src = "about:blank";
  shell.appendChild(frame);
  overlay.appendChild(shell);
  document.body.appendChild(overlay);

  let lastFocusedElement = null;
  let previousOverflow = "";

  function closeAuthModal() {
    overlay.hidden = true;
    document.body.style.overflow = previousOverflow;
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function openAuthModal() {
    lastFocusedElement = document.activeElement;
    previousOverflow = document.body.style.overflow;
    frame.src = "login.html?embedded=1";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  document.addEventListener("click", event => {
    const opener = event.target.closest("[data-open-login]");
    if (!opener) return;
    event.preventDefault();
    openAuthModal();
  });

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeAuthModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.hidden) closeAuthModal();
  });

  window.addEventListener("message", event => {
    if (event.source !== frame.contentWindow || event.data !== "tdp-close-auth") return;
    if (event.origin !== "null" && event.origin !== window.location.origin) return;
    closeAuthModal();
  });

  window.openAuthModal = openAuthModal;
}

document.addEventListener("DOMContentLoaded", initAuthModal);
