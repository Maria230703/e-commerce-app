import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  getNextTheme,
  getThemeToggleLabel,
  readTheme,
  renderThemeIconMarkup,
  saveTheme
} from '../public/theme.js';
import { hasTranslation } from '../public/language.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const indexHtml = read('../public/index.html');
const css = read('../public/styles.css');
const appJs = read('../public/app.js');
const themeJs = read('../public/theme.js');

const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); }
  };
};
const cssRule = (selector) => {
  const start = css.indexOf(`\n${selector} {`);
  assert.ok(start >= 0, `regola CSS ${selector} assente`);
  return css.slice(start, css.indexOf('}', start));
};
const darkBlock = () => cssRule('html[data-theme="dark"]');
const variable = (block, name) => {
  const match = block.match(new RegExp(`${name}: (#[0-9A-Fa-f]{6})`));
  assert.ok(match, `variabile ${name} assente`);
  return match[1];
};
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/** §REQ:MDLT-GRN-NTT-8TY6QK */
test('MDLT-8TY6QK: il pulsante giorno/notte sta a destra nella barra superiore, dopo la lingua, con area di almeno 44 pixel', () => {
  const bar = indexHtml.slice(indexHtml.indexOf('<div id="announcement-bar"'), indexHtml.indexOf('<header class="site-header"'));
  const actions = bar.slice(bar.indexOf('class="announcement-actions"'));
  assert.ok(actions.indexOf('id="language-button"') < actions.indexOf('id="theme-button"'), 'lingua, poi giorno/notte');
  assert.doesNotMatch(indexHtml, /id="theme-button"[^>]*hidden/, 'non è nascosto: compare in ogni pagina');
  assert.doesNotMatch(themeJs, /isLandingPage/, 'nessun limite alla sola landing page');
  const rule = cssRule('.checkout-button.language-button,\n.checkout-button.theme-button');
  assert.match(rule, /min-height: 44px/);
  assert.match(rule, /min-width: 44px/);
});

/** §REQ:MDLT-GRN-NTT-7QA35Y */
test('MDLT-7QA35Y: il pulsante giorno/notte usa i colori panna, senza verde, anche in modalità notte', () => {
  assert.match(indexHtml, /id="theme-button" class="checkout-button theme-button"/);
  const shared = css.slice(css.indexOf('.add-button,\n.checkout-button,\n.back-button {'));
  const sharedRule = shared.slice(0, shared.indexOf('}'));
  assert.match(sharedRule, /background: transparent/);
  assert.match(sharedRule, /border: 1\.5px solid var\(--button-border\)/);
  assert.match(cssRule('.checkout-button.language-button,\n.checkout-button.theme-button'), /color: var\(--ink\)/, 'icona scura sulla barra panna');
  assert.doesNotMatch(css, /--primary/, 'nessun colore primario verde');
});

/** §REQ:MDLT-GRN-NTT-72YRBW */
test('MDLT-72YRBW: in modalità giorno il pulsante mostra un sole stilizzato', () => {
  assert.equal(DEFAULT_THEME, 'light');
  const sun = renderThemeIconMarkup('light');
  assert.match(sun, /class="theme-icon theme-icon-sun"/);
  assert.match(sun, /<circle/);
  assert.equal((sun.match(/<line/g) ?? []).length, 8, 'disco con otto raggi');
  assert.match(sun, /stroke="currentColor"/);
  assert.doesNotMatch(sun, /theme-icon-moon/);
  assert.match(indexHtml, /id="theme-button"[^>]*>\s*<svg class="theme-icon theme-icon-sun"/, 'il sole è già nella pagina prima che parta il codice');
  assert.equal(getThemeToggleLabel('light'), 'Passa alla modalità notte');
});

/** §REQ:MDLT-GRN-NTT-9ANCZM */
test('MDLT-9ANCZM: toccando il pulsante il sito diventa scuro e leggibile, e il sole diventa uno spicchio di luna', () => {
  assert.equal(getNextTheme('light'), 'dark');
  const moon = renderThemeIconMarkup('dark');
  assert.match(moon, /class="theme-icon theme-icon-moon"/);
  assert.equal((moon.match(/<path/g) ?? []).length, 1, 'un solo spicchio');
  assert.doesNotMatch(moon, /<line|<circle|theme-icon-sun/);
  assert.match(moon, /fill="currentColor"/);
  assert.equal(getThemeToggleLabel('dark'), 'Passa alla modalità giorno');

  assert.match(themeJs, /doc\.documentElement\.dataset\.theme = theme/);
  assert.match(themeJs, /button\.innerHTML = renderThemeIconMarkup\(theme\)/);
  const dark = darkBlock();
  const [bg, panel, text, muted] = ['--bg', '--panel', '--text', '--muted'].map((name) => variable(dark, name));
  assert.ok(luminance(bg) < 0.05 && luminance(panel) < 0.08, 'sfondo e pannelli scuri');
  assert.ok(contrast(text, bg) >= 7 && contrast(text, panel) >= 7, 'testo chiaro ben leggibile');
  assert.ok(contrast(muted, bg) >= 4.5 && contrast(muted, panel) >= 4.5, 'testo secondario leggibile');
  assert.ok(contrast('#2A2620', '#EFE6D2') >= 7, 'testo scuro sul panna della barra, anche in modalità notte');
  // gli elementi con colori propri restano visibili sullo sfondo scuro
  assert.match(css, /html\[data-theme="dark"\] \.favorite-button \{/);
  assert.match(css, /html\[data-theme="dark"\] \.free-shipping-bar \{/);
  assert.match(css, /html\[data-theme="dark"\] \.payment-field-error/);
});

/** §REQ:MDLT-GRN-NTT-7J2URW */
test('MDLT-7J2URW: toccando di nuovo si torna ai colori chiari e il pulsante mostra di nuovo il sole', () => {
  assert.equal(getNextTheme('dark'), 'light');
  assert.equal(getNextTheme(getNextTheme('light')), 'light');
  assert.equal(renderThemeIconMarkup(getNextTheme('dark')), renderThemeIconMarkup('light'));
  assert.match(themeJs, /theme = getNextTheme\(theme\)/);
  // i colori chiari sono quelli di :root, senza nessun override
  assert.match(css, /--bg: #F3F1EC/);
  for (const label of [getThemeToggleLabel('light'), getThemeToggleLabel('dark')]) {
    assert.ok(hasTranslation(label), `"${label}" va tradotto in inglese e spagnolo`);
  }
});

/** §REQ:MDLT-GRN-NTT-29KNY6 */
test('MDLT-29KNY6: la modalità scelta resta dopo il ricaricamento e tra le pagine', () => {
  const storage = memoryStorage();
  assert.equal(readTheme(storage), 'light');
  saveTheme(storage, 'dark');
  assert.equal(storage.getItem(THEME_STORAGE_KEY), 'dark');
  assert.equal(readTheme(storage), 'dark');
  saveTheme(storage, 'light');
  assert.equal(readTheme(storage), 'light');
  assert.equal(readTheme(memoryStorage({ [THEME_STORAGE_KEY]: 'viola' })), 'light', 'valore sconosciuto: modalità giorno');
  assert.match(themeJs, /saveTheme\(storage, theme\)/);
  assert.match(themeJs, /let theme = readTheme\(storage\)/);
  assert.match(appJs, /initTheme\(\)/);
  // niente lampo chiaro: la pagina legge la scelta prima di disegnarsi
  const head = indexHtml.slice(indexHtml.indexOf('<head>'), indexHtml.indexOf('</head>'));
  assert.match(head, new RegExp(`<script>[^<]*localStorage\\.getItem\\('${THEME_STORAGE_KEY}'\\)[^<]*dataset\\.theme`));
});
