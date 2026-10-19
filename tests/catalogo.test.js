import test from 'node:test';
import assert from 'node:assert/strict';

import { PRODUCTS, filterProducts, calculateCartTotal } from '../catalog-logic.js';

test('il catalogo contiene 6 articoli e una sola cornice', () => {
  assert.equal(PRODUCTS.length, 6);
  assert.equal(filterProducts(PRODUCTS, { category: 'cornici' }).length, 1);
});

test('filtra prodotti per categoria audio', () => {
  const filtered = filterProducts(PRODUCTS, { category: 'audio' });

  assert.equal(filtered.length, 2);
  assert.ok(filtered.every((product) => product.category === 'audio'));
});

test('ricerca per nome del prodotto', () => {
  const filtered = filterProducts(PRODUCTS, { search: 'Laptop' });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].name, 'Laptop Nova 14');
});

test('ordina per prezzo crescente', () => {
  const filtered = filterProducts(PRODUCTS, { sort: 'price-asc' });

  assert.ok(filtered[0].price <= filtered[1].price);
});

test('calcola subtotale, spedizione e totale', () => {
  const cart = [
    { id: 1, name: 'Smartphone Apex X5', price: 499, quantity: 1 },
    { id: 6, name: 'Cornice Aura', price: 59, quantity: 1 }
  ];

  const totals = calculateCartTotal(cart);

  assert.equal(totals.subtotal, 558);
  assert.equal(totals.shipping, 0);
  assert.equal(totals.total, 558);
  assert.equal(totals.itemCount, 2);
});
