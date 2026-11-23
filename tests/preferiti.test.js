import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PRODUCTS } from '../catalog-logic.js';
import { PRODUCT_GALLERY_IMAGES, renderProductDetailMarkup } from '../public/product-detail.js';
import * as fav from '../public/favorites.js';

const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
const appJs = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

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

/** §REQ:PRFR-BSO-010, §REQ:PRFR-BSO-020 */
test('PRFR-010/020: toccare il cuore aggiunge l\'articolo e il cuore risulta attivo, nero pece senza spunta', () => {
  const vaso = byName('Vaso Duna');
  const lampada = byName('Lampada Lume');

  assert.deepEqual(fav.toggleFavoriteId([], vaso.id), [vaso.id]);
  assert.deepEqual(fav.toggleFavoriteId([], lampada.id), [lampada.id]);

  for (const product of [vaso, lampada]) {
    const off = fav.renderFavoriteButtonMarkup(product, false);
    const on = fav.renderFavoriteButtonMarkup(product, true);
    assert.match(off, /aria-pressed="false"/);
    assert.doesNotMatch(off, /is-favorite/);
    assert.match(on, /aria-pressed="true"/);
    assert.match(on, /class="favorite-button is-favorite"/);
    assert.match(on, /fill: #000000/);
    assert.doesNotMatch(on, /<path d="m3 8|check/i, 'nessuna spunta nel cuore');
  }
  assert.match(cssRule('.favorite-button.is-favorite svg'), /fill: #000000/);
  assert.match(cssRule('.favorite-button.is-favorite svg'), /stroke: #000000/);
});

/** §REQ:PRFR-BSO-010, §REQ:PRFR-BSO-020 */
test('PRFR-010/020: il cuore è presente sia nel catalogo sia nella scheda e salva la scelta', () => {
  const vaso = byName('Vaso Duna');
  const lampada = byName('Lampada Lume');
  assert.match(appJs, /renderFavoriteButtonMarkup\(product, state\.favoriteIds\.includes\(product\.id\)\)/);
  assert.match(renderProductDetailMarkup(lampada, true), /data-favorite-product-id="\d+"[\s\S]*aria-pressed="true"/);
  assert.match(renderProductDetailMarkup(vaso, false), /aria-pressed="false"/);
  assert.match(appJs, /FAVORITES_STORAGE_KEY, JSON\.stringify\(state\.favoriteIds\)/);
  assert.match(appJs, /productList\.querySelector\('\.favorite-button'\)\.addEventListener\('click', \(\) => \{\s*toggleFavorite\(product\.id\)/);
});

/** §REQ:PRFR-BSO-020, §REQ:PRFR-BSO-040 */
test('PRFR-020: dopo aver toccato il cuore dalla scheda l\'articolo compare nella pagina Preferiti', () => {
  const lampada = byName('Lampada Lume');
  const ids = fav.toggleFavoriteId([], lampada.id);
  const html = fav.renderFavoritesMarkup(PRODUCTS.filter((p) => ids.includes(p.id)), PRODUCT_GALLERY_IMAGES);
  assert.ok(html.includes('Lampada Lume'));
});

/** §REQ:PRFR-BSO-030 */
test('PRFR-030: toccare di nuovo il cuore toglie l\'articolo e il cuore non è più attivo', () => {
  const vaso = byName('Vaso Duna');
  const cornice = byName('Cornice Atelier');
  const after = fav.toggleFavoriteId([vaso.id, cornice.id], vaso.id);
  assert.deepEqual(after, [cornice.id]);
  const html = fav.renderFavoritesMarkup(PRODUCTS.filter((p) => after.includes(p.id)), PRODUCT_GALLERY_IMAGES);
  assert.ok(!html.includes('Vaso Duna'));
  assert.doesNotMatch(fav.renderFavoriteButtonMarkup(vaso, after.includes(vaso.id)), /is-favorite|aria-pressed="true"/);
  assert.deepEqual(fav.toggleFavoriteId(fav.toggleFavoriteId([], vaso.id), vaso.id), []);
});

/** §REQ:PRFR-BSO-040 */
test('PRFR-040: la pagina Preferiti mostra 2 articoli con prezzo e immagine accanto al nome', () => {
  const vaso = byName('Vaso Duna');
  const cornice = byName('Cornice Atelier');
  const html = fav.renderFavoritesMarkup([vaso, cornice], PRODUCT_GALLERY_IMAGES);
  assert.equal((html.match(/class="favorite-item"/g) ?? []).length, 2);
  assert.match(html, /Vaso Duna[\s\S]*34[\s\S]*Cornice Atelier[\s\S]*29/);
  assert.equal(vaso.price, 34);
  assert.equal(cornice.price, 29);
  assert.equal((html.match(/<img class="favorite-item-image"/g) ?? []).length, 2);
  const firstItem = html.split('class="favorite-item"')[1];
  assert.ok(firstItem.indexOf('favorite-item-image') < firstItem.indexOf('favorite-item-name'), 'immagine prima del nome');
  assert.ok(html.includes(`src="${encodeURI(PRODUCT_GALLERY_IMAGES[vaso.id][0])}"`));
});

/** §REQ:PRFR-BSO-050 */
test('PRFR-050: toccare un articolo nei Preferiti apre la sua scheda', () => {
  const vaso = byName('Vaso Duna');
  const html = fav.renderFavoritesMarkup([vaso], PRODUCT_GALLERY_IMAGES);
  assert.match(html, new RegExp(`class="favorite-item"[\\s\\S]*data-product-id="${vaso.id}"`));
  assert.match(html, /aria-label="Apri la scheda di Vaso Duna"/);
  assert.match(appJs, /state\.selectedProductId = Number\(button\.dataset\.productId\);\s*state\.selectedProductSource = 'favorites'/);
  assert.match(appJs, /isFavoritesPage &&\s*state\.selectedProductId !== null[\s\S]*renderProductDetail\(product\)/);
  assert.match(renderProductDetailMarkup(vaso), /<h2 id="product-detail-title">Vaso Duna<\/h2>/);
});

/** §REQ:PRFR-BSO-060 */
test('PRFR-060: "Indietro" dalla scheda aperta dai Preferiti riporta alla pagina Preferiti', () => {
  assert.match(
    appJs,
    /if \(state\.selectedProductSource === 'favorites'\) \{[^\n]*\s*state\.selectedProductId = null;\s*state\.selectedProductSource = 'catalog';\s*renderProducts\(\);\s*return;/
  );
  assert.match(renderProductDetailMarkup(byName('Vaso Duna')), /class="back-button" type="button">Indietro</);
  assert.match(appJs, /if \(isFavoritesPage\) \{\s*renderFavoritesPage\(\);/);
});

/** §REQ:PRFR-BSO-070 */
test('PRFR-070: senza preferiti la pagina mostra il messaggio dedicato', () => {
  const message = 'Tocca il cuore sugli oggetti che ti piacciono: li ritrovi tutti qui.';
  assert.equal(fav.EMPTY_FAVORITES_MESSAGE, message);
  const html = fav.renderFavoritesMarkup([], PRODUCT_GALLERY_IMAGES);
  assert.ok(html.includes(message));
  assert.doesNotMatch(html, /favorite-item/);
  assert.deepEqual(fav.readFavoriteIds(memoryStorage(), PRODUCTS), []);
});

/** §REQ:PRFR-BSO-080 */
test('PRFR-080: i preferiti salvati restano dopo aver ricaricato la pagina', () => {
  const vaso = byName('Vaso Duna');
  const storage = memoryStorage();
  const ids = fav.toggleFavoriteId([], vaso.id);
  storage.setItem(fav.FAVORITES_STORAGE_KEY, JSON.stringify(ids));

  // "ricarico": si rilegge dallo storage
  const reloaded = fav.readFavoriteIds(storage, PRODUCTS);
  assert.deepEqual(reloaded, [vaso.id]);
  assert.match(fav.renderFavoriteButtonMarkup(vaso, reloaded.includes(vaso.id)), /aria-pressed="true"/);
  assert.match(appJs, /favoriteIds: readFavoriteIds\(window\.localStorage, PRODUCTS\)/);

  // ID sconosciuti o doppi non sopravvivono al ricaricamento
  const dirty = memoryStorage({ [fav.FAVORITES_STORAGE_KEY]: JSON.stringify([vaso.id, vaso.id, 9999]) });
  assert.deepEqual(fav.readFavoriteIds(dirty, PRODUCTS), [vaso.id]);
});
