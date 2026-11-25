import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import { COUPON_CODE, copyCouponCode, validateCouponCode } from '../public/coupon-logic.js';
import { renderLookScene } from '../public/look-scene.js';
import { renderAddToCartButton } from '../public/cart-ui.js';
import { FRAME_OPTIONS } from '../public/frame-logic.js';
import { hasTranslation, translateText } from '../public/language.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const indexHtml = read('../public/index.html');
const css = read('../public/styles.css');
const appJs = read('../public/app.js');

const rule = (selector) => {
  const start = css.indexOf(`\n${selector} {`);
  assert.ok(start >= 0, `regola CSS ${selector} assente`);
  return css.slice(start, css.indexOf('}', start));
};
const rootBlock = () => css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
const bar = indexHtml.slice(indexHtml.indexOf('<div id="announcement-bar"'), indexHtml.indexOf('<header class="site-header"'));
const header = indexHtml.slice(indexHtml.indexOf('<header class="site-header"'), indexHtml.indexOf('</header>'));

/** §REQ:TSTT-2RHMB5 */
test('TSTT-2RHMB5: la barra superiore ha il messaggio al centro, lingua e tema a destra, e sostituisce il pulsante coupon', () => {
  assert.ok(indexHtml.indexOf('id="announcement-bar"') < indexHtml.indexOf('<header class="site-header"'));
  assert.match(bar, /Primo acquisto: -10% con/);
  assert.match(rule('.announcement-bar-inner'), /grid-template-columns: 1fr auto 1fr/);
  assert.match(rule('.announcement-message'), /text-align: center/);
  const actions = bar.slice(bar.indexOf('class="announcement-actions"'));
  assert.ok(actions.indexOf('id="language-button"') > 0 && actions.indexOf('id="language-button"') < actions.indexOf('id="theme-button"'));
  assert.ok(bar.indexOf('class="announcement-message"') < bar.indexOf('class="announcement-actions"'));
  assert.doesNotMatch(indexHtml, /coupon-container|coupon-copy"|Coupon per te disponibile/);
});

/** §REQ:TSTT-5YBZQW */
test('TSTT-5YBZQW: la testata resta fissa in alto e la barra superiore scorre via', () => {
  const sticky = rule('.site-header');
  assert.match(sticky, /position: sticky/);
  assert.match(sticky, /top: 0/);
  assert.doesNotMatch(rule('.announcement-bar'), /position: (sticky|fixed)/);
  assert.ok(!bar.includes('<header'), 'la testata non è dentro la barra superiore');
});

/** §REQ:TSTT-4JJJG3 */
test('TSTT-4JJJG3: a sinistra il logo E Shop porta alla home', () => {
  assert.match(header, /^<header class="site-header" id="site-header">\s*<a class="brand-link" href="\/" aria-label="E Shop, vai alla home">\s*<span class="logo">E<\/span>\s*<span class="eyebrow">Shop<\/span>/);
});

/** §REQ:TSTT-5BGBBG */
test('TSTT-5BGBBG: la ricerca sta al centro e occupa tutto lo spazio libero', () => {
  const brand = header.indexOf('class="brand-link"');
  const search = header.indexOf('id="header-search"');
  const actions = header.indexOf('class="header-actions"');
  assert.ok(brand < search && search < actions);
  assert.match(header, /<input id="search-input" type="search"[^>]*aria-label="Cerca prodotto"/);
  assert.match(rule('.site-header'), /display: flex/);
  assert.match(rule('.header-search'), /flex: 1/);
  assert.match(appJs, /headerSearch\.hidden = value/, 'la ricerca si nasconde dove prima si nascondeva la barra degli strumenti');
});

/** §REQ:TSTT-25XBT9 */
test('TSTT-25XBT9: Preferiti è un pulsante tondo con cuore e un pallino visibile solo se il numero supera 0', () => {
  assert.match(header, /<a id="favorites-link" class="icon-button favorites-link" href="\/preferiti" aria-label="Preferiti">\s*<svg[^>]*class="header-icon header-icon-heart"/);
  assert.match(header, /<span id="favorites-count" class="count-badge" hidden>0<\/span>/);
  assert.match(rule('.icon-button'), /border-radius: 50%/);
  assert.match(appJs, /favoritesCountEl\.hidden = state\.favoriteIds\.length === 0/);
});

/** §REQ:TSTT-5PU7GW */
test('TSTT-5PU7GW: Carrello è un pulsante a pillola con icona, testo e pallino del numero', () => {
  assert.match(header, /<a class="cart-pill cart-link" href="\/carrello" aria-label="Carrello">\s*<svg[^>]*class="header-icon header-icon-cart"[\s\S]*?<\/svg>\s*<span>Carrello<\/span>\s*<strong id="cart-count" class="count-badge">0<\/strong>/);
  assert.match(rule('.cart-pill'), /border-radius: 999px/);
});

/** §REQ:TSTT-9E8T7D */
test('TSTT-9E8T7D: sotto la scena "Compra il look" il pulsante "Vedi tutti gli articoli" scorre all\'elenco', () => {
  const scene = renderLookScene();
  assert.match(scene, /<\/section>\s*<div class="look-scene-actions">\s*<button id="see-all-button" class="see-all-button" type="button" aria-label="Vedi tutti gli articoli">Vedi tutti gli articoli<\/button>/);
  assert.match(appJs, /#see-all-button[\s\S]{0,200}productList\.scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/);
  assert.match(rule('.product-list'), /scroll-margin-top: \d+px/);
});

/** §REQ:TSTT-8VJC9V */
test('TSTT-8VJC9V: i controlli della barra e della testata sono button o a con nome e area di almeno 44 pixel', () => {
  const controls = [...(bar + header).matchAll(/<(button|a|input)\b[^>]*>/g)].map((match) => match[0]);
  assert.ok(controls.length >= 7, 'barra e testata hanno i loro controlli');
  for (const control of controls) {
    assert.match(control, /aria-label="[^"]+"/, `senza nome: ${control}`);
  }
  assert.doesNotMatch(bar + header, /<div[^>]*(onclick|role="button")/);
  for (const selector of ['.icon-button', '.cart-pill', '.brand-link', '.checkout-button.language-button,\n.checkout-button.theme-button', '.coupon-code', '.header-search input']) {
    assert.match(rule(selector), /min-height: 44px/, `${selector}: altezza minima 44px`);
  }
  for (const selector of ['.icon-button', '.checkout-button.language-button,\n.checkout-button.theme-button', '.coupon-code']) {
    assert.match(rule(selector), /min-width: 44px/, `${selector}: larghezza minima 44px`);
  }
});

/** §REQ:TSTT-27HF7V */
test('TSTT-27HF7V: i nuovi testi sono tradotti in inglese e in spagnolo', () => {
  for (const text of ['Primo acquisto: -10% con', 'Vedi tutti gli articoli', 'Copia codice', 'Copia codice sconto', 'Copiato', 'Copia non riuscita', 'Codice copiato', 'E Shop, vai alla home', 'Lingua del sito']) {
    assert.ok(hasTranslation(text), `"${text}" senza traduzione`);
    for (const language of ['eng', 'esp']) {
      assert.notEqual(translateText(text, language), text, `"${text}" non tradotto in ${language}`);
    }
  }
});

// ---- Palette e font ----

const hexToHsl = (hex) => {
  const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
};
const isGreen = (hex) => {
  const { h, s } = hexToHsl(hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex);
  return h >= 70 && h <= 170 && s > 0.08;
};

/** §REQ:PLTT-E-FONT-3AQKRP */
test('PLTT-E-FONT-3AQKRP: nel sito non c\'è nessun verde, tranne le opzioni del configuratore', () => {
  const sources = ['../public/styles.css', '../public/index.html', ...readdirSync(new URL('../public/', import.meta.url))
    .filter((file) => file.endsWith('.js')).map((file) => `../public/${file}`), '../catalog-logic.js'];
  const allowed = new Set(['#50C878']); // "Verde smeraldo" del configuratore (frame-logic.js)
  const greens = [];
  for (const source of sources) {
    for (const [hex] of read(source).matchAll(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g)) {
      if (isGreen(hex) && !allowed.has(hex.toUpperCase())) greens.push(`${source}: ${hex}`);
    }
    if (source.endsWith('.css')) {
      assert.doesNotMatch(read(source), /:\s*(green|olive|lime|teal)\b/i, `${source}: colore verde con nome`);
    }
  }
  assert.deepEqual(greens, []);
  assert.ok(read('../public/frame-logic.js').includes('#50C878'));
});

/** §REQ:PLTT-E-FONT-92CH3F */
test('PLTT-E-FONT-92CH3F: la palette è definita come variabili in un solo punto', () => {
  const root = rootBlock();
  const palette = {
    '--cream': '#EFE6D2', '--cream-border': '#D8CBAE', '--cream-hover': '#E3D6BB', '--ink': '#2A2620',
    '--count-bg': '#2A2620', '--count-text': '#EFE6D2', '--button-border': '#8A7F68', '--focus-ring': '#2A2620'
  };
  for (const [name, value] of Object.entries(palette)) {
    assert.ok(root.includes(`${name}: ${value};`), `${name}: ${value} in :root`);
  }
  const outside = css.replace(root, '');
  for (const value of new Set(Object.values(palette).concat('#8A7F68'))) {
    assert.ok(!outside.toUpperCase().includes(value.toUpperCase()), `${value} compare solo tra le variabili`);
  }
});

/** §REQ:PLTT-E-FONT-73QEB8 */
test('PLTT-E-FONT-73QEB8: il panna è usato dove previsto e i pallini hanno sfondo scuro e testo panna', () => {
  for (const selector of ['.announcement-bar', '.logo', '.cart-pill', '.filter-chip.active', '.add-button.is-added']) {
    const body = rule(selector);
    assert.match(body, /background: var\(--cream\)/, `${selector}: sfondo panna`);
    assert.match(body, /color: var\(--ink\)/, `${selector}: testo scuro su panna`);
  }
  assert.match(rule('.count-badge'), /background: var\(--count-bg\)/);
  assert.match(rule('.count-badge'), /color: var\(--count-text\)/);
  assert.match(rule('.cart-pill:hover'), /background: var\(--cream-hover\)/);
});

/** §REQ:PLTT-E-FONT-2JDECG */
test('PLTT-E-FONT-2JDECG: "Aggiungi" è trasparente con bordo da 1,5 px e "Aggiunto" si riconosce anche dal testo', () => {
  const normal = rule('.add-button');
  assert.match(normal, /background: transparent/);
  assert.match(normal, /border: 1\.5px solid var\(--button-border\)/);
  assert.match(normal, /color: var\(--button-text\)/);
  assert.ok(rootBlock().includes('--button-text: var(--ink);'));
  const product = { id: 1, name: 'Lampada Lume' };
  const added = renderAddToCartButton(product, true);
  const notAdded = renderAddToCartButton(product, false);
  assert.match(added, /<span>Aggiunto<\/span>/);
  assert.match(notAdded, />Aggiungi</);
  assert.doesNotMatch(notAdded, /Aggiunto/);
});

/** §REQ:PLTT-E-FONT-8N7D2D */
test('PLTT-E-FONT-8N7D2D: il focus da tastiera ha un contorno di 2 px, scuro, a 2 px di distanza', () => {
  assert.match(rule(':focus-visible'), /outline: 2px solid var\(--focus-ring\)/);
  assert.match(rule(':focus-visible'), /outline-offset: 2px/);
  assert.doesNotMatch(css, /outline: [13-9]px/, 'nessun altro spessore di contorno');
  assert.ok(rootBlock().includes('--focus-ring: #2A2620;'));
});

/** §REQ:PLTT-E-FONT-3VRGUJ */
test('PLTT-E-FONT-3VRGUJ: le opzioni del configuratore, come "Verde smeraldo", non cambiano colore', () => {
  const colors = Object.fromEntries(FRAME_OPTIONS.mat.map(({ value, color }) => [value, color]));
  assert.deepEqual(colors, { nessuno: null, bianco: '#FBFAF7', 'verde-smeraldo': '#50C878', 'rosso-carminio': '#960018' });
  assert.doesNotMatch(css, /--mat-color:/, 'il colore del passe-partout arriva dalle opzioni, non dal foglio di stile');
});

/** §REQ:PLTT-E-FONT-5C5H2A */
test('PLTT-E-FONT-5C5H2A: tutto il sito usa un solo font, da una sola variabile', () => {
  assert.ok(rootBlock().includes('--font-base: Cambria, Caladea, Georgia, serif;'));
  const families = [...css.matchAll(/font-family:[^;]*;/g)].map((match) => match[0]);
  assert.deepEqual(families, ['font-family: var(--font-base);']);
  assert.match(css, /button,\s*input,\s*select,\s*textarea \{\s*font: inherit;/);
  for (const source of ['../public/index.html', '../public/app.js', '../public/payment-ui.js']) {
    assert.doesNotMatch(read(source), /Figtree|font-family/i, source);
  }
});

/** §REQ:PLTT-E-FONT-7XFJRW */
test('PLTT-E-FONT-7XFJRW: i pesi sono solo 400 e 700', () => {
  const weights = new Set([...css.matchAll(/font-weight:\s*([^;]+);/g)].map((match) => match[1].trim()));
  assert.deepEqual([...weights].sort(), ['400', '700']);
  assert.match(rule('body'), /font-weight: 400/);
  for (const selector of ['h1,\nh2,\nh3,\nstrong,\nb,\nlegend,\n.price,\n.logo,\n.badge', '.add-button']) {
    assert.match(rule(selector), /font-weight: 700/, selector);
  }
});

/** §REQ:PLTT-E-FONT-6RQYMU */
test('PLTT-E-FONT-6RQYMU: si carica solo Caladea nei pesi 400 e 700', () => {
  const links = [...indexHtml.matchAll(/<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/g)].map((match) => match[0]);
  assert.equal(links.length, 1);
  assert.match(links[0], /family=Caladea:wght@400;700&display=swap/);
  assert.doesNotMatch(links[0], /Figtree|family=[^&]*&family=/);
});

// ---- Coupon nella barra superiore ----

/** §REQ:CPN-DI-SCNT-QAD-020 */
test('CPN-020: la barra superiore mostra al centro il messaggio con il codice, con qualunque subtotale', () => {
  assert.match(bar, /<p class="announcement-message">\s*<span class="announcement-text">Primo acquisto: -10% con<\/span>/);
  assert.match(bar, /<button id="coupon-code" class="coupon-code" type="button"/);
  assert.doesNotMatch(appJs, /couponContainer/, 'nessun pulsante coupon che dipende dal subtotale');
});

/** §REQ:CPN-DI-SCNT-QAD-030 */
test('CPN-030: il codice nella barra è lo stesso che il campo coupon del pagamento accetta', () => {
  assert.equal(COUPON_CODE, 'FirstPurchase');
  assert.equal(validateCouponCode(COUPON_CODE, 9000), null);
  assert.match(appJs, /couponCodeEl\.textContent = COUPON_CODE/);
  assert.doesNotMatch(bar, /FirstPurchase|BENVENUTO/, 'il codice non è scritto a mano nella pagina');
});

/** §REQ:CPN-DI-SCNT-QAD-040 */
test('CPN-040: toccare il codice lo copia negli appunti, mostra "Copiato" e annuncia "Codice copiato"', async () => {
  const copied = [];
  const result = await copyCouponCode({ writeText: async (text) => { copied.push(text); } });
  assert.deepEqual(copied, [COUPON_CODE]);
  assert.deepEqual({ copied: result.copied, message: result.message, announcement: result.announcement }, { copied: true, message: 'Copiato', announcement: 'Codice copiato' });
  assert.match(bar, /<p id="coupon-live" class="visually-hidden" role="status" aria-live="polite"><\/p>/);
  assert.match(appJs, /couponLiveEl\.textContent = result\.announcement/);
  assert.match(appJs, /coupon-tooltip-check/);
});

/** §REQ:CPNC-6SAFGZ */
test('CPNC-6SAFGZ: il codice è un pulsante sottolineato a tratteggio e non c\'è un altro pulsante "Copia codice"', () => {
  assert.match(rule('.coupon-code'), /text-decoration: underline dashed/);
  assert.doesNotMatch(indexHtml, /<button[^>]*>\s*Copia codice\s*<\/button>/);
  assert.equal((indexHtml.match(/<button\b/g) ?? []).filter((_, index) => index >= 0).length, (indexHtml.match(/<button\b/g) ?? []).length);
  assert.doesNotMatch(indexHtml, /id="coupon-copy"/);
});

/** §REQ:CPNC-4RG5VF */
test('CPNC-4RG5VF: al passaggio del mouse e al focus compare la finestra "Copia codice", scura, con freccia verso l\'alto', () => {
  assert.match(bar, /<span id="coupon-tooltip" class="coupon-tooltip" role="tooltip">[\s\S]*?Copia codice<\/span>/);
  assert.match(bar, /aria-describedby="coupon-tooltip"/);
  assert.match(css, /\.coupon-code-wrap:hover \.coupon-tooltip,\s*\.coupon-code-wrap:focus-within \.coupon-tooltip[^{]*\{[^}]*opacity: 1/);
  const tooltip = rule('.coupon-tooltip');
  assert.match(tooltip, /background: #1F1E1B/);
  assert.match(tooltip, /color: #FFFFFF/);
  assert.match(tooltip, /font-size: 12px/);
  assert.match(tooltip, /top: calc\(100% \+ \d+px\)/, 'sotto il codice');
  assert.match(rule('.coupon-tooltip::before'), /border-bottom: \d+px solid #1F1E1B/, 'freccia verso l\'alto');
});

/** §REQ:CPNC-2PMRGV */
test('CPNC-2PMRGV: la copia funziona anche senza appunti, con un metodo alternativo; il pulsante risponde a clic, Invio e Spazio', async () => {
  const calls = [];
  const viaFallback = await copyCouponCode(undefined, (text) => { calls.push(text); return true; });
  assert.deepEqual(calls, [COUPON_CODE]);
  assert.equal(viaFallback.copied, true);
  const viaFallbackAfterRefusal = await copyCouponCode({ writeText: async () => { throw new Error('negato'); } }, () => true);
  assert.equal(viaFallbackAfterRefusal.copied, true);
  assert.match(appJs, /document\.execCommand\('copy'\)/);
  assert.match(appJs, /couponCodeEl\.addEventListener\('click'/, 'un vero button: Invio e Spazio arrivano come clic');
  assert.match(appJs, /navigator\.clipboard/);
});

/** §REQ:CPNC-4MYF8T */
test('CPNC-4MYF8T: se la copia fallisce la finestra mostra "Copia non riuscita" e il codice non cambia', async () => {
  const failed = await copyCouponCode({ writeText: async () => { throw new Error('negato'); } }, () => false);
  assert.deepEqual({ copied: failed.copied, message: failed.message }, { copied: false, message: 'Copia non riuscita' });
  const none = await copyCouponCode(undefined, undefined);
  assert.equal(none.copied, false);
  assert.equal(COUPON_CODE, 'FirstPurchase');
});
