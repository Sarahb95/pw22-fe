// Aggiorna title, meta e dati strutturati ad ogni cambio di route.
// Con routing a hash (#/) il server riceve sempre "/" — il canonical punta
// alla root; la differenziazione per pagina avviene via document.title,
// meta description, Open Graph e JSON-LD.

const SEO = (() => {
    const SITE = "Nuovo Cinema Teatro Eliseo";
    const BASE = "https://eliseo.poggiomarino.it";
    const DEFAULT_DESC = "Teatro, danza, cinema e pensiero al Nuovo Cinema Teatro Eliseo di Poggiomarino. Scopri la programmazione della stagione 2026·27 e prenota il tuo posto.";
    const DEFAULT_IMG  = BASE + "/assets/bannerEliseo.png";

    function _meta(attr, key, val) {
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
            el = document.createElement("meta");
            el.setAttribute(attr, key);
            document.head.appendChild(el);
        }
        el.content = val;
    }

    function _link(rel, href) {
        let el = document.querySelector(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement("link");
            el.rel = rel;
            document.head.appendChild(el);
        }
        el.href = href;
    }

    function _jsonLd(data) {
        let el = document.getElementById("seo-ld-page");
        if (!el) {
            el = document.createElement("script");
            el.type = "application/ld+json";
            el.id   = "seo-ld-page";
            document.head.appendChild(el);
        }
        el.textContent = data ? JSON.stringify(data) : "{}";
    }

    return {
        BASE,

        set({ title, description, image, robots, schema } = {}) {
            const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — Poggiomarino`;
            const desc      = description || DEFAULT_DESC;
            const img       = image       || DEFAULT_IMG;

            document.title = fullTitle;

            _meta("name", "description", desc);

            if (robots) _meta("name", "robots", robots);

            // noindex globale gestito da index.html — non rimuovere mai il meta robots

            // Open Graph
            _meta("property", "og:title",       fullTitle);
            _meta("property", "og:description",  desc);
            _meta("property", "og:image",        img);

            // Twitter Card
            _meta("name", "twitter:title",       fullTitle);
            _meta("name", "twitter:description", desc);
            _meta("name", "twitter:image",       img);

            // Canonical: con hash routing tutti i path convergono alla root
            _link("canonical", BASE + "/");

            _jsonLd(schema);
        }
    };
})();

window.SEO = SEO;
