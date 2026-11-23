import test from 'node:test';
import assert from 'node:assert/strict';

import { PRODUCTS, filterProducts, formatCurrency, transitionCatalogView } from '../catalog-logic.js';
import { renderProductDetailMarkup } from '../public/product-detail.js';

const byName = (name) => PRODUCTS.find((product) => product.name === name);
const infoRow = (html, label) =>
  html.match(new RegExp(`<p class="product-detail-information-row"><strong>${label}:</strong> ([^<]*)</p>`))?.[1];

const SCHEDE = [
  ['Lampada Lume', 89, 'Paralume in lino e base in metallo. Luce calda e diffusa.'],
  ['Specchio Orbita', 119, 'Specchio tondo con bordo sottile in metallo.'],
  ['Portavaso Trama', 45, 'Intreccio in rattan naturale con fondo impermeabile.'],
  ['Vaso Duna', 34, 'Ceramica smaltata a mano con finitura opaca.'],
  ['Candela Vaniglia', 22, 'Cera vegetale in vasetto di vetro riutilizzabile.'],
  ['Cornice Atelier', 29, 'Profilo in plastica con vetro antiriflesso.']
];

/** §REQ:SCHD-PRDT-MQI-010 */
test('SCHD-010: aprendo un articolo la scheda mostra nome, prezzo e descrizione', () => {
  for (const [name, price, description] of SCHEDE) {
    const product = byName(name);
    const opened = transitionCatalogView({ category: 'all', selectedProductId: null }, { type: 'open-product', productId: product.id });
    assert.equal(opened.selectedProductId, product.id, name);
    const html = renderProductDetailMarkup(product);
    assert.match(html, new RegExp(`<h2 id="product-detail-title">${name}</h2>`), name);
    assert.equal(product.price, price, name);
    assert.ok(html.includes(formatCurrency(price)), `prezzo di ${name}`);
    assert.equal(infoRow(html, 'Descrizione'), description, name);
  }
});

/** §REQ:SCHD-PRDT-MQI-020 */
test('SCHD-020: Indietro dalla scheda riporta a Scopri (nessun articolo aperto)', () => {
  const view = transitionCatalogView({ category: 'all', selectedProductId: 1 }, { type: 'back-to-catalog' });
  assert.equal(view.selectedProductId, null);
  assert.equal(filterProducts(PRODUCTS, { category: view.category }).length, PRODUCTS.length);
});

/** §REQ:SCHD-PRDT-MQI-030 */
test('SCHD-030: Indietro dalla scheda di Cornice Atelier mantiene la categoria Cornici con 1 articolo', () => {
  const cornice = byName('Cornice Atelier');
  const view = transitionCatalogView({ category: 'cornici', selectedProductId: cornice.id }, { type: 'back-to-catalog' });
  assert.equal(view.selectedProductId, null);
  assert.equal(view.category, 'cornici');
  const visibili = filterProducts(PRODUCTS, { category: view.category });
  assert.equal(visibili.length, 1);
  assert.equal(visibili[0].name, 'Cornice Atelier');
});

const INFORMAZIONI = [
  ['Lampada Lume', 'Dimensioni', 'altezza 45 cm, diametro paralume 28 cm, diametro base 16 cm'],
  ['Lampada Lume', 'Materiali', 'lino, metallo, porta lampadina in acciaio inox'],
  ['Lampada Lume', 'Provenienza', 'Made in Italy'],
  ['Specchio Orbita', 'Dimensioni', 'diametro 100 cm'],
  ['Specchio Orbita', 'Materiali', 'metallo, vetro, retro in truciolato'],
  ['Specchio Orbita', 'Provenienza', 'Made in Italy'],
  ['Cornice Atelier', 'Dimensioni', '40 x 60 cm'],
  ['Cornice Atelier', 'Materiali', 'plastica, vetro antiriflesso, retro in sughero, ganci in acciaio'],
  ['Cornice Atelier', 'Provenienza', 'Made in Italy'],
  ['Candela Vaniglia', 'Dimensioni', 'altezza 10 cm, diametro 8,5 cm, peso della cera 275 g'],
  ['Candela Vaniglia', 'Materiali', 'cera vegetale, vasetto in vetro'],
  ['Candela Vaniglia', 'Provenienza', 'Made in Italy'],
  ['Portavaso Trama', 'Dimensioni', 'diametro esterno 34 cm, diametro interno 27 cm, altezza 33 cm'],
  ['Portavaso Trama', 'Materiali', 'rattan naturale, fondo impermeabile'],
  ['Portavaso Trama', 'Provenienza', 'Made in Italy'],
  ['Vaso Duna', 'Dimensioni', 'altezza 30 cm, diametro pancia 22 cm, imboccatura 13 cm, base 11 cm'],
  ['Vaso Duna', 'Materiali', 'ceramica smaltata'],
  ['Vaso Duna', 'Colore', 'bianco latte e arancione'],
  ['Vaso Duna', 'Provenienza', 'Made in Italy']
];

/** §REQ:SCHD-PRDT-MQI-040 */
test('SCHD-040: la scheda mostra dimensioni, materiali, colore (Vaso Duna) e provenienza di ogni articolo', () => {
  for (const [name, voce, valore] of INFORMAZIONI) {
    const html = renderProductDetailMarkup(byName(name));
    assert.equal(infoRow(html, voce), valore, `${name} — ${voce}`);
  }
});
