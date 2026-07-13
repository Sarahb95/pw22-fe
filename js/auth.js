// =====================================================================
// Stato utente lato client — persistito in localStorage
// =====================================================================
const STORAGE_KEY = "eliseo.user";

const Auth = {
    current() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
        catch { return null; }
    },
    isLoggedIn() { return !!this.current(); },
    setUser(user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        document.dispatchEvent(new CustomEvent("auth:changed", { detail: user }));
    },
    logout() {
        localStorage.removeItem(STORAGE_KEY);
        document.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
    }
};

window.Auth = Auth;
