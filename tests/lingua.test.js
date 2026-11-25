import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PRODUCTS, CATEGORIES, getFreeShippingProgress } from '../catalog-logic.js';
import { PHRASES, COUNTRIES } from '../public/i18n-dictionaries.js';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  getLanguageLabel,
  getOtherLanguages,
  hasTranslation,
  readLanguage,
  renderLanguageMenuMarkup,
  saveLanguage,
  translateText
} from '../public/language.js';
import { renderProductDetailMarkup } from '../public/product-detail.js';
import { renderFavoritesMarkup } from '../public/favorites.js';
import { renderAddToCartButton } from '../public/cart-ui.js';
import { renderLookScene } from '../public/look-scene.js';
import { renderFrameConfiguratorMarkup } from '../public/frame-configurator.js';
import { renderCartPageMarkup, renderPaymentPageMarkup } from '../public/payment-ui.js';
import { INITIAL_FRAME_SELECTION, FRAME_OPTIONS, validateFramePhoto } from '../public/frame-logic.js';
import { createFrameCartItem } from '../public/cart-logic.js';
import {
  EUROPEAN_PHONE_PREFIXES,
  PAYMENT_METHODS,
  validateCardPayment,
  validatePaymentSubmission,
  validateShippingAddress
} from '../public/payment-logic.js';
import { copyCouponCode, validateCouponCode } from '../public/coupon-logic.js';
import { PRODUCT_GALLERY_IMAGES } from '../public/product-detail.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const indexHtml = read('../public/index.html');
const css = read('../public/styles.css');
const appJs = read('../public/app.js');
const languageJs = read('../public/language.js');

const byName = (name) => PRODUCTS.find((product) => product.name === name);
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

const decode = (text) => text
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// Tutti i testi che il visitatore vede o sente in un frammento di HTML: parole tra i tag e attributi leggibili.
function visibleTexts(html) {
  const withoutScripts = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const texts = [];
  for (const [, text] of withoutScripts.matchAll(/>([^<]+)</g)) {
    texts.push(decode(text).trim());
  }
  for (const match of withoutScripts.matchAll(/\s(?:aria-label|alt|placeholder|title)="([^"]*)"/g)) {
    texts.push(decode(match[1]).trim());
  }
  return [...new Set(texts.filter(Boolean))];
}

function untranslated(texts) {
  return texts.filter((text) => !hasTranslation(text));
}

/** §REQ:LNG-7ZCWHN */
test('LNG-7ZCWHN: con il sito in italiano il pulsante mostra ITA e la lingua di partenza è l\'italiano', () => {
  assert.equal(DEFAULT_LANGUAGE, 'ita');
  assert.equal(getLanguageLabel('ita'), 'ITA');
  assert.equal(readLanguage(memoryStorage()), 'ita');
  assert.match(indexHtml, /<button id="language-button"[^>]*>ITA<\/button>/);
  assert.match(languageJs, /button\.textContent = getLanguageLabel\(language\)/);
});

/** §REQ:LNG-7T2YSF */
test('LNG-7T2YSF: il pulsante della lingua sta a destra nella barra superiore, accanto a giorno/notte, con area di almeno 44 pixel', () => {
  const bar = indexHtml.slice(indexHtml.indexOf('<div id="announcement-bar"'), indexHtml.indexOf('<header class="site-header"'));
  const actions = bar.slice(bar.indexOf('class="announcement-actions"'));
  assert.ok(bar.indexOf('class="announcement-message"') < bar.indexOf('class="announcement-actions"'), 'messaggio, poi i pulsanti a destra');
  assert.ok(actions.indexOf('id="language-button"') > 0 && actions.indexOf('id="language-button"') < actions.indexOf('id="theme-button"'));
  assert.match(cssRule('.announcement-actions'), /justify-content: flex-end/);
  const rule = cssRule('.checkout-button.language-button,\n.checkout-button.theme-button');
  assert.match(rule, /min-height: 44px/);
  assert.match(rule, /min-width: 44px/);
});

/** §REQ:LNG-9HRNHM */
test('LNG-9HRNHM: il pulsante della lingua usa i colori panna: sfondo trasparente, bordo e testo della palette, nessun verde', () => {
  assert.match(indexHtml, /id="language-button" class="checkout-button language-button"/);
  const shared = css.slice(css.indexOf('.add-button,\n.checkout-button,\n.back-button {'));
  const sharedRule = shared.slice(0, shared.indexOf('}'));
  assert.match(sharedRule, /background: transparent/);
  assert.match(sharedRule, /border: 1\.5px solid var\(--button-border\)/);
  assert.match(cssRule('.checkout-button.language-button,\n.checkout-button.theme-button'), /color: var\(--ink\)/);
  assert.doesNotMatch(css, /--primary/, 'nessun colore primario verde');
});

/** §REQ:LNG-674RJD */
test('LNG-674RJD: il pulsante apre una barra, fatta come quella di "Ordina per", con inglese e spagnolo', () => {
  const html = renderLanguageMenuMarkup('ita');
  assert.match(html, /data-language="eng"[^>]*>Inglese</);
  assert.match(html, /data-language="esp"[^>]*>Spagnolo</);
  assert.equal((html.match(/class="language-option"/g) ?? []).length, 2);
  assert.match(indexHtml, /id="language-menu" class="language-menu" role="listbox"[^>]* hidden>/);
  assert.match(languageJs, /menu\.hidden = !willOpen/);
  assert.match(languageJs, /setAttribute\('aria-expanded', String\(willOpen\)\)/);
  const rule = cssRule('.language-menu');
  assert.match(rule, /border: 1px solid var\(--border\)/);
  assert.match(rule, /border-radius: 12px/);
  assert.match(rule, /background: var\(--panel\)/);
  assert.match(css, /input,\s*select \{[^}]*border-radius: 12px/, 'stessa forma del campo "Ordina per"');
});

/** §REQ:LNG-9ERFZM */
test('LNG-9ERFZM: scegliendo Inglese il pulsante diventa ENG, la barra si chiude e i testi sono in inglese', () => {
  assert.equal(getLanguageLabel('eng'), 'ENG');
  assert.match(languageJs, /language = code;[\s\S]*saveLanguage\(storage, language\);[\s\S]*renderSwitcher\(\);[\s\S]*applyLanguage\(\);[\s\S]*closeMenu\(\)/);
  assert.match(languageJs, /menu\.hidden = true;/);
  assert.equal(translateText('Vai al pagamento', 'eng'), 'Go to payment');
  assert.equal(translateText('Ordina per', 'eng'), 'Sort by');
  assert.equal(translateText('Il carrello è vuoto.', 'eng'), 'Your cart is empty.');
});

/** §REQ:LNG-7WEBWK */
test('LNG-7WEBWK: scegliendo Spagnolo il pulsante diventa ESP, la barra si chiude e i testi sono in spagnolo', () => {
  assert.equal(getLanguageLabel('esp'), 'ESP');
  assert.equal(translateText('Vai al pagamento', 'esp'), 'Ir al pago');
  assert.equal(translateText('Ordina per', 'esp'), 'Ordenar por');
  assert.equal(translateText('Il carrello è vuoto.', 'esp'), 'El carrito está vacío.');
  assert.match(languageJs, /doc\.documentElement\.lang = LANGUAGES\.find/);
});

/** §REQ:LNG-3Q3RDZ */
test('LNG-3Q3RDZ: dall\'inglese la barra offre Italiano e Spagnolo e si può tornare all\'italiano', () => {
  assert.deepEqual(getOtherLanguages('eng').map(({ code }) => code), ['ita', 'esp']);
  assert.deepEqual(getOtherLanguages('esp').map(({ code }) => code), ['ita', 'eng']);
  assert.deepEqual(getOtherLanguages('ita').map(({ code }) => code), ['eng', 'esp']);
  const html = renderLanguageMenuMarkup('eng');
  assert.match(html, /data-language="ita"[^>]*>Italiano</);
  assert.match(html, /data-language="esp"[^>]*>Spagnolo</);
  assert.doesNotMatch(html, /data-language="eng"/);
  // tornando all'italiano ogni testo ricompare identico
  for (const text of ['Vai al pagamento', 'Aggiungi Vaso Duna al carrello', '3 articoli']) {
    assert.equal(translateText(text, 'ita'), text);
  }
  assert.match(languageJs, /entry\.orig/, 'il testo originale italiano è conservato per poter tornare indietro');
});

/** §REQ:LNG-6A3P6V */
test('LNG-6A3P6V: ogni voce dei dizionari ha una traduzione in inglese e in spagnolo', () => {
  for (const [ita, eng, esp] of [...PHRASES, ...COUNTRIES]) {
    assert.ok(ita && eng && esp, `traduzione mancante per "${ita}"`);
  }
  assert.equal(new Set(PHRASES.map(([ita]) => ita)).size, PHRASES.length, 'nessuna frase doppia');
  assert.equal(translateText('1 articoli', 'eng'), '1 item');
  assert.equal(translateText('3 articoli', 'esp'), '3 artículos');
  // le parole che cambiano davvero lingua
  for (const text of ['Carrello', 'Preferiti', 'Pagamento', 'Dati di spedizione', 'Conferma ordine', 'Nessuno']) {
    assert.notEqual(translateText(text, 'eng'), text, `${text} non tradotto in inglese`);
    assert.notEqual(translateText(text, 'esp'), text, `${text} non tradotto in spagnolo`);
  }
});

/** §REQ:LNG-6A3P6V */
test('LNG-6A3P6V: nessuna parola o frase fissa della landing page, del catalogo e della barra del carrello resta in italiano', () => {
  const missing = untranslated([
    ...visibleTexts(indexHtml),
    ...CATEGORIES.map(({ label }) => label),
    ...PRODUCTS.flatMap(({ badge }) => [badge]),
    ...PRODUCTS.map((product) => renderAddToCartButton(product, false)).flatMap(visibleTexts),
    ...PRODUCTS.map((product) => renderAddToCartButton(product, true)).flatMap(visibleTexts),
    ...visibleTexts(renderLookScene()),
    ...[0, 5000, 7899, 7900, 20000].map((cents) => getFreeShippingProgress(cents).message).filter(Boolean),
    '0 articoli', '1 articoli', '12 articoli', 'Nessun prodotto trovato con i filtri correnti.', 'Il carrello è vuoto.', 'Sconto coupon'
  ]);
  assert.deepEqual(missing, []);
});

/** §REQ:LNG-6A3P6V */
test('LNG-6A3P6V: nessuna parola o frase fissa di scheda prodotto, preferiti, configuratore, carrello e pagamento resta in italiano', async () => {
  const vaso = byName('Vaso Duna');
  const frameItem = createFrameCartItem(INITIAL_FRAME_SELECTION, { name: 'mare.jpg', url: 'blob:x' });
  const plainFrameItem = createFrameCartItem(INITIAL_FRAME_SELECTION);
  const cart = [
    { id: 4, name: 'Vaso Duna', price: 34, quantity: 2 },
    { ...frameItem },
    { ...plainFrameItem, id: 'frame:other' }
  ];
  const address = { name: 'Maria', surname: 'Rossi', address: 'Via Roma 1', city: 'Roma', postalCode: '00100', phonePrefix: '+39', phone: '3331234567', email: 'maria@example.com' };
  const confirmation = {
    orderNumber: 'ORD-1', orderStatus: 'Confermato', totalCents: 6800, bankTransfer: true,
    customerName: 'Maria', customerSurname: 'Rossi', customerAddress: 'Via Roma 1', customerPostalCode: '00100',
    customerCity: 'Roma', customerPhonePrefix: '+39', customerPhone: '3331234567', customerEmail: 'maria@example.com'
  };
  const pages = [
    ...PRODUCTS.flatMap((product) => [
      renderProductDetailMarkup(product, false, false, 0),
      renderProductDetailMarkup(product, true, true, 1)
    ]),
    renderFavoritesMarkup(PRODUCTS, PRODUCT_GALLERY_IMAGES),
    renderFavoritesMarkup([], PRODUCT_GALLERY_IMAGES),
    renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION, null, ''),
    renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION, { name: 'mare.jpg', url: 'blob:x' }, validateFramePhoto({ type: 'text/plain', size: 1 })),
    renderFrameConfiguratorMarkup({ measure: '50x70', profile: 'contemporaneo', mat: 'nessuno' }, null, validateFramePhoto({ type: 'image/png', size: 99999999 })),
    renderCartPageMarkup([], ''),
    renderCartPageMarkup(cart, 'FirstPurchase'),
    renderCartPageMarkup(cart.slice(0, 1), ''),
    renderPaymentPageMarkup({ items: [], stage: 'form' }),
    ...['', 'card', 'paypal', 'bank-transfer'].map((selectedMethod) => renderPaymentPageMarkup({
      items: cart, selectedMethod, address, couponCode: 'FirstPurchase', errors: {
        ...validateShippingAddress({}), ...validatePaymentSubmission({}, ''), card: validateCardPayment({ number: '', expiry: '', code: '' }),
        request: 'Non è stato possibile contattare il server. Riprova.'
      }
    })),
    renderPaymentPageMarkup({ items: cart, selectedMethod: 'card', couponInput: 'XX', couponError: validateCouponCode('XX', 9000) }),
    renderPaymentPageMarkup({ items: cart, stage: 'paypal-approval', selectedMethod: 'paypal' }),
    renderPaymentPageMarkup({ items: cart, stage: 'confirmation', errors: confirmation }),
    renderPaymentPageMarkup({ items: cart, stage: 'confirmation', errors: { ...confirmation, orderStatus: 'In attesa di pagamento', bankTransfer: false } })
  ];

  const messages = [
    ...Object.values(validateShippingAddress({})),
    ...Object.values(validateShippingAddress({ postalCode: '12', phonePrefix: '+1', phone: '1', email: 'x' })),
    ...Object.values(validatePaymentSubmission({}, '')),
    ...[
      { number: '', expiry: '', code: '' },
      { number: '12', expiry: '', code: '' },
      { number: '4242424242424242', expiry: '99', code: '' },
      { number: '4242424242424242', expiry: '01/20', code: '' },
      { number: '4242424242424242', expiry: '12/99', code: 'x' },
      { number: '4000000000000002', expiry: '12/99', code: '123' }
    ].map((card) => validateCardPayment(card)),
    validateCouponCode('', 9000), validateCouponCode('XX', 9000), validateCouponCode('FirstPurchase', 1000),
    (await copyCouponCode({ writeText: async () => {} })).message,
    (await copyCouponCode({ writeText: async () => { throw new Error('no'); } })).message,
    validateFramePhoto({ type: 'text/plain', size: 1 }), validateFramePhoto({ type: 'image/png', size: 99999999 }),
    'Articolo non valido', 'Richiesta non valida', 'Dati di spedizione non validi', 'Metodo di pagamento non valido',
    'In attesa di pagamento', 'Confermato',
    ...PAYMENT_METHODS.map(({ label }) => label),
    ...EUROPEAN_PHONE_PREFIXES.map(({ country, value }) => `${country} (${value})`),
    ...FRAME_OPTIONS.profile.map(({ label }) => label), ...FRAME_OPTIONS.mat.map(({ label }) => label),
    frameItem.name, frameItem.frameDescription, plainFrameItem.frameDescription,
    `${vaso.name} — ${frameItem.frameDescription} × 2`,
    `Anteprima cornice, profilo Classico, misura 13x18 cm, passe-partout Bianco`
  ].filter(Boolean);

  // i dati scritti dal cliente (nome, indirizzo) non sono testo del sito e non si traducono
  const customerData = /Maria|Via Roma/;
  const missing = untranslated([...pages.flatMap(visibleTexts), ...messages].filter((text) => !customerData.test(text)));
  assert.deepEqual(missing, []);
});

/** §REQ:LNG-5R75GQ */
test('LNG-5R75GQ: i nomi dei prodotti restano uguali e le descrizioni si traducono', () => {
  for (const product of PRODUCTS) {
    for (const language of ['eng', 'esp']) {
      assert.equal(translateText(product.name, language), product.name, `${product.name} deve restare invariato`);
      assert.notEqual(translateText(product.description, language), product.description, `descrizione di ${product.name} non tradotta`);
      assert.notEqual(translateText(product.badge, language), '');
    }
  }
  assert.equal(translateText('Aggiungi Vaso Duna al carrello', 'eng'), 'Add Vaso Duna to cart');
  assert.equal(translateText('Aggiungi Vaso Duna al carrello', 'esp'), 'Añadir Vaso Duna al carrito');
  assert.equal(translateText('Ceramica smaltata a mano con finitura opaca.', 'eng'), 'Hand-glazed ceramic with a matte finish.');
  assert.equal(translateText('altezza 30 cm, diametro pancia 22 cm', 'eng'), 'height 30 cm, belly diameter 22 cm');
});

/** §REQ:LNG-9NBEVB */
test('LNG-9NBEVB: il pulsante della lingua compare solo nella landing page', () => {
  assert.match(indexHtml, /<div id="language-switcher" class="language-switcher" hidden>/, 'nascosto finché la pagina non è la landing');
  assert.match(languageJs, /switcher\.hidden = !isLandingPage/);
  assert.match(appJs, /initLanguage\(\{ isLandingPage \}\)/);
  assert.match(appJs, /const isLandingPage = window\.location\.pathname === '\/' \|\| window\.location\.pathname === '\/scopri'/);
  assert.match(css, /\[hidden\] \{\s*display: none !important;/);
});

/** §REQ:LNG-6AEYMD */
test('LNG-6AEYMD: la lingua scelta resta dopo il ricaricamento e tra le pagine', () => {
  const storage = memoryStorage();
  saveLanguage(storage, 'esp');
  assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY), 'esp');
  assert.equal(readLanguage(storage), 'esp');
  saveLanguage(storage, 'eng');
  assert.equal(readLanguage(storage), 'eng');
  assert.equal(readLanguage(memoryStorage({ [LANGUAGE_STORAGE_KEY]: 'klingon' })), 'ita', 'valore sconosciuto: italiano');
  assert.deepEqual(LANGUAGES.map(({ code }) => code), ['ita', 'eng', 'esp']);
  // ogni pagina legge la lingua salvata e traduce, anche dove il pulsante non compare
  assert.match(languageJs, /let language = readLanguage\(storage\)/);
  assert.match(languageJs, /saveLanguage\(storage, language\)/);
  assert.match(languageJs, /new MutationObserver/);
});
