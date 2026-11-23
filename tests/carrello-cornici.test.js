import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateCartTotal } from '../catalog-logic.js';
import { createFrameCartItem, getFrameCartId } from '../public/cart-logic.js';

const CLASSICO = { measure: '13x18', profile: 'classico', mat: 'bianco' };
const CONTEMPORANEO = { measure: '13x18', profile: 'contemporaneo', mat: 'bianco' };

/**
 * §REQ:CRRL-CRNC-PRSN-BCS-010
 * Aggiungere una cornice personalizzata: riga "Cornice su misura" a 30,90 euro con la descrizione delle scelte.
 */
test('CRRL-CRNC-PRSN-BCS-010: la cornice 13x18 Classico/Bianco entra nel carrello a 30,90 con la sua descrizione', () => {
  const cart = [createFrameCartItem(CLASSICO)];

  assert.equal(cart.length, 1);
  assert.equal(cart[0].name, 'Cornice su misura');
  assert.equal(Math.round(cart[0].price * 100), 3090);
  assert.equal(cart[0].frameDescription, '13x18 cm, Classico, passe-partout Bianco');
});

/**
 * §REQ:CRRL-CRNC-PRSN-BCS-020
 * Cornice con foto: la riga riporta la stampa omaggio e il prezzo resta 30,90.
 */
test('CRRL-CRNC-PRSN-BCS-020: con la foto mare.jpg la riga riporta la stampa omaggio e costa 30,90', () => {
  const item = createFrameCartItem(CLASSICO, { name: 'mare.jpg', url: 'blob:mare' });

  assert.match(item.frameDescription, /Stampa foto su carta fotografica: omaggio/);
  assert.match(item.frameDescription, /^13x18 cm, Classico, passe-partout Bianco/);
  assert.equal(Math.round(item.price * 100), 3090);
});

/**
 * §REQ:CRRL-CRNC-PRSN-BCS-030
 * Cornici con scelte diverse sono righe separate; subtotale 63,80.
 */
test('CRRL-CRNC-PRSN-BCS-030: Classico e Contemporaneo sono due righe e il subtotale è 63,80', () => {
  const cart = [createFrameCartItem(CLASSICO), createFrameCartItem(CONTEMPORANEO)];

  assert.notEqual(getFrameCartId(CLASSICO), getFrameCartId(CONTEMPORANEO));
  assert.equal(new Set(cart.map(({ id }) => id)).size, 2);
  assert.equal(cart.filter(({ name }) => name === 'Cornice su misura').length, 2);
  assert.equal(Math.round(calculateCartTotal(cart).subtotal * 100), 6380);
});
