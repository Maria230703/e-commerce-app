import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PRODUCTS, filterProducts, formatCurrency, transitionCatalogView } from '../catalog-logic.js';
import { renderProductDetailMarkup } from '../public/product-detail.js';
import { LOOK_SCENE_PRODUCTS, renderLookScene } from '../public/look-scene.js';

const indexHtml = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const appJs = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

const at = (needle) => {
  const index = indexHtml.indexOf(needle);
  assert.notEqual(index, -1, `${needle} manca in index.html`);
  return index;
};

/** §REQ:CMPR-IL-LOOK-JMT-010 — la scena "Angolo soggiorno" con 4 punti cliccabili sopra l'elenco */
test('la scena Angolo soggiorno ha 4 punti cliccabili ed è sopra l\'elenco degli articoli', () => {
  assert.equal(PRODUCTS.length, 6);
  const markup = renderLookScene();

  assert.match(markup, /<span>Angolo soggiorno<\/span>/);
  assert.equal((markup.match(/<button[^>]*class="look-hotspot /g) ?? []).length, 4);
  assert.match(appJs, /lookSceneContainer\.innerHTML = renderLookScene\(\)/);
  assert.ok(at('id="look-scene-container"') < at('id="product-list"'));
});

/** §REQ:CMPR-IL-LOOK-JMT-020 — il titolo "Scopri" sta sotto la scena e prima della ricerca */
test('il titolo Scopri sta sotto la scena Compra il look e prima di Ordina per', () => {
  assert.match(renderLookScene(), /<h2 id="look-scene-title">Compra il look<\/h2>/);
  assert.match(indexHtml, /<h1 id="page-title"[^>]*>Scopri<\/h1>/);
  assert.ok(at('id="look-scene-container"') < at('id="page-title"'));
  assert.ok(at('id="page-title"') < at('id="sort-select"'), 'il titolo sta prima di "Ordina per"');
  assert.ok(at('id="search-input"') < at('id="look-scene-container"'), 'la ricerca sta nella testata, sopra la scena');
});

/** §REQ:CMPR-IL-LOOK-JMT-030 — ogni punto apre la scheda con nome e prezzo dell'articolo */
test('ogni punto della scena apre la scheda con nome e prezzo corretti', () => {
  const expected = [
    ['Cornice Atelier', 29],
    ['Lampada Lume', 89],
    ['Vaso Duna', 34],
    ['Portavaso Trama', 45]
  ];
  const markup = renderLookScene();

  assert.equal(LOOK_SCENE_PRODUCTS.length, expected.length);
  for (const [name, price] of expected) {
    const spot = LOOK_SCENE_PRODUCTS.find((item) => item.name === name);
    assert.ok(spot, `${name} non è nella scena`);
    assert.ok(markup.includes(`data-product-id="${spot.id}"`));

    const product = PRODUCTS.find((item) => item.id === spot.id);
    assert.equal(product.name, name);
    assert.equal(product.price, price);
    const detail = renderProductDetailMarkup(product);
    assert.ok(detail.includes(`<h2 id="product-detail-title">${name}</h2>`));
    assert.ok(detail.includes(formatCurrency(price)));
  }
  assert.match(appJs, /\.look-hotspot[\s\S]{0,200}openProduct\(Number\(button\.dataset\.productId\)\)/);
});

/** §REQ:CMPR-IL-LOOK-JMT-040 — tornando indietro dalla scheda si rivede Scopri con la scena */
test('tornando indietro dalla scheda la scena è di nuovo visibile su Scopri', () => {
  const lamp = LOOK_SCENE_PRODUCTS.find(({ name }) => name === 'Lampada Lume');
  const open = transitionCatalogView(
    { category: 'all', selectedProductId: null },
    { type: 'open-product', productId: lamp.id }
  );
  assert.equal(open.selectedProductId, lamp.id);

  const back = transitionCatalogView(open, { type: 'back-to-catalog' });
  assert.equal(back.selectedProductId, null);
  assert.equal(back.category, 'all');
  // la scena è nascosta nella scheda e mostrata di nuovo sul catalogo
  assert.match(appJs, /lookSceneContainer\.hidden = true;\s*frameConfiguratorLink\.hidden = true;\s*renderProductDetail\(product\)/);
  assert.match(appJs, /pageTitle\.textContent = 'Scopri';[\s\S]{0,200}lookSceneContainer\.hidden = false;/);
});

/** §REQ:CMPR-IL-LOOK-JMT-050 — la scena non cambia il catalogo: sempre 6 articoli */
test('la scena non cambia il catalogo: restano 6 articoli', () => {
  const before = filterProducts(PRODUCTS, {}).map(({ id }) => id);
  renderLookScene();
  const after = filterProducts(PRODUCTS, {}).map(({ id }) => id);

  assert.equal(after.length, 6);
  assert.deepEqual(after, before);
  assert.doesNotMatch(renderLookScene(), /product-card|class="product-/);
});
