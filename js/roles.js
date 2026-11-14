const ACTOR_ROLE_STORAGE_KEY = "tdp_actor_role";
const ACTOR_SESSION_STORAGE_KEY = "tdp_actor_session";
const ACTOR_WORKSPACE_ROUTES = {
  pelanggan: "index.html",
  kasir: "pesanan.html?workspace=kasir",
  admin: "admin.html"
};
const ACTOR_ROLE_LABELS = {
  pelanggan: "Pelanggan",
  kasir: "Kasir",
  admin: "Admin"
};

function getActorSession() {
  for (const storage of [localStorage, sessionStorage]) {
    const savedSession = storage.getItem(ACTOR_SESSION_STORAGE_KEY);
    if (!savedSession) continue;

    try {
      const session = JSON.parse(savedSession);
      if (
        session &&
        session.version === 2 &&
        ["pelanggan", "kasir", "admin"].includes(session.role) &&
        storage.getItem(ACTOR_ROLE_STORAGE_KEY) === session.role
      ) {
        return session;
      }
    } catch (error) {
      console.error("Gagal membaca sesi aktor.", error);
    }
  }
  return null;
}

function getActorRole() {
  const session = getActorSession();
  return session ? session.role : null;
}

function setActorSession(role, details = {}, remember = true) {
  const session = {
    version: 2,
    role,
    name: details.name || ACTOR_ROLE_LABELS[role],
    username: details.username || "",
    email: details.email || "",
    createdAt: new Date().toISOString()
  };
  localStorage.removeItem(ACTOR_ROLE_STORAGE_KEY);
  localStorage.removeItem(ACTOR_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(ACTOR_ROLE_STORAGE_KEY);
  sessionStorage.removeItem(ACTOR_SESSION_STORAGE_KEY);
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(ACTOR_ROLE_STORAGE_KEY, role);
  storage.setItem(ACTOR_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function requireActorRole(role) {
  if (getActorRole() === role) return true;

  window.alert(`Silakan masuk sebagai ${ACTOR_ROLE_LABELS[role] || role} terlebih dahulu.`);
  window.location.replace("login.html");
  return false;
}

function leaveActorWorkspace() {
  localStorage.removeItem(ACTOR_ROLE_STORAGE_KEY);
  localStorage.removeItem(ACTOR_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(ACTOR_ROLE_STORAGE_KEY);
  sessionStorage.removeItem(ACTOR_SESSION_STORAGE_KEY);
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-actor-logout]").forEach(button => {
    button.addEventListener("click", leaveActorWorkspace);
  });

  const activeRole = getActorRole();
  document.querySelectorAll("[data-role-visible]").forEach(element => {
    element.hidden = element.dataset.roleVisible !== activeRole;
  });

  const sessionPanel = document.getElementById("auth-current-session");
  if (sessionPanel && activeRole) {
    const session = getActorSession();

    const identity = session && (session.username || session.name || session.email);
    sessionPanel.hidden = false;
    sessionPanel.querySelector("[data-session-description]").textContent =
      `Sesi aktif: ${ACTOR_ROLE_LABELS[activeRole] || activeRole}${identity ? ` (${identity})` : ""}.`;
  }
});
