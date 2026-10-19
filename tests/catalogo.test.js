import test from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORIES, PRODUCTS, filterProducts, calculateCartTotal } from '../catalog-logic.js';

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
