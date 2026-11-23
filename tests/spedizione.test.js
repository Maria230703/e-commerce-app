import test from 'node:test';
import assert from 'node:assert/strict';

import * as catalog from '../catalog-logic.js';
import { renderCartPageMarkup, renderPaymentPageMarkup } from '../public/payment-ui.js';

const { PRODUCTS, calculateCartTotalCents } = catalog;
const NBSP = '(?:\\s|\\u00a0)';
const byName = (name) => PRODUCTS.find((product) => product.name === name);
const cartOf = (name, price = byName(name).price) => [{ ...byName(name), price, quantity: 1 }];
const euro = (cents) => new RegExp(`${(cents / 100).toFixed(2).replace('.', ',')}${NBSP}€`);

/** §REQ:SPDZ-STP-010 — costo della spedizione e totale per subtotale (soglia a 79,00 euro). */
test('SPDZ-010: spedizione 4,90 sotto 79,00 euro, gratuita da 79,00 euro in su', () => {
  const rows = [
    [3400, 490, 3890],
    [7890, 490, 8380],
    [7900, 0, 7900],
    [12300, 0, 12300]
  ];
  for (const [subtotalCents, shippingCents, totalCents] of rows) {
    const items = [{ price: subtotalCents / 100, quantity: 1 }];
    assert.deepEqual(calculateCartTotalCents(items), { subtotalCents, shippingCents, totalCents });
    const markup = renderCartPageMarkup(items.map((item) => ({ ...item, name: 'Articolo', id: 1 })));
    assert.match(markup, new RegExp(`Spedizione</span><strong>${shippingCents === 0 ? '0,00' : '4,90'}${NBSP}€`));
    assert.match(markup, new RegExp(`Totale</span><strong>${(totalCents / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '')}${NBSP}€`));
  }
});

/** §REQ:SPDZ-STP-020 — barra: quanto manca alla spedizione gratuita. */
test('SPDZ-020: con "Vaso Duna" (34,00) il riepilogo dice "Ti mancano 45,00 euro per la spedizione gratuita"', () => {
  const progress = catalog.getFreeShippingProgress(34 * 100);
  assert.equal(progress.unlocked, false);
  assert.equal(progress.remainingCents, 4500);
  assert.equal(progress.message, 'Ti mancano 45,00 euro per la spedizione gratuita');
  assert.ok(renderCartPageMarkup(cartOf('Vaso Duna')).includes('Ti mancano 45,00 euro per la spedizione gratuita'));
  assert.doesNotMatch(renderCartPageMarkup(cartOf('Vaso Duna')), /Spedizione gratuita sbloccata/);
});

/** §REQ:SPDZ-STP-030 — soglia raggiunta: "Spedizione gratuita sbloccata". */
test('SPDZ-030: con "Lampada Lume" (89,00) il riepilogo dice "Spedizione gratuita sbloccata"', () => {
  const progress = catalog.getFreeShippingProgress(byName('Lampada Lume').price * 100);
  assert.equal(progress.unlocked, true);
  assert.equal(progress.message, 'Spedizione gratuita sbloccata');
  const markup = renderCartPageMarkup(cartOf('Lampada Lume'));
  assert.ok(markup.includes('Spedizione gratuita sbloccata'));
  assert.doesNotMatch(markup, /Ti mancano/);
  assert.equal(catalog.getFreeShippingProgress(7900).message, 'Spedizione gratuita sbloccata');
});

/** §REQ:SPDZ-STP-040 — "Specchio Orbita" 119,00: al pagamento spedizione 0,00 e totale 119,00. */
test('SPDZ-040: al pagamento con "Specchio Orbita" la spedizione costa 0,00 euro e il totale è 119,00 euro', () => {
  const items = cartOf('Specchio Orbita', 119);
  assert.match(renderCartPageMarkup(items), /href="\/pagamento">Vai al pagamento<\/a>/);
  const page = renderPaymentPageMarkup({ items });
  assert.match(page, new RegExp(`Spedizione</span><strong>0,00${NBSP}€`));
  assert.match(page, new RegExp(`Totale</span><strong>119,00${NBSP}€`));
});

/** §REQ:SPDZ-STP-050 — "Vaso Duna" 34,00: al pagamento spedizione 4,90 e totale 38,90. */
test('SPDZ-050: al pagamento con "Vaso Duna" la spedizione costa 4,90 euro e il totale è 38,90 euro', () => {
  const items = cartOf('Vaso Duna', 34);
  const page = renderPaymentPageMarkup({ items });
  assert.match(page, new RegExp(`Spedizione</span><strong>4,90${NBSP}€`));
  assert.match(page, new RegExp(`Totale</span><strong>38,90${NBSP}€`));
});
