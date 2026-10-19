import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CATEGORIES,
  PRODUCTS,
  filterProducts,
  formatCurrency,
  calculateCartTotal,
  transitionCatalogView
} from '../catalog-logic.js';
import { renderProductDetailMarkup } from '../public/product-detail.js';

test('il catalogo contiene i 6 articoli di arredamento richiesti', () => {
  assert.equal(PRODUCTS.length, 6);
  assert.deepEqual(CATEGORIES.map(({ label }) => label), [
    'Tutti',
    'Arredo',
    'Oggettistica',
    'Cornici'
  ]);
  assert.deepEqual(
    PRODUCTS.map(({ name, category, price }) => ({ name, category, price })),
    [
      { name: 'Lampada Lume', category: 'arredo', price: 89 },
      { name: 'Specchio Orbita', category: 'arredo', price: 119 },
      { name: 'Portavaso Trama', category: 'arredo', price: 45 },
      { name: 'Vaso Duna', category: 'oggettistica', price: 34 },
      { name: 'Candela Vaniglia', category: 'oggettistica', price: 22 },
      { name: 'Cornice Atelier', category: 'cornici', price: 29 }
    ]
  );
  assert.equal(filterProducts(PRODUCTS, { category: 'cornici' }).length, 1);
});

test('filtra prodotti per categoria arredo', () => {
  const filtered = filterProducts(PRODUCTS, { category: 'arredo' });

  assert.equal(filtered.length, 3);
  assert.ok(filtered.every((product) => product.category === 'arredo'));
});

test('ricerca per nome del prodotto', () => {
  const filtered = filterProducts(PRODUCTS, { search: 'Vaso' });

  assert.equal(filtered.length, 2);
  assert.deepEqual(filtered.map((product) => product.name), ['Portavaso Trama', 'Vaso Duna']);
});

test('apre la scheda dell’articolo selezionato', () => {
  const view = transitionCatalogView(
    { category: 'oggettistica', selectedProductId: null },
    { type: 'open-product', productId: 4 }
  );

  assert.equal(view.selectedProductId, 4);
  assert.equal(view.category, 'oggettistica');
});

test('la scheda contiene nome, prezzo e descrizione del prodotto', () => {
  const product = PRODUCTS.find(({ id }) => id === 4);
  const markup = renderProductDetailMarkup(product);

  assert.match(markup, /<button class="back-button" type="button">Indietro<\/button>/);
  assert.match(markup, /<h2 id="product-detail-title">Vaso Duna<\/h2>/);
  assert.ok(markup.includes(`<p class="price">${formatCurrency(product.price)}</p>`));
  assert.match(markup, /<p class="product-detail-description">Ceramica smaltata a mano con finitura opaca\.<\/p>/);
});

test('il catalogo usa le descrizioni aggiornate per tutti gli articoli', () => {
  assert.deepEqual(
    PRODUCTS.map(({ name, description }) => ({ name, description })),
    [
      { name: 'Lampada Lume', description: 'Paralume in lino e base in metallo. Luce calda e diffusa.' },
      { name: 'Specchio Orbita', description: 'Specchio tondo con bordo sottile in metallo.' },
      { name: 'Portavaso Trama', description: 'Intreccio in rattan naturale con fondo impermeabile.' },
      { name: 'Vaso Duna', description: 'Ceramica smaltata a mano con finitura opaca.' },
      { name: 'Candela Vaniglia', description: 'Cera vegetale in vasetto di vetro riutilizzabile.' },
      { name: 'Cornice Atelier', description: 'Profilo in legno con vetro antiriflesso.' }
    ]
  );
});

test('Indietro torna al catalogo mantenendo la categoria scelta', () => {
  const view = transitionCatalogView(
    { category: 'oggettistica', selectedProductId: 4 },
    { type: 'back-to-catalog' }
  );

  assert.equal(view.selectedProductId, null);
  assert.equal(view.category, 'oggettistica');
});

test('ordina per prezzo crescente', () => {
  const filtered = filterProducts(PRODUCTS, { sort: 'price-asc' });

  assert.ok(filtered[0].price <= filtered[1].price);
});

test('calcola subtotale, spedizione e totale', () => {
  const cart = [
    { id: 1, name: 'Lampada Lume', price: 89, quantity: 1 },
    { id: 6, name: 'Cornice Atelier', price: 29, quantity: 1 }
  ];

  const totals = calculateCartTotal(cart);

  assert.equal(totals.subtotal, 118);
  assert.equal(totals.shipping, 0);
  assert.equal(totals.total, 118);
  assert.equal(totals.itemCount, 2);
});
