# Review del progetto — codice, UX/UI, accessibilità

Data: 2026-11-03. Basata sulla lettura del codice (server, `orders.js`, `public/*`, CSS). I 48 test (`node --test tests/*.test.js`) passano. Non è stata fatta una verifica visiva nel browser: i punti UX/a11y vanno confermati a vista.

Legenda priorità: **P0** critico, **P1** importante, **P2** miglioramento.

## 1. Codice

| # | Pri | Problema | Dove | Azione |
|---|-----|----------|------|--------|
| C2 | P0 | `JSON.parse` senza try/catch su localStorage: un valore corrotto blocca l'avvio e la pagina resta vuota. | `public/favorites.js` (`readFavoriteIds`), `public/cart-logic.js` (`restoreCart`) | try/catch con fallback a `[]`; adeguare i test che si aspettano l'eccezione. |
| C3 | P1 | Nomi/descrizioni prodotto in `innerHTML` senza escape; `escapeHtml` duplicata in due file con comportamenti diversi. | `app.js`, `product-detail.js`, `favorites.js`, `look-scene.js`, `payment-ui.js`, `frame-configurator.js` | Unica utility condivisa (es. `public/html.js`) usata ovunque. |
| C4 | P1 | `app.js` monolite (837 righe): stato globale, routing a catena di `if`, render che riscrive tutto e ri-aggancia i listener. Blocco "nascondi pannelli" ripetuto 5 volte. | `public/app.js` | Router semplice (mappa path → render) e `resetChrome()`; un modulo per pagina. |
| C5 | P1 | Pannello carrello laterale mai visibile (`cartPanel.hidden = true` in tutti i rami): `renderCart`, `#cart-items`, riga sconto sono quasi codice morto. | `app.js`, `index.html` | Decidere: rimuoverlo o mostrarlo davvero. |
| C6 | P1 | Duplicazioni: listener `+`/`−`/rimuovi in `renderCart` e `renderCartPage`; markup riga carrello in `app.js` e `payment-ui.js`; `openProduct` e handler `.product-detail-button`. | `app.js`, `payment-ui.js` | Estrarre helper/componente unico. |
| C7 | P1 | `state.paymentErrors` contiene anche dati dell'ordine confermato e `request`. | `app.js` (`showOrderConfirmation`), `payment-ui.js` | Introdurre `state.confirmedOrder` e `state.requestError`. |
| C8 | P1 | Server: fallback a `index.html` per ogni 404 (anche `/api/*` e asset mancanti); nessun `Cache-Control`/gzip/header di sicurezza; `catalog-logic.js` servito da route speciale fuori da `public/`. | `server.js` | 404 reali per `/api/*` e asset; header (`X-Content-Type-Options`, CSP); sistemare la posizione dei moduli condivisi. |
| C9 | P2 | Cache busting manuale (`?v=...`) solo su alcuni import: cache incoerente. | `index.html`, `app.js`, moduli | Versione unica o rimuovere e usare ETag. |
| C10 | P2 | Prezzi come numeri con `Math.round(price * 100)` sparsi. | `app.js`, `payment-ui.js`, `orders.js` | Salvare i centesimi alla fonte (`priceCents`). |
| C11 | P2 | Test: nessuno per `server.js` né per l'UI; i `.feature` non sono eseguiti; cartella `features/features/` annidata per errore. | `tests/`, `features/` | Test del server (`/api/orders`, 404, path traversal); sistemare la cartella. |

## 2. UX/UI

| # | Pri | Problema | Azione |
|---|-----|----------|--------|
| U1 | P1 | Il form di pagamento si riscrive a ogni render: cambiando metodo si perdono i campi carta/CVV. | Conservare i valori in `state` o aggiornare solo la sezione carta. |
| U2 | P1 | Nessun feedback durante l'invio ordine (solo un flag). | Pulsante disabilitato con "Invio in corso…". |
| U3 | P1 | Immagini: 18 JPG da 2–3 MB (~47 MB), senza `loading="lazy"`, `width`/`height`, né varianti ridimensionate. | WebP/AVIF, `srcset`, `loading="lazy"`, dimensioni esplicite. |
| U4 | P1 | "Aggiungi" è un toggle: un secondo clic rimuove dal carrello. Poco prevedibile. | Valutare "Aggiungi" + controllo quantità, o un'etichetta chiara "Rimuovi". |
| U5 | P2 | Pagina pagamento con due pulsanti "indietro" dello stesso peso visivo. | Un solo link secondario. |
| U6 | P2 | "Indietro" ambiguo in carrello, scheda prodotto, preferiti. | Etichette che dicono la destinazione. |
| U7 | P2 | Coupon nascosto nell'header, da copiare e incollare altrove. | Applicazione con un clic o campo nel carrello. |
| U8 | P2 | Ricerca senza debounce; messaggio "nessun prodotto" usa classe `empty-cart`. | Debounce ~200 ms. |
| U9 | P2 | Logo non cliccabile; poca navigazione globale. | Logo come link a `/scopri`, nav coerente. |
| U10 | P2 | Cuore preferiti con `!important` e stili inline. | Risolvere con CSS pulito. |
| U11 | P2 | Google Fonts da CDN esterno (privacy/GDPR). | Font self-hosted. |
| U12 | P2 | Hotspot "Compra il look" posizionati a percentuale: verificare su schermi stretti. | Test manuale su mobile. |

## 3. Accessibilità

| # | Pri | Problema | Azione |
|---|-----|----------|--------|
| A1 | P0 | Il focus si perde a ogni render (`innerHTML`): dopo Aggiungi, filtri, `+`/`−`, frecce galleria il focus torna su `body`. | Aggiornare il DOM in modo mirato o ripristinare il focus sull'elemento equivalente. |
| A2 | P0 | Navigazione client-side senza annuncio: `document.title` fisso, focus non spostato sull'`h1`, schede prodotto senza URL (il tasto Indietro del browser non funziona). | Aggiornare titolo, spostare il focus sull'`h1`, usare history/URL per la scheda. |
| A3 | P1 | `aria-live="polite"` su `#product-list`: rilegge l'intero elenco a ogni tasto nella ricerca. | Live region separata ("12 prodotti trovati"). |
| A4 | P1 | Errori form non collegati ai campi (`aria-describedby`/`aria-invalid` solo in parte); nessun riepilogo errori né focus sul primo campo errato. | Completare i collegamenti, spostare il focus al submit fallito. |
| A5 | P1 | `<button>` contenente `div`/`h3`/`p` (card prodotto): contenuto non valido. | Titolo come link `<a>`, card cliccabile via pseudo-elemento. |
| A6 | P1 | Struttura: `h3` senza `h2`, `h2` duplicato "Pagamento", nessun `<nav>`/`<footer>`, nessuno skip link. | Sistemare gerarchia e landmark, aggiungere skip link. |
| A7 | P2 | Carrello: "Rimuovi" senza nome del prodotto; quantità non annunciata dopo `+`/`−`. | `aria-label` con nome, live region per la quantità. |
| A8 | P2 | Galleria: nessun annuncio del cambio foto; niente navigazione da tastiera con frecce. | Live region "Foto 2 di 4", gestione tasti. |
| A9 | P2 | Contrasto: `--muted #6B675F` su `#F3F1EC` è al limite AA (~4,8:1); verificare errori `#b42318`. | Misurare con uno strumento e correggere. |
| A10 | P2 | CVV `type="password"` senza necessità; coupon con label e placeholder identici; niente `prefers-reduced-motion`. | Correggere. |

Già bene: `lang="it"`, label associate, `aria-pressed` sui toggle, `role="alert"` sugli errori, `autocomplete` corretti, `:focus-visible` con outline di 3 px, `alt` descrittivi sulla galleria e `alt=""` sulle decorative.

## Ordine di lavoro consigliato

1. C2 (robustezza all'avvio).
2. A1, A2 (focus e navigazione), che toccano la struttura di `app.js`: farli insieme a C4.
3. U3 (immagini).
4. C3, C6, C7 (escape condiviso, duplicazioni, stato).
5. A4–A6, U1, U2.
6. Il resto (P2).
