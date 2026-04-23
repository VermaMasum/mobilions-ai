// Shared auth utility for all frontend pages

export function getToken() { return localStorage.getItem("mob_token"); }
export function getUser() {
  try { return JSON.parse(localStorage.getItem("mob_user") || "null"); } catch { return null; }
}
export function setSession(token, user) {
  localStorage.setItem("mob_token", token);
  localStorage.setItem("mob_user", JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem("mob_token");
  localStorage.removeItem("mob_user");
}

export function requireAuth() {
  const token = getToken();
  if (!token) { window.location.href = "/login"; return false; }
  return true;
}

export function redirectIfAuthed() {
  if (getToken()) { window.location.href = "/dashboard"; return true; }
  return false;
}

export async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers });
  if (res.status === 401) { clearSession(); window.location.href = "/login"; return null; }
  return res;
}

export function getInitials(name) {
  return (name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
