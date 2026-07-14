# pw22-fe

Frontend del **Nuovo Cinema Teatro Eliseo di Poggiomarino** — elaborato finale PW 22, CdS Informatica per le Aziende Digitali (L-31).

## Stack

- HTML5 · CSS3 · JavaScript ES6+ (vanilla, nessun framework)
- Google Fonts: Oswald + Space Grotesk
- SPA con hash router custom

## Avvio locale

```bash
python -m http.server 5500
```

Aprire `http://localhost:5500`. Il backend deve essere in esecuzione su `http://localhost:8080`.

## Struttura

```
css/
└── style.css       # palette, tipografia, componenti
js/
├── app.js          # router e inizializzazione
├── views.js        # rendering delle 9 viste
├── api.js          # client HTTP verso il backend
├── auth.js         # gestione sessione utente
├── router.js       # hash router
├── seo.js          # JSON-LD, Open Graph, meta tag
└── a11y.js         # accessibilità: focus, aria-live, tastiera
index.html          # shell SPA
```

## Viste

| Route | Vista |
|-------|-------|
| `/` | Home |
| `/catalogo` | Catalogo spettacoli |
| `/spettacolo/:id` | Dettaglio spettacolo |
| `/prenota/:replicaId` | Selezione posti |
| `/checkout` | Riepilogo e conferma |
| `/abbonamenti` | Acquisto abbonamento |
| `/login` | Accesso |
| `/registrazione` | Registrazione |
| `/profilo` | Profilo utente |

## Identità visiva

Palette anni '70 rielaborata in chiave contemporanea: senape `#DA8413`, copper `#A22A0F`, crema, marrone scuro. Tipografia Oswald (titoli) + Space Grotesk (corpo). Bottoni geometrici inclinati (`skewX(-8deg)`), card con ombra solida al passaggio del mouse.
