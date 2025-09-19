// Very light client-side session helper using localStorage
export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("ty_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("ty_session", JSON.stringify(session || null));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("ty_session");
}


