// =====================================================================
// Views: ogni funzione popola #app-root con l'HTML della pagina.
// =====================================================================

const CAT_LABEL = {
    TEATRO: "Teatro",
    DANZA:  "Danza",
    CINEMA: "Cinema",
    EVENTO: "Pensiero"
};

function root() { return document.getElementById("app-root"); }

function escapeHtml(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function fmtDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("it-IT", {
        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
}

function fmtPrice(p) {
    const n = Number(p);
    return n === 0 ? "Ingresso libero" : `€ ${n.toFixed(2)}`;
}

function showCardHTML(s, featured = false) {
    const cat = s.categoria || "TEATRO";
    const accent = `var(--cat-${cat})`;
    const poster = s.locandinaUrl
        ? `<img src="${escapeHtml(s.locandinaUrl)}" alt="${escapeHtml(s.titolo)}">
           <div class="show-card-poster-title show-card-poster-title--${cat.toLowerCase()}">${escapeHtml(s.titolo)}</div>`
        : `<div class="show-card-poster-fallback">${escapeHtml(s.titolo)}</div>`;
    return `
        <article class="show-card${featured ? " featured" : ""}" data-cat="${cat}" style="--cat:${accent}" tabindex="0" role="link" aria-label="${escapeHtml(s.titolo)}, ${CAT_LABEL[cat] || cat}" onclick="Router.go('/spettacolo/${s.id}')">
            <div class="show-card-poster">
                <span class="show-card-cat">${CAT_LABEL[cat] || cat}</span>
                ${poster}
            </div>
            <div class="show-card-body">
                <h3>${escapeHtml(s.titolo)}</h3>
                <div class="regista">${escapeHtml(s.regista || "")}</div>
                <div class="desc">${escapeHtml(s.descrizione || "")}</div>
            </div>
        </article>
    `;
}

function frameHTML(s, idx) {
    const cat = s.categoria || "TEATRO";
    const label = CAT_LABEL[cat] || cat;
    const num = String(idx + 1).padStart(2, "0");
    const poster = s.locandinaUrl
        ? `<img src="${escapeHtml(s.locandinaUrl)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`
        : "";
    return `
        <div class="frame" data-cat="${cat}" onclick="Router.go('/spettacolo/${s.id}')"
             tabindex="0" role="link" aria-label="${escapeHtml(s.titolo)}, ${label}"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();Router.go('/spettacolo/${s.id}')}">
            <div class="frame-poster">
                ${poster}
                <span class="frame-num">${num}</span>
                <span class="frame-cat">${escapeHtml(label)}</span>
            </div>
            <div class="frame-body">
                <h3>${escapeHtml(s.titolo)}</h3>
                ${s.regista ? `<p>${escapeHtml(s.regista)}</p>` : ""}
            </div>
        </div>`;
}


// HOME
async function renderHome() {
    SEO.set({
        description: "Nuovo Cinema Teatro Eliseo di Poggiomarino: la stagione 2026·27 tra teatro, danza, cinema e salotti culturali. Prenota il tuo posto."
    });
    root().innerHTML = `
        <section class="hero">
            <div class="hero-content">
                <h1 class="sr-only">Nuovo Cinema Teatro Eliseo — Poggiomarino</h1>
                <div class="hero-typo" aria-hidden="true">
                    <p class="hero-typo-label">Nuovo Cinema &middot; Teatro</p>
                    <h2 class="hero-typo-title">&ldquo;ELISEO&rdquo;</h2>
                    <p class="hero-typo-sub">Stagione 26 &middot; 27</p>
                </div>
                <div class="hero-cta-bar">
                    <a class="btn btn-gold" href="#/catalogo">Scopri la stagione →</a>
                    ${Auth.isLoggedIn() ? "" : `<a class="btn btn-outline" href="#/login">Accedi</a>`}
                </div>
            </div>
            <div class="hero-deco" aria-hidden="true">
                <img class="hero-deco-img" src="assets/banner.png" alt="">
            </div>
        </section>

        <div class="ticker-wrap" aria-hidden="true">
            <div class="ticker-inner">
                ${Array(12).fill("TEATRO &nbsp;·&nbsp; DANZA &nbsp;·&nbsp; CINEMA &nbsp;·&nbsp; EVENTO &nbsp;·&nbsp;").join(" ")}
            </div>
        </div>

        <section class="view" id="featured-section">
            <div class="section-head">
                <h2>In cartellone</h2>
                <div class="section-rule"></div>
            </div>
            <div class="film-wrap">
                <button class="film-arrow" aria-label="Scorri indietro" onclick="document.getElementById('featured-film-outer').scrollBy({left:-210,behavior:'smooth'})">←</button>
                <div class="pellicola">
                    <div class="perf-strip"></div>
                    <div class="film-track-outer" id="featured-film-outer">
                        <div class="film-track" id="featured-grid">
                            <div class="loader" style="padding:2rem;color:var(--bg-2)">Caricamento…</div>
                        </div>
                    </div>
                    <div class="perf-strip"></div>
                </div>
                <button class="film-arrow" aria-label="Scorri avanti" onclick="document.getElementById('featured-film-outer').scrollBy({left:210,behavior:'smooth'})">→</button>
            </div>
        </section>

        <section class="home-abb-section">
            <div class="home-abb-inner">
                <div class="section-head">
                    <h2>Abbonati alla stagione</h2>
                    <div class="section-rule"></div>
                    <p class="lede">Scegli il tuo piano e vivi l'Eliseo senza limiti. Valido fino al 30 giugno 2027.</p>
                </div>
                <div class="abb-grid">
                    ${PIANI.map(p => `
                        <div class="abb-card" style="--accent:${p.colore};--shadow:${p.shadow}">
                            <div class="abb-card-top">
                                <div class="abb-tipo">${escapeHtml(p.nome)}</div>
                                <div class="abb-prezzo">${escapeHtml(p.prezzo)}</div>
                                <p class="abb-desc">${escapeHtml(p.desc)}</p>
                            </div>
                            <ul class="abb-benefici">
                                ${p.benefici.map(b => `<li>${escapeHtml(b)}</li>`).join("")}
                            </ul>
                            <button class="btn abb-btn" data-tipo="${escapeHtml(p.tipo)}">
                                Acquista
                            </button>
                            <div class="abb-feedback" data-feedback="${escapeHtml(p.tipo)}"></div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `;

    // Abbonamento dalla home → checkout
    root().querySelectorAll(".abb-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!Auth.isLoggedIn()) { Router.go("/login?next=/"); return; }
            const tipo = btn.dataset.tipo;
            const piano = PIANI.find(p => p.tipo === tipo);
            sessionStorage.setItem("checkout", JSON.stringify({
                type: "abbonamento", utenteId: Auth.current().id,
                tipo, nome: piano.nome, prezzo: piano.prezzo
            }));
            Router.go("/checkout");
        });
    });

    try {
        const items = await API.spettacoli.list();
        const grid = document.getElementById("featured-grid");
        if (!grid) return;
        grid.innerHTML = items.map((s, i) => frameHTML(s, i)).join("");
    } catch (e) {
        const g = document.getElementById("featured-grid");
        if (g) g.innerHTML = `<p style="padding:2rem;color:var(--gold)">Errore: ${escapeHtml(e.message)}</p>`;
    }
}

// CATALOGO
async function renderCatalogo(_, path) {
    const params = new URLSearchParams(path.split("?")[1] || "");
    const activeCat = params.get("cat");

    SEO.set({
        title: activeCat ? `${CAT_LABEL[activeCat] || activeCat} — Catalogo` : "Catalogo spettacoli",
        description: activeCat
            ? `Tutti gli spettacoli di ${CAT_LABEL[activeCat] || activeCat} in programma al Nuovo Cinema Teatro Eliseo di Poggiomarino.`
            : "La programmazione completa del Nuovo Cinema Teatro Eliseo: teatro, danza, cinema e salotti culturali."
    });

    const pills = ["TUTTI", "TEATRO", "DANZA", "CINEMA", "EVENTO"];

    root().innerHTML = `
        <section class="view">
            <div class="section-head">
                <h2>Catalogo</h2>
                <p class="lede">Filtra per categoria.</p>
            </div>
            <div class="cat-bar" id="cat-bar">
                ${pills.map(p => {
                    const isActive = (p === "TUTTI" && !activeCat) || (p === activeCat);
                    const href = p === "TUTTI" ? "#/catalogo" : `#/catalogo?cat=${p}`;
                    const label = p === "TUTTI" ? "Tutti" : CAT_LABEL[p];
                    return `<a class="cat-pill ${isActive ? "active" : ""}" href="${href}">${label}</a>`;
                }).join("")}
            </div>
            <div class="card-grid" id="catalog-grid"><div class="loader">Caricamento…</div></div>
        </section>
    `;

    try {
        const items = await API.spettacoli.list(activeCat);
        const grid = document.getElementById("catalog-grid");
        if (!grid) return;
        grid.innerHTML = items.length
            ? items.map(showCardHTML).join("")
            : `<p class="loader">Nessuno spettacolo in questa categoria.</p>`;
    } catch (e) {
        const g = document.getElementById("catalog-grid");
        if (g) g.innerHTML = `<p style="color:var(--magenta)">Errore: ${escapeHtml(e.message)}</p>`;
    }
}

// DETTAGLIO SPETTACOLO
async function renderDettaglio({ id }) {
    root().innerHTML = `<div class="loader">Caricamento…</div>`;

    try {
        const [s, repliche] = await Promise.all([
            API.spettacoli.get(id),
            API.repliche.list(id)
        ]);

        const _now = new Date();
        const _upcoming = repliche.find(r => new Date(r.dataOra) >= _now) || repliche[0];
        const _schema = {
            "@context": "https://schema.org",
            "@type": ({ TEATRO: "TheaterEvent", DANZA: "DanceEvent", CINEMA: "ScreeningEvent", EVENTO: "Event" })[s.categoria] || "Event",
            "name": s.titolo,
            "description": s.descrizione || s.trama || "",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "location": {
                "@type": "PerformingArtsTheater",
                "name": "Nuovo Cinema Teatro Eliseo",
                "address": { "@type": "PostalAddress", "streetAddress": "Via XX Settembre", "addressLocality": "Poggiomarino", "addressRegion": "NA", "postalCode": "80040", "addressCountry": "IT" }
            },
            "organizer": { "@type": "Organization", "name": "Nuovo Cinema Teatro Eliseo" }
        };
        if (s.locandinaUrl) _schema.image      = SEO.BASE + s.locandinaUrl;
        if (_upcoming)      _schema.startDate   = _upcoming.dataOra;
        if (s.regista)      _schema.director    = { "@type": "Person", "name": s.regista };
        SEO.set({
            title:       s.titolo,
            description: s.descrizione || `${s.titolo} — ${CAT_LABEL[s.categoria] || s.categoria} al Nuovo Cinema Teatro Eliseo di Poggiomarino.`,
            image:       s.locandinaUrl ? SEO.BASE + s.locandinaUrl : undefined,
            schema:      _schema
        });

        const cat = s.categoria || "TEATRO";
        const accent = `var(--cat-${cat})`;

        root().innerHTML = `
            <article class="detail" style="--cat:${accent}">
                <div class="detail-poster">
                    ${s.locandinaUrl
                        ? `<img src="${escapeHtml(s.locandinaUrl)}" alt="${escapeHtml(s.titolo)}" style="width:100%;height:100%;object-fit:cover">`
                        : `<div class="detail-poster-fallback">${escapeHtml(s.titolo)}</div>`}
                </div>
                <div class="detail-info">
                    <nav class="breadcrumb" aria-label="Percorso di navigazione">
                        <a href="#/catalogo">Catalogo</a> · <a href="#/catalogo?cat=${cat}">${CAT_LABEL[cat]}</a>
                    </nav>
                    <div class="cat-tag">${CAT_LABEL[cat] || cat}${s.genere ? " · " + escapeHtml(s.genere) : ""}</div>
                    <h1>${escapeHtml(s.titolo)}</h1>
                    <div class="regista">${escapeHtml(s.regista || "")}${s.durataMin ? ` · ${s.durataMin} min` : ""}</div>
                    ${s.descrizione ? `<div class="descrizione">${escapeHtml(s.descrizione)}</div>` : ""}
                    ${s.trama       ? `<div class="trama">${escapeHtml(s.trama)}</div>` : ""}

                    ${s.castPrincipale ? `
                        <h2>Cast</h2>
                        <div class="cast-list">${escapeHtml(s.castPrincipale)}</div>
                    ` : ""}

                    <h2>Repliche</h2>
                    <div class="repliche-list">
                        ${repliche.length === 0
                            ? `<p style="color:var(--text-dim)">Nessuna replica programmata.</p>`
                            : repliche.map(r => `
                                <div class="replica-row">
                                    <div>
                                        <div class="when">${fmtDateTime(r.dataOra)}</div>
                                        <div class="where">${escapeHtml(r.salaNome)}</div>
                                    </div>
                                    <div class="price">${fmtPrice(r.prezzoBase)}</div>
                                    <a class="btn btn-gold" href="#/prenota/${r.id}">Prenota →</a>
                                </div>
                            `).join("")
                        }
                    </div>
                </div>
            </article>
        `;
        A11y.focusMain();
    } catch (e) {
        root().innerHTML = `<div class="view"><p style="color:var(--magenta)">${escapeHtml(e.message)}</p></div>`;
    }
}

// PIANTA POSTI (multi-select)
async function renderSeats({ replicaId }) {
    if (!Auth.isLoggedIn()) {
        Router.go("/login?next=/prenota/" + replicaId);
        return;
    }
    SEO.set({ title: "Prenota il tuo posto", robots: "noindex, nofollow" });
    root().innerHTML = `<div class="loader">Caricamento pianta…</div>`;

    try {
        const [replica, posti] = await Promise.all([
            API.repliche.get(replicaId),
            API.repliche.posti(replicaId)
        ]);

        const byRow = {};
        for (const p of posti) {
            (byRow[p.fila] = byRow[p.fila] || []).push(p);
        }
        const filas = Object.keys(byRow).sort();
        filas.forEach(f => byRow[f].sort((a, b) => a.numero - b.numero));

        const prezzo = Number(replica.prezzoBase);

        root().innerHTML = `
            <section class="seat-view">
                <nav class="breadcrumb" aria-label="Percorso di navigazione">
                    <a href="#/spettacolo/${replica.spettacoloId}">${escapeHtml(replica.spettacoloTitolo)}</a>
                </nav>
                <h2>${escapeHtml(replica.spettacoloTitolo)}</h2>
                <p class="when">${fmtDateTime(replica.dataOra)} · ${escapeHtml(replica.salaNome)} · ${fmtPrice(replica.prezzoBase)} a posto</p>

                <div class="stage">Palco · Schermo</div>

                <div class="seat-grid" id="seat-grid" role="group" aria-label="Seleziona i tuoi posti">
                    ${filas.map(f => `
                        <div class="seat-row">
                            <span class="seat-row-label">${f}</span>
                            ${byRow[f].map(p => `
                                <div class="seat ${p.occupato ? "occupied" : ""}"
                                     role="checkbox"
                                     aria-checked="false"
                                     aria-disabled="${p.occupato ? 'true' : 'false'}"
                                     aria-label="Posto ${f}${p.numero}${p.occupato ? ', occupato' : ''}"
                                     tabindex="${p.occupato ? '-1' : '0'}"
                                     data-id="${p.id}"
                                     data-label="${f}${p.numero}">
                                    ${p.numero}
                                </div>
                            `).join("")}
                            <span class="seat-row-label">${f}</span>
                        </div>
                    `).join("")}
                </div>

                <div class="seat-legend" role="list" aria-label="Legenda posti">
                    <span role="listitem"><span class="swatch free" aria-hidden="true"></span>Libero</span>
                    <span role="listitem"><span class="swatch selected" aria-hidden="true"></span>Selezionato</span>
                    <span role="listitem"><span class="swatch occupied" aria-hidden="true"></span>Occupato</span>
                </div>

                <div class="seat-cta">
                    <div class="selection" aria-live="polite" aria-atomic="true">
                        <strong id="seat-count">0</strong> posti selezionati
                        <span id="seat-list" style="color:var(--text-dim);margin-left:0.5rem"></span><br>
                        Totale: <strong id="seat-total">€ 0.00</strong>
                    </div>
                    <button id="confirm-booking" class="btn btn-magenta" disabled>Conferma prenotazione</button>
                </div>
                <p id="seat-feedback" aria-live="assertive" aria-atomic="true" style="margin-top:1rem;text-align:center;font-family:'Space Grotesk'"></p>
            </section>
        `;

        const MAX_POSTI_BATCH = 10;
        const selected = new Map();  // id -> label
        const countEl = document.getElementById("seat-count");
        const listEl = document.getElementById("seat-list");
        const totalEl = document.getElementById("seat-total");
        const btn = document.getElementById("confirm-booking");
        const feedback = document.getElementById("seat-feedback");

        const refreshUI = () => {
            const n = selected.size;
            countEl.textContent = n;
            listEl.textContent = n > 0
                ? "(" + Array.from(selected.values()).join(", ") + ")"
                : "";
            totalEl.textContent = prezzo === 0
                ? "Ingresso libero"
                : `€ ${(n * prezzo).toFixed(2)}`;
            btn.disabled = n === 0;
            feedback.textContent = "";
        };

        document.getElementById("seat-grid").addEventListener("click", (e) => {
            const seat = e.target.closest(".seat");
            if (!seat || seat.classList.contains("occupied")) return;
            const id = Number(seat.dataset.id);
            if (selected.has(id)) {
                selected.delete(id);
                seat.classList.remove("selected");
                seat.setAttribute("aria-checked", "false");
            } else {
                if (selected.size >= MAX_POSTI_BATCH) {
                    feedback.style.color = "var(--yellow)";
                    feedback.textContent = "Massimo " + MAX_POSTI_BATCH + " posti per prenotazione.";
                    return;
                }
                selected.set(id, seat.dataset.label);
                seat.classList.add("selected");
                seat.setAttribute("aria-checked", "true");
            }
            refreshUI();
        });

        document.getElementById("seat-grid").addEventListener("keydown", e => {
            if (e.key !== "Enter" && e.key !== " ") return;
            const seat = e.target.closest(".seat");
            if (!seat || seat.classList.contains("occupied")) return;
            e.preventDefault();
            seat.click();
        });

        btn.addEventListener("click", () => {
            if (selected.size === 0) return;
            const user = Auth.current();
            sessionStorage.setItem("checkout", JSON.stringify({
                type:       "biglietto",
                utenteId:   user.id,
                replicaId:  Number(replicaId),
                postoIds:   Array.from(selected.keys()),
                labels:     Array.from(selected.values()),
                spettacolo: replica.spettacoloTitolo,
                dataOra:    replica.dataOra,
                sala:       replica.salaNome,
                totale:     (selected.size * prezzo).toFixed(2)
            }));
            Router.go("/checkout");
        });

    } catch (e) {
        root().innerHTML = `<div class="view"><p style="color:var(--magenta)">${escapeHtml(e.message)}</p></div>`;
    }
}

// ABBONAMENTI
const PIANI = [
    {
        tipo:     "STAGIONALE",
        nome:     "Stagionale",
        prezzo:   "€ 90",
        colore:   "var(--magenta)",
        shadow:   "var(--shadow-mag)",
        benefici: ["Accesso illimitato a tutti gli spettacoli", "Fino a 2 postazioni per evento", "Valido per l'intera stagione 26 · 27"],
        desc:     "La stagione completa, tutta per te."
    },
    {
        tipo:     "OPEN10",
        nome:     "Open 10",
        prezzo:   "€ 45",
        colore:   "var(--cyan)",
        shadow:   "var(--shadow-cy)",
        benefici: ["10 ingressi a scelta libera", "Fino a 2 postazioni per entrata", "Usabili per qualsiasi spettacolo"],
        desc:     "Dieci momenti da scegliere quando vuoi."
    },
    {
        tipo:     "UNDER25",
        nome:     "Under 25",
        prezzo:   "€ 30",
        colore:   "var(--mauve)",
        shadow:   "0 0 32px rgba(176,64,112,0.28)",
        benefici: ["Stagione completa riservata agli under 25", "1 postazione per evento", "Il prezzo più accessibile"],
        desc:     "Per chi è ancora all'inizio della storia."
    }
];

async function renderAbbonamenti() {
    if (!Auth.isLoggedIn()) { Router.go("/login?next=/abbonamenti"); return; }
    SEO.set({
        title: "Abbonamenti stagionali",
        description: "Abbonati alla stagione 2026·27 del Nuovo Cinema Teatro Eliseo: piano Stagionale, Open 10 o Under 25."
    });
    const u = Auth.current();

    root().innerHTML = `
        <section class="view abb-view">
            <div class="section-head">
                <h2>Abbonamenti</h2>
                <div class="section-rule"></div>
            </div>
            <p class="abb-lede">
                Scegli il tuo abbonamento per la stagione 26 · 27.<br>
                Valido fino al 30 giugno 2027.
            </p>
            <div class="abb-grid">
                ${PIANI.map(p => `
                    <div class="abb-card" style="--accent:${p.colore};--shadow:${p.shadow}">
                        <div class="abb-card-top">
                            <div class="abb-tipo">${escapeHtml(p.nome)}</div>
                            <div class="abb-prezzo">${escapeHtml(p.prezzo)}</div>
                            <p class="abb-desc">${escapeHtml(p.desc)}</p>
                        </div>
                        <ul class="abb-benefici">
                            ${p.benefici.map(b => `<li>${escapeHtml(b)}</li>`).join("")}
                        </ul>
                        <button class="btn abb-btn" data-tipo="${escapeHtml(p.tipo)}">
                            Acquista
                        </button>
                        <div class="abb-feedback" data-feedback="${escapeHtml(p.tipo)}"></div>
                    </div>
                `).join("")}
            </div>
        </section>
    `;

    root().querySelectorAll(".abb-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tipo = btn.dataset.tipo;
            const piano = PIANI.find(p => p.tipo === tipo);
            sessionStorage.setItem("checkout", JSON.stringify({
                type: "abbonamento", utenteId: u.id,
                tipo, nome: piano.nome, prezzo: piano.prezzo
            }));
            Router.go("/checkout");
        });
    });
}

// LOGIN
function renderLogin(_, path) {
    SEO.set({ title: "Accedi", robots: "noindex, nofollow" });
    const params = new URLSearchParams(path.split("?")[1] || "");
    const next = params.get("next") || "/";

    root().innerHTML = `
        <section class="auth-view">
            <h2>Accedi</h2>
            <p class="auth-lede">Bentornato all'Eliseo.</p>
            <form id="login-form">
                <label>Email <input type="email" name="email" required autocomplete="email"></label>
                <label>Password <input type="password" name="password" required autocomplete="current-password"></label>
                <button type="submit" class="btn btn-magenta">Accedi</button>
            </form>
            <div id="login-feedback" aria-live="polite" aria-atomic="true"></div>
            <div class="switch">Non hai un account? <a href="#/registrazione">Registrati</a></div>
            <div class="demo-hint">
                Demo: <code>marco@example.it</code> / <code>marco123</code><br>
                oppure <code>giulia@example.it</code> / <code>giulia123</code>
            </div>
        </section>
    `;

    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        const feedback = document.getElementById("login-feedback");
        feedback.innerHTML = "";
        try {
            const user = await API.auth.login(data);
            Auth.setUser(user);
            Router.go(next);
        } catch (err) {
            feedback.innerHTML = `<div class="feedback error">${escapeHtml(err.message)}</div>`;
        }
    });
}

// REGISTRAZIONE
function renderRegister() {
    SEO.set({ title: "Crea un account", robots: "noindex, nofollow" });
    root().innerHTML = `
        <section class="auth-view">
            <h2>Crea il tuo account</h2>
            <p class="auth-lede">Per prenotare il tuo posto all'Eliseo.</p>
            <form id="register-form">
                <label>Nome <input name="nome" required></label>
                <label>Cognome <input name="cognome" required></label>
                <label>Email <input type="email" name="email" required autocomplete="email"></label>
                <label>Password (min 6) <input type="password" name="password" required minlength="6" autocomplete="new-password"></label>
                <label>Data di nascita <input type="text" name="dataNascita" placeholder="gg/mm/aaaa" required></label>
                <button type="submit" class="btn btn-gold">Registrati</button>
            </form>
            <div id="register-feedback" aria-live="polite" aria-atomic="true"></div>
            <div class="switch">Hai già un account? <a href="#/login">Accedi</a></div>
        </section>
    `;

    document.querySelector('[name="dataNascita"]').addEventListener('input', function () {
        const digits = this.value.replace(/\D/g, '').slice(0, 8);
        let out = digits.slice(0, 2);
        if (digits.length > 2) out += '/' + digits.slice(2, 4);
        if (digits.length > 4) out += '/' + digits.slice(4);
        this.value = out;
    });

    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        const feedback = document.getElementById("register-feedback");
        feedback.innerHTML = "";
        try {
            const [gg, mm, aaaa] = data.dataNascita.split("/");
            if (!gg || !mm || !aaaa || isNaN(new Date(`${aaaa}-${mm}-${gg}`))) {
                feedback.innerHTML = `<div class="feedback error">Data non valida. Usa il formato gg/mm/aaaa.</div>`;
                return;
            }
            data.dataNascita = `${aaaa}-${mm}-${gg}`;
            const user = await API.auth.register(data);
            Auth.setUser(user);
            feedback.innerHTML = `<div class="feedback ok">Account creato! Reindirizzamento…</div>`;
            setTimeout(() => Router.go("/"), 900);
        } catch (err) {
            feedback.innerHTML = `<div class="feedback error">${escapeHtml(err.message)}</div>`;
        }
    });
}

// PROFILO
async function renderProfile() {
    if (!Auth.isLoggedIn()) { Router.go("/login?next=/profilo"); return; }
    SEO.set({ title: "Il tuo profilo", robots: "noindex, nofollow" });
    const u = Auth.current();

    root().innerHTML = `
        <section class="profile-view">
            <h2>Ciao, ${escapeHtml(u.nome)}.</h2>
            <p class="lede">${escapeHtml(u.email)}</p>

            <h3 class="profile-section-title">I tuoi abbonamenti</h3>
            <div id="abb-list" class="abb-list-inline"><div class="loader">Caricamento…</div></div>
            <div style="margin-bottom:2rem">
                <a class="btn btn-gold" href="#/abbonamenti">Acquista un abbonamento →</a>
            </div>

            <h3 class="profile-section-title">Le tue prenotazioni</h3>
            <div id="booking-list" class="booking-list"><div class="loader">Caricamento…</div></div>
            <div style="margin-top:2rem"><a class="btn btn-magenta" href="#/catalogo">Esplora la stagione →</a></div>
        </section>
    `;

    try {
        const abbs = await API.abbonamenti.listMine(u.id);
        const abbContainer = document.getElementById("abb-list");
        if (abbs.length === 0) {
            abbContainer.innerHTML = `<p style="color:var(--text-dim)">Nessun abbonamento attivo.</p>`;
        } else {
            abbContainer.innerHTML = abbs.map(a => {
                const piano = PIANI.find(p => p.tipo === a.tipo) || { colore: "var(--purple)", nome: a.tipo };
                return `
                    <div class="abb-badge" style="--accent:${piano.colore}">
                        <span class="abb-badge-nome">${escapeHtml(piano.nome)}</span>
                        <span class="abb-badge-date">fino al ${new Date(a.dataFine).toLocaleDateString("it-IT")}</span>
                        <span class="abb-badge-price">${Number(a.prezzo).toFixed(2)} €</span>
                    </div>
                `;
            }).join("");
        }
    } catch (_) {
        const el = document.getElementById("abb-list");
        if (el) el.innerHTML = '<p style="color:var(--magenta)">Impossibile caricare gli abbonamenti.</p>';
    }

    try {
        const items = await API.prenotazioni.listMine(u.id);
        const container = document.getElementById("booking-list");
        if (!container) return;
        if (items.length === 0) {
            container.innerHTML = `<p style="color:var(--text-dim)">Non hai ancora nessuna prenotazione. Vai al <a href="#/catalogo" style="color:var(--cyan)">catalogo</a> per scegliere uno spettacolo.</p>`;
            return;
        }
        container.innerHTML = items.map(b => {
            const cat = b.categoria || "TEATRO";
            return `
                <div class="booking-row" style="--cat:var(--cat-${cat})">
                    <span class="seat-tag" style="background:var(--cat-${cat})">${escapeHtml(b.fila)}${b.numero}</span>
                    <div>
                        <div class="show-title">
                            <a href="#/spettacolo/${b.spettacoloId}" style="color:inherit">${escapeHtml(b.spettacoloTitolo)}</a>
                        </div>
                        <div class="meta">${fmtDateTime(b.dataOra)} · ${escapeHtml(b.salaNome)}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="color:var(--yellow);font-family:'Space Grotesk';font-weight:700">${fmtPrice(b.prezzo)}</div>
                        <div class="meta">n° ${b.id}</div>
                    </div>
                </div>
            `;
        }).join("");
    } catch (e) {
        const el = document.getElementById("booking-list");
        if (el) el.innerHTML = `<p style="color:var(--magenta)">Errore: ${escapeHtml(e.message)}</p>`;
    }
}

// CHECKOUT (4 passi: Sommario → Pagamento → Elaborazione → Conferma)
async function renderCheckout() {
    if (!Auth.isLoggedIn()) { Router.go("/login?next=/checkout"); return; }
    SEO.set({ title: "Checkout", robots: "noindex, nofollow" });
    const raw = sessionStorage.getItem("checkout");
    if (!raw) { Router.go("/"); return; }
    const payload = JSON.parse(raw);

    const isAbb = payload.type === "abbonamento";
    const isFree = !isAbb && Number(payload.totale) === 0;
    let step = 1;

    // Verifica se l'utente ha un abbonamento attivo che copre l'acquisto
    let copertura = { coperta: false, tipo: null, ingressiResidui: 0, maxPostiPerEntrata: 2 };
    if (!isAbb) {
        try { copertura = await API.abbonamenti.copertura(payload.utenteId); } catch (_) {}
    }

    function goStep(n) {
        step = n;
        refreshBar();
        refreshPanel();
    }

    function refreshBar() {
        const labels = ["Sommario", "Pagamento", "Elaborazione", "Conferma"];
        document.getElementById("co-steps").innerHTML = `
            <div class="checkout-steps">
                ${labels.flatMap((label, i) => {
                    const n = i + 1;
                    const cls = n < step ? "done" : n === step ? "active" : "";
                    const dot = n < step ? "&#10003;" : String(n);
                    const parts = [
                        `<div class="checkout-step ${cls}" ${n === step ? 'aria-current="step"' : ''}><div class="checkout-step-dot">${dot}</div><span>${label}</span></div>`
                    ];
                    if (i < labels.length - 1) parts.push(`<div class="checkout-step-line"></div>`);
                    return parts;
                }).join("")}
            </div>
        `;
    }

    function refreshPanel() {
        const panel = document.getElementById("co-panel");
        switch (step) {
            case 1: panel.innerHTML = step1HTML(); attachStep1(); break;
            case 2: panel.innerHTML = step2HTML(); attachStep2(); break;
            case 3: panel.innerHTML = step3HTML(); runStep3();   break;
            case 4: panel.innerHTML = step4HTML(); sessionStorage.removeItem("checkout"); break;
        }
    }

    function step1HTML() {
        const dettagli = isAbb
            ? `<div class="checkout-summary-detail">Valido fino al 30 giugno 2027</div>`
            : `<div class="checkout-summary-detail">${fmtDateTime(payload.dataOra)} · ${escapeHtml(payload.sala)}</div>
               <div class="checkout-summary-detail" style="margin-top:0.3rem">Posti: <strong>${escapeHtml((payload.labels || []).join(", "))}</strong></div>`;

        const abbCovered = !isAbb && copertura.coperta;
        const coverBadge = abbCovered ? (() => {
            const ingressi = copertura.ingressiResidui === -1
                ? "Ingressi illimitati"
                : `${copertura.ingressiResidui} ingress${copertura.ingressiResidui === 1 ? "o" : "i"} residu${copertura.ingressiResidui === 1 ? "o" : "i"}`;
            const limPosti = copertura.maxPostiPerEntrata === 1
                ? "1 postazione per evento"
                : `Max ${copertura.maxPostiPerEntrata} postazioni per evento`;
            return `
            <div class="checkout-abb-cover">
                <div class="checkout-abb-cover-badge">✓ Abbonamento ${escapeHtml(copertura.tipo)}</div>
                <div class="checkout-abb-cover-sub">${ingressi} · ${limPosti}</div>
            </div>
            `;
        })() : "";

        const totaleHTML = abbCovered
            ? `<strong class="checkout-total-covered">Incluso nell'abbonamento</strong>`
            : `<strong>€ ${isAbb ? escapeHtml(payload.prezzo).replace("€ ", "") : payload.totale}</strong>`;

        return `
            <h3 class="checkout-step-title">Riepilogo ordine</h3>
            <div class="checkout-summary">
                <div class="checkout-summary-label">${isAbb ? "Abbonamento" : "Spettacolo"}</div>
                <div class="checkout-summary-value">${isAbb ? escapeHtml(payload.nome) : escapeHtml(payload.spettacolo)}</div>
                ${dettagli}
            </div>
            ${coverBadge}
            <div class="checkout-total">
                <span>Totale</span>
                ${totaleHTML}
            </div>
            <button id="co-s1-next" class="btn ${abbCovered || isFree ? "btn-gold" : "btn-magenta"}" style="width:100%">
                ${abbCovered || isFree ? "Conferma accesso →" : "Procedi al pagamento →"}
            </button>
            <p id="co-s1-error" aria-live="polite" style="color:var(--magenta);margin-top:1rem;text-align:center;display:none"></p>
        `;
    }

    function step2HTML() {
        return `
            <h3 class="checkout-step-title">Dati di pagamento</h3>
            <p class="checkout-note">Simulazione — nessun addebito reale verrà effettuato.</p>
            <form id="co-s2-form" class="payment-form" novalidate>
                <label class="payment-label">Numero carta
                    <input type="text" name="numero" placeholder="1234 5678 9012 3456"
                           maxlength="19" inputmode="numeric" autocomplete="cc-number">
                </label>
                <label class="payment-label">Intestatario
                    <input type="text" name="intestatario" placeholder="Nome Cognome"
                           autocomplete="cc-name">
                </label>
                <div class="payment-row">
                    <label class="payment-label">Scadenza
                        <input type="text" name="scadenza" placeholder="MM/AA"
                               maxlength="5" inputmode="numeric" autocomplete="cc-exp">
                    </label>
                    <label class="payment-label">CVV
                        <input type="text" name="cvv" placeholder="123"
                               maxlength="4" inputmode="numeric" autocomplete="cc-csc">
                    </label>
                </div>
                <div id="payment-error" class="payment-error" role="alert" hidden></div>
                <div class="payment-actions">
                    <button type="button" id="co-s2-back" class="btn btn-outline">← Indietro</button>
                    <button type="submit" class="btn btn-magenta">Paga ora →</button>
                </div>
            </form>
        `;
    }

    function step3HTML() {
        return `
            <div style="text-align:center;padding:2.5rem 0" aria-live="polite" aria-atomic="true">
                <div class="checkout-spinner"></div>
                <p style="color:var(--text);font-weight:600;margin-top:1.2rem">Elaborazione in corso…</p>
                <p style="color:var(--text-dim);font-size:0.88rem;margin-top:0.5rem">Stiamo confermando il tuo ordine.</p>
            </div>
        `;
    }

    function step4HTML() {
        const count = isAbb ? 0 : (payload.postoIds || []).length;
        return `
            <div style="text-align:center;padding:0.5rem 0">
                <div class="checkout-confirm-icon">&#10003;</div>
                <h3 class="checkout-confirm-title">${isAbb ? "Abbonamento attivato!" : "Prenotazione confermata!"}</h3>
                <p class="checkout-confirm-sub">
                    ${isAbb
                        ? `Il tuo abbonamento <strong>${escapeHtml(payload.nome)}</strong> è attivo fino al 30 giugno 2027.`
                        : `${count} ${count !== 1 ? "posti riservati" : "posto riservato"} per <strong>${escapeHtml(payload.spettacolo)}</strong>.`
                    }
                </p>
                <p class="checkout-email-note">
                    Riceverai una conferma via email a <strong>${escapeHtml(Auth.current().email)}</strong>.
                </p>
                <div class="checkout-confirm-actions">
                    <a class="btn btn-magenta" href="#/profilo">Vai al profilo →</a>
                    <a class="btn btn-gold" href="#/catalogo">Esplora la stagione</a>
                </div>
            </div>
        `;
    }

    function attachStep1() {
        document.getElementById("co-s1-next").addEventListener("click", () => {
            if (isAbb && payload.tipo === "UNDER25") {
                const u = Auth.current();
                if (u && u.dataNascita) {
                    const nato = new Date(u.dataNascita);
                    const oggi = new Date();
                    let eta = oggi.getFullYear() - nato.getFullYear();
                    if (oggi.getMonth() < nato.getMonth() ||
                        (oggi.getMonth() === nato.getMonth() && oggi.getDate() < nato.getDate())) eta--;
                    if (eta >= 25) {
                        const err = document.getElementById("co-s1-error");
                        if (err) { err.textContent = `Non hai i requisiti per l'abbonamento Under 25 (età rilevata: ${eta} anni).`; err.style.display = ""; }
                        return;
                    }
                }
            }
            goStep(!isAbb && copertura.coperta || isFree ? 3 : 2);
        });
    }

    function attachStep2() {
        document.getElementById("co-s2-back").addEventListener("click", () => goStep(1));

        const numEl  = document.querySelector('[name="numero"]');
        const nomeEl = document.querySelector('[name="intestatario"]');
        const scadEl = document.querySelector('[name="scadenza"]');
        const cvvEl  = document.querySelector('[name="cvv"]');

        // Numero carta: solo cifre, spazio ogni 4
        numEl.addEventListener("input", () => {
            const d = numEl.value.replace(/\D/g, "").slice(0, 16);
            numEl.value = d.replace(/(.{4})/g, "$1 ").trimEnd();
        });

        // Intestatario: solo lettere e spazi
        nomeEl.addEventListener("input", () => {
            nomeEl.value = nomeEl.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
        });

        // Scadenza: auto MM/AA
        scadEl.addEventListener("input", () => {
            let d = scadEl.value.replace(/\D/g, "").slice(0, 4);
            if (d.length > 2) d = d.slice(0, 2) + "/" + d.slice(2);
            scadEl.value = d;
        });

        // CVV: solo cifre
        cvvEl.addEventListener("input", () => {
            cvvEl.value = cvvEl.value.replace(/\D/g, "").slice(0, 4);
        });

        function showError(msg) {
            const el = document.getElementById("payment-error");
            el.textContent = msg;
            el.hidden = false;
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        document.getElementById("co-s2-form").addEventListener("submit", e => {
            e.preventDefault();
            const digits = numEl.value.replace(/\s/g, "");
            const month  = parseInt((scadEl.value.split("/")[0] || "0"), 10);

            if (digits.length !== 16)           { showError("Il numero carta deve essere di 16 cifre."); return; }
            if (!nomeEl.value.trim())            { showError("Inserisci il nome dell'intestatario."); return; }
            if (scadEl.value.length < 5 || month < 1 || month > 12)
                                                 { showError("Scadenza non valida — usa il formato MM/AA."); return; }
            if (cvvEl.value.length < 3)          { showError("Il CVV deve essere di 3 o 4 cifre."); return; }

            document.getElementById("payment-error").hidden = true;
            goStep(3);
        });
    }

    async function runStep3() {
        try {
            await Promise.all([
                makeApiCall(),
                new Promise(res => setTimeout(res, 1500))
            ]);
            A11y.announce(isAbb ? "Abbonamento attivato con successo." : "Prenotazione confermata con successo.");
            goStep(4);
        } catch (e) {
            const msg = e.message || "Errore imprevisto. Riprova più tardi.";
            A11y.announce("Errore: " + msg);
            sessionStorage.removeItem("checkout");
            const panel = document.getElementById("co-panel");
            if (panel) panel.innerHTML = `
                <p style="color:var(--magenta);text-align:center;margin-bottom:1.5rem">
                    ✗ ${escapeHtml(msg)}
                </p>
                <div style="text-align:center">
                    <a class="btn btn-outline" href="#/">Torna alla home</a>
                </div>
            `;
        }
    }

    async function makeApiCall() {
        const user = Auth.current();
        if (isAbb) {
            return API.abbonamenti.acquista({ utenteId: user.id, tipo: payload.tipo });
        }
        return API.prenotazioni.creaBatch({
            utenteId: user.id, replicaId: payload.replicaId, postoIds: payload.postoIds
        });
    }

    root().innerHTML = `
        <section class="checkout-view">
            <h2 class="checkout-title">Checkout</h2>
            <div id="co-steps"></div>
            <div id="co-panel" class="checkout-panel"></div>
        </section>
    `;
    goStep(1);
}

window.Views = { renderHome, renderCatalogo, renderDettaglio, renderSeats, renderLogin, renderRegister, renderProfile, renderAbbonamenti, renderCheckout };
