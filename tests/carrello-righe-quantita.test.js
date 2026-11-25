import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { PRODUCTS, calculateCartTotalCents } from '../catalog-logic.js';
import * as cartLogic from '../public/cart-logic.js';
import { renderAddToCartButton } from '../public/cart-ui.js';
import { renderCartPageMarkup } from '../public/payment-ui.js';

const { CART_STORAGE_KEY, isItemInCart, persistCart, restoreCart } = cartLogic;

const VASO = PRODUCTS.find(({ name }) => name === 'Vaso Duna');
const LAMPADA = PRODUCTS.find(({ name }) => name === 'Lampada Lume');
const indexHtml = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

function memoryStorage(initial = null) {
  return {
    value: initial,
    getItem(key) { return key === CART_STORAGE_KEY ? this.value : null; },
    setItem(key, value) { if (key === CART_STORAGE_KEY) this.value = value; }
  };
}

/** §REQ:CRRL-RGH-E-QNTT-KWT-010 — carrello vuoto: messaggio, niente "Vai al pagamento". */
test('CRRL-RGH-E-QNTT-KWT-010: il carrello vuoto mostra "Il carrello è vuoto" e nessun pulsante di pagamento', () => {
  const markup = renderCartPageMarkup([]);
  assert.match(markup, /Il carrello è vuoto/);
  assert.doesNotMatch(markup, /Vai al pagamento/);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-020 — nella pagina Scopri il riepilogo è nascosto, il pulsante Carrello resta nell'intestazione. */
test('CRRL-RGH-E-QNTT-KWT-020: Scopri nasconde il riepilogo e l’intestazione conserva il pulsante Carrello', () => {
  const scopriRender = appJs.slice(appJs.indexOf("pageTitle.textContent = 'Scopri';"));
  assert.match(scopriRender.slice(0, 600), /cartPanel\.hidden = true;/);
  const header = indexHtml.slice(indexHtml.indexOf('<header'), indexHtml.indexOf('</header>'));
  assert.match(header, /<a class="cart-pill cart-link" href="\/carrello" aria-label="Carrello">\s*<svg[\s\S]*?<\/svg>\s*<span>Carrello<\/span>/);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-030 — il pulsante Carrello apre la pagina con riepilogo, totale e "Indietro". */
test('CRRL-RGH-E-QNTT-KWT-030: la pagina del carrello ha riepilogo, totale e pulsante Indietro', () => {
  assert.match(indexHtml, /class="cart-pill cart-link" href="\/carrello"/);
  const markup = renderCartPageMarkup([{ ...VASO, quantity: 1 }]);
  assert.match(markup, /<a class="back-button" href="\/scopri">Indietro<\/a>/);
  assert.match(markup, /Subtotale/);
  assert.match(markup, /Totale/);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-040 — aggiungere un articolo dalla scheda. */
test('CRRL-RGH-E-QNTT-KWT-040: aggiungere Vaso Duna a un carrello vuoto crea 1 riga da 34,00 euro e l’icona mostra 1', () => {
  const cart = cartLogic.addProductToCart([], VASO);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].name, 'Vaso Duna');
  assert.equal(cart[0].quantity, 1);
  assert.equal(Math.round(cart[0].price * 100), 3400);
  assert.equal(cartLogic.getCartItemCount(cart), 1);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-050 — "+" sulla riga porta Vaso Duna a quantità 2, una sola riga, l'icona mostra 2. */
test('CRRL-RGH-E-QNTT-KWT-050: il pulsante + su Vaso Duna porta la riga a quantità 2 e l’icona mostra 2', () => {
  const cart = cartLogic.changeCartQuantity(cartLogic.addProductToCart([], VASO), VASO.id, 1);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].name, 'Vaso Duna');
  assert.equal(cart[0].quantity, 2);
  assert.equal(cartLogic.getCartItemCount(cart), 2);
  assert.match(renderCartPageMarkup(cart), new RegExp(`data-cart-action="increase" data-product-id="${VASO.id}"`));
  assert.match(appJs, /cartCountEl\.textContent = String\(itemCount\);/);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-060 — aumentare la quantità a 3 porta la riga a 102,00 euro. */
test('CRRL-RGH-E-QNTT-KWT-060: portando Vaso Duna a quantità 3 la riga vale 102,00 euro', () => {
  let cart = cartLogic.addProductToCart([], VASO);
  cart = cartLogic.changeCartQuantity(cart, VASO.id, 1);
  cart = cartLogic.changeCartQuantity(cart, VASO.id, 1);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 3);
  assert.equal(calculateCartTotalCents(cart).subtotalCents, 10200);
  assert.match(renderCartPageMarkup(cart), /102,00/);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-070 — diminuire da 1 toglie l'articolo e mostra il carrello vuoto. */
test('CRRL-RGH-E-QNTT-KWT-070: diminuire Vaso Duna da 1 lo toglie e il carrello è vuoto', () => {
  const cart = cartLogic.changeCartQuantity(cartLogic.addProductToCart([], VASO), VASO.id, -1);
  assert.equal(isItemInCart(cart, VASO.id), false);
  assert.match(renderCartPageMarkup(cart), /Il carrello è vuoto/);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-080 — "+" sopra "-". */
test('CRRL-RGH-E-QNTT-KWT-080: nel carrello il pulsante + precede il pulsante -', () => {
  const markup = renderCartPageMarkup([{ ...VASO, quantity: 1 }]);
  const plus = markup.indexOf('data-cart-action="increase"');
  const minus = markup.indexOf('data-cart-action="decrease"');
  assert.ok(plus > -1 && minus > plus);
  assert.match(fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8'),
    /\.cart-item-price \{[^}]*flex-direction: column;/);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-090 — il carrello resta dopo la ricarica. */
test('CRRL-RGH-E-QNTT-KWT-090: dopo salvataggio e ricarica il carrello contiene ancora 1 Vaso Duna', () => {
  const storage = memoryStorage();
  persistCart(storage, [{ ...VASO, quantity: 1 }]);
  const restored = restoreCart(storage);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].name, 'Vaso Duna');
  assert.equal(restored[0].quantity, 1);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-100 — Aggiungi diventa Aggiunto, stesso pulsante, gli altri restano Aggiungi. */
test('CRRL-RGH-E-QNTT-KWT-100: toccando Aggiungi su Lampada Lume solo il suo pulsante diventa Aggiunto', () => {
  const cart = cartLogic.toggleProductInCart([], LAMPADA);
  const lampada = renderAddToCartButton(LAMPADA, isItemInCart(cart, LAMPADA.id));
  const vaso = renderAddToCartButton(VASO, isItemInCart(cart, VASO.id));
  assert.match(lampada, /class="add-button is-added"/);
  assert.match(lampada, /<span>Aggiunto<\/span>/);
  assert.match(lampada, new RegExp(`data-product-id="${LAMPADA.id}"`));
  assert.match(vaso, />Aggiungi<\/button>/);
  assert.match(fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8'),
    /\.add-button\.is-added \{[^}]*background: var\(--cream\);/);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-110 — il secondo tocco rimuove l'articolo. */
test('CRRL-RGH-E-QNTT-KWT-110: il secondo tocco toglie Lampada Lume e il pulsante torna Aggiungi', () => {
  const once = cartLogic.toggleProductInCart([], LAMPADA);
  const twice = cartLogic.toggleProductInCart(once, LAMPADA);
  assert.equal(isItemInCart(twice, LAMPADA.id), false);
  assert.match(renderAddToCartButton(LAMPADA, isItemInCart(twice, LAMPADA.id)), />Aggiungi<\/button>/);
});

/** §REQ:CRRL-RGH-E-QNTT-KWT-120 — se l'articolo esce dal carrello il pulsante torna normale. */
test('CRRL-RGH-E-QNTT-KWT-120: togliendo Lampada Lume dal carrello il suo pulsante torna Aggiungi', () => {
  const cart = cartLogic.removeFromCart(cartLogic.addProductToCart([], LAMPADA), LAMPADA.id);
  assert.equal(isItemInCart(cart, LAMPADA.id), false);
  assert.match(renderAddToCartButton(LAMPADA, isItemInCart(cart, LAMPADA.id)), />Aggiungi<\/button>/);
});
