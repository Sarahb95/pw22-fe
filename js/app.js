// =====================================================================
// Bootstrap: registra le rotte, sincronizza la nav con lo stato auth,
// gestisce il logout.
// =====================================================================

function syncNavWithAuth() {
    const user = Auth.current();
    const isLogged = !!user;
    document.querySelectorAll("[data-auth-only]").forEach(el => el.hidden = !isLogged);
    document.querySelectorAll("[data-anon-only]").forEach(el => el.hidden =  isLogged);

    if (isLogged) {
        const initials = ((user.nome || "?")[0] + (user.cognome || "")[0]).toUpperCase();
        const av = document.getElementById("nav-avatar");
        const un = document.getElementById("nav-username");
        if (av) av.textContent = initials;
        if (un) un.textContent = user.nome;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Routes
    Router.on("/",                       Views.renderHome);
    Router.on("/catalogo",               Views.renderCatalogo);
    Router.on("/spettacolo/:id",         Views.renderDettaglio);
    Router.on("/prenota/:replicaId",     Views.renderSeats);
    Router.on("/login",                  Views.renderLogin);
    Router.on("/registrazione",          Views.renderRegister);
    Router.on("/profilo",                Views.renderProfile);
    Router.on("/abbonamenti",            Views.renderAbbonamenti);
    Router.on("/checkout",               Views.renderCheckout);

    // Logout
    document.getElementById("btn-logout").addEventListener("click", () => {
        Auth.logout();
        Router.go("/");
    });

    // Sync nav con lo stato auth ad ogni cambio
    syncNavWithAuth();
    document.addEventListener("auth:changed", syncNavWithAuth);

    Router.start();
});
