// Accessibilità: focus management, live region, navigazione da tastiera

const A11y = (() => {
    // Sposta il focus al primo heading di #app-root dopo ogni cambio di route.
    // tabindex="-1" permette il focus programmatico senza inserire l'elemento
    // nel tab-order naturale della pagina.
    function focusMain() {
        // Porta il focus sul landmark <main> dopo ogni navigazione SPA.
        // Focalizzare h1/h2 mette in Tab-order elementi non interattivi;
        // <main tabindex="-1"> è il target corretto per i route change.
        const target = document.getElementById("app-root");
        if (!target) return;
        target.focus({ preventScroll: true });
    }

    // Annuncia un testo agli screen reader tramite aria-live region.
    // Usato per confermare azioni non ovvie (es. posto prenotato, errore).
    function announce(text) {
        const el = document.getElementById("a11y-announcer");
        if (!el) return;
        el.textContent = "";
        // Il reset + riscrittura in rAF forza il re-trigger della live region
        requestAnimationFrame(() => { el.textContent = text; });
    }

    // Navigazione da tastiera su card (role="link"):
    // Solo Enter attiva il click — Space deve scorrere la pagina (ARIA APG).
    document.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;
        const card = e.target.closest(".show-card[role='link']");
        if (card) { e.preventDefault(); card.click(); }
    });

    return { focusMain, announce };
})();

window.A11y = A11y;
