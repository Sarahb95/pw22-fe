// =====================================================================
// Chiamate REST al backend
// =====================================================================
const API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://localhost:8080/api"
    : "https://eliseo-backend.onrender.com/api";

async function _fetch(path, opts = {}) {
    const r = await fetch(`${API_BASE}${path}`, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            ...(opts.headers || {})
        }
    });
    if (!r.ok) {
        const err = await r.json().catch(() => ({ error: r.statusText }));
        throw new Error(err.error || `${opts.method || "GET"} ${path} → ${r.status}`);
    }
    if (r.status === 204) return null;
    const ct = r.headers.get("content-type") || "";
    return ct.includes("json") ? r.json() : r.text();
}

const API = {
    spettacoli: {
        list:   (cat)  => _fetch("/spettacoli" + (cat ? `?categoria=${cat}` : "")),
        get:    (id)   => _fetch(`/spettacoli/${id}`),
    },
    repliche: {
        list:        (spettacoloId) => _fetch("/repliche" + (spettacoloId ? `?spettacoloId=${spettacoloId}` : "")),
        get:         (id)           => _fetch(`/repliche/${id}`),
        posti:       (id)           => _fetch(`/repliche/${id}/posti`),
    },
    prenotazioni: {
        creaBatch: (req)        => _fetch("/prenotazioni/batch", { method: "POST", body: JSON.stringify(req) }),
        listMine:  (utenteId)   => _fetch(`/prenotazioni?utenteId=${utenteId}`),
    },
    auth: {
        login:    (req) => _fetch("/auth/login",    { method: "POST", body: JSON.stringify(req) }),
        register: (req) => _fetch("/auth/register", { method: "POST", body: JSON.stringify(req) }),
    },
    abbonamenti: {
        acquista:  (req)      => _fetch("/abbonamenti",                              { method: "POST", body: JSON.stringify(req) }),
        listMine:  (utenteId) => _fetch(`/abbonamenti?utenteId=${utenteId}`),
        copertura: (utenteId) => _fetch(`/abbonamenti/copertura?utenteId=${utenteId}`)
    }
};

window.API = API;
