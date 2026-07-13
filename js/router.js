// =====================================================================
// Router minimale basato su hash (#/path)
// =====================================================================
const routes = [];

const Router = {
    on(pattern, handler) {
        // pattern es. "/spettacolo/:id" o "/prenota/:replicaId"
        const regex = new RegExp(
            "^" + pattern.replace(/:[A-Za-z][A-Za-z0-9]*/g, "([^/]+)") + "$"
        );
        const params = (pattern.match(/:([A-Za-z][A-Za-z0-9]*)/g) || []).map(s => s.slice(1));
        routes.push({ regex, params, handler });
    },

    go(path) {
        if (location.hash !== "#" + path) {
            location.hash = path;
        } else {
            this._render();
        }
    },

    _render() {
        const full = location.hash.replace(/^#/, "") || "/";
        const [pathOnly] = full.split("?");
        for (const r of routes) {
            const m = pathOnly.match(r.regex);
            if (m) {
                const args = {};
                r.params.forEach((p, i) => args[p] = decodeURIComponent(m[i + 1]));
                this._highlightNav(pathOnly);
                const result = r.handler(args, full);
                requestAnimationFrame(() => { if (window.A11y) A11y.focusMain(); });
                return result;
            }
        }
        // fallback
        document.getElementById("app-root").innerHTML =
            `<div class="view"><h2 style="font-family:'Space Grotesk'">404 — pagina non trovata</h2><p><a href="#/">Torna alla home</a></p></div>`;
    },

    _highlightNav(path) {
        document.querySelectorAll('nav#main-nav a[data-route]').forEach(a => {
            const active = a.dataset.route === path;
            a.classList.toggle("active", active);
            if (active) a.setAttribute("aria-current", "page");
            else        a.removeAttribute("aria-current");
        });
    },

    start() {
        window.addEventListener("hashchange", () => this._render());
        this._render();
    }
};

window.Router = Router;
