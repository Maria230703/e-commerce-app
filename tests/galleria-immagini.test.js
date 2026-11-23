import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PRODUCTS } from '../catalog-logic.js';
import * as detail from '../public/product-detail.js';

const { PRODUCT_GALLERY_IMAGES, renderProductDetailMarkup } = detail;
const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
const appJs = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

const EXPECTED_PHOTOS = {
  'Lampada Lume': 4,
  'Specchio Orbita': 2,
  'Portavaso Trama': 3,
  'Vaso Duna': 3,
  'Candela Vaniglia': 3,
  'Cornice Atelier': 2
};
const byName = (name) => PRODUCTS.find((product) => product.name === name);
const mainSrc = (html) => html.match(/<img\s+class="product-gallery-image"\s+src="([^"]*)"/)[1];
const cssRule = (selector) => {
  const start = css.indexOf(`\n${selector} {`);
  assert.ok(start >= 0, `regola CSS ${selector} assente`);
  return css.slice(start, css.indexOf('}', start));
};

/** §REQ:GLLR-IMMG-NNT-010 */
test('GLLR-010: la scheda mostra foto 1, frecce, miniature di tutte le foto e la descrizione', () => {
  for (const [name, count] of Object.entries(EXPECTED_PHOTOS)) {
    const product = byName(name);
    const html = renderProductDetailMarkup(product);
    assert.equal(PRODUCT_GALLERY_IMAGES[product.id].length, count, name);
    assert.equal(mainSrc(html), encodeURI(PRODUCT_GALLERY_IMAGES[product.id][0]), name);
    assert.match(html, /data-gallery-action="previous"/);
    assert.match(html, /data-gallery-action="next"/);
    assert.equal((html.match(/data-gallery-index="/g) ?? []).length, count, name);
    assert.ok(html.includes(product.description), `descrizione di ${name}`);
  }
});

/** §REQ:GLLR-IMMG-NNT-020, §REQ:GLLR-IMMG-NNT-030 */
test('GLLR-020/030: la freccia destra avanza di una foto alla volta', () => {
  assert.equal(typeof detail.stepGalleryIndex, 'function');
  for (const [name, count] of Object.entries(EXPECTED_PHOTOS)) {
    assert.equal(detail.stepGalleryIndex(0, 1, count), 1, `${name}: 1 -> 2`);
    if (count >= 3) {
      assert.equal(detail.stepGalleryIndex(1, 1, count), 2, `${name}: 2 -> 3`);
    }
  }
  assert.match(appJs, /data-gallery-action[\s\S]*'next' \? 1 : -1/);
});

/** §REQ:GLLR-IMMG-NNT-040 */
test('GLLR-040: dopo l\'ultima foto si riparte dalla prima, nell\'ordine stabilito', () => {
  for (const [name, count] of Object.entries(EXPECTED_PHOTOS)) {
    assert.equal(detail.stepGalleryIndex(count - 1, 1, count), 0, `${name}: ultima -> 1`);
    assert.equal(detail.stepGalleryIndex(0, 1, count), 1, `${name}: poi la 2`);
  }
});

/** §REQ:GLLR-IMMG-NNT-050 */
test('GLLR-050: la freccia sinistra torna alla foto precedente', () => {
  for (const [name, count] of Object.entries(EXPECTED_PHOTOS)) {
    assert.equal(detail.stepGalleryIndex(1, -1, count), 0, `${name}: 2 -> 1`);
  }
});

/** §REQ:GLLR-IMMG-NNT-060 */
test('GLLR-060: la miniatura 1 mostra la foto 1 al posto della 2 ed è selezionata al 50%', () => {
  for (const name of Object.keys(EXPECTED_PHOTOS)) {
    const product = byName(name);
    const images = PRODUCT_GALLERY_IMAGES[product.id];
    const html = renderProductDetailMarkup(product, false, false, 0);
    assert.equal(mainSrc(html), encodeURI(images[0]), name);
    assert.notEqual(mainSrc(html), encodeURI(images[1]), name);
    assert.match(html, /class="product-gallery-thumbnail is-selected"\s+type="button"\s+data-gallery-index="0"/);
    assert.equal((html.match(/is-selected/g) ?? []).length, 1);
  }
  assert.match(cssRule('.product-gallery-thumbnail.is-selected'), /opacity:\s*0\.5/);
  assert.match(appJs, /selectGalleryImage\(Number\(button\.dataset\.galleryIndex\)\)/);
});

/** §REQ:GLLR-IMMG-NNT-070 */
test('GLLR-070: frecce nere in cerchi color panna con trasparenza del 50%', () => {
  const rule = cssRule('.product-gallery-arrow');
  assert.match(rule, /color:\s*#000;/);
  assert.match(rule, /border-radius:\s*50%/);
  assert.match(rule, /background:\s*rgba\(243,\s*241,\s*236,\s*0\.5\)/);
});
