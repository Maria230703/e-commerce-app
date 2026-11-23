import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import { PRODUCTS, calculateCartTotalCents } from '../catalog-logic.js';
import * as coupon from '../public/coupon-logic.js';
import { renderPaymentPageMarkup } from '../public/payment-ui.js';

const { COUPON_CODE, calculateDiscountedCartTotals, validateCouponCode } = coupon;

const cartOf = (...names) => names.map((name) => ({
  ...PRODUCTS.find((product) => product.name === name),
  quantity: 1
}));

/** §REQ:CPN-DI-SCNT-QAD-010 */
test('CPN-010: Portavaso Trama (< 50 €) nel carrello: coupon non applicabile, totale invariato', () => {
  const items = cartOf('Portavaso Trama');
  const { subtotalCents } = calculateCartTotalCents(items);

  assert.ok(subtotalCents < 5000);
  assert.notEqual(validateCouponCode(COUPON_CODE, subtotalCents), null);
  const withCoupon = calculateDiscountedCartTotals(items, COUPON_CODE);
  assert.equal(withCoupon.discountCents, 0);
  assert.equal(withCoupon.totalCents, calculateCartTotalCents(items).totalCents);
});

/** §REQ:CPN-DI-SCNT-QAD-020 */
test('CPN-020: subtotale > 50 € sulla pagina iniziale: pulsante visibile sotto "Preferiti", stesso stile di "Vai al pagamento"', async () => {
  assert.equal(typeof coupon.isCouponButtonVisible, 'function');
  assert.equal(coupon.isCouponButtonVisible(5001), true);

  const html = await fs.readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const button = html.match(/<button id="coupon-copy" class="([^"]*)"[^>]*>([^<]*)<\/button>/);
  assert.ok(button, 'pulsante coupon assente');
  assert.equal(button[2], 'Coupon per te disponibile');
  assert.ok(html.indexOf('id="favorites-link"') < html.indexOf('id="coupon-container"'));
  assert.ok(html.indexOf('id="coupon-container"') < html.indexOf('</header>'));

  const checkout = html.match(/<a id="cart-checkout-button" class="([^"]*)"/);
  assert.ok(checkout);
  assert.ok(button[1].split(' ').includes('checkout-button'));
  assert.ok(checkout[1].split(' ').includes('checkout-button'));

  const css = await fs.readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.header-actions \.coupon-toggle,[\s\S]*?font: inherit;/);
});

/** §REQ:CPN-DI-SCNT-QAD-030 */
test('CPN-030: subtotale <= 50 € il pulsante coupon non è visibile', () => {
  assert.equal(typeof coupon.isCouponButtonVisible, 'function');
  assert.equal(coupon.isCouponButtonVisible(5000), false);
  assert.equal(coupon.isCouponButtonVisible(0), false);
  assert.equal(coupon.isCouponButtonVisible(4500), false);
});

/** §REQ:CPN-DI-SCNT-QAD-040 */
test('CPN-040: toccare il pulsante copia "FirstPurchase" negli appunti', async () => {
  assert.equal(typeof coupon.copyCouponCode, 'function');
  const copied = [];
  const result = await coupon.copyCouponCode({ writeText: async (text) => { copied.push(text); } });
  assert.deepEqual(copied, ['FirstPurchase']);
  assert.equal(result.copied, true);

  const failed = await coupon.copyCouponCode({ writeText: async () => { throw new Error('negato'); } });
  assert.equal(failed.copied, false);
  assert.match(failed.message, /FirstPurchase/);
});

/** §REQ:CPN-DI-SCNT-QAD-050 */
test('CPN-050: pagamento con Lampada Lume e FirstPurchase: sconto 10% e nuovo totale nel riepilogo', () => {
  const items = cartOf('Lampada Lume');
  const markup = renderPaymentPageMarkup({ items, couponCode: COUPON_CODE });

  assert.match(markup, /Inserisci qui il tuo codice sconto/);
  const totals = calculateDiscountedCartTotals(items, COUPON_CODE);
  assert.equal(totals.discountCents, Math.round(totals.subtotalCents * 0.1));
  assert.equal(totals.discountCents, 890);
  assert.match(markup, /Sconto coupon<\/span><strong>−8,90\s€<\/strong>/);
  assert.match(markup, /Totale<\/span><strong>80,10\s€<\/strong>/);
});

/** §REQ:CPN-DI-SCNT-QAD-060 */
for (const [name, applicable] of [
  ['Lampada Lume', true],
  ['Specchio Orbita', true],
  ['Portavaso Trama', false],
  ['Vaso Duna', false],
  ['Candela Vaniglia', false],
  ['Cornice Atelier', false]
]) {
  test(`CPN-060: ${name} -> coupon ${applicable ? 'può' : 'non può'} essere applicato`, () => {
    const { subtotalCents } = calculateCartTotalCents(cartOf(name));
    assert.equal(validateCouponCode(COUPON_CODE, subtotalCents) === null, applicable);
  });
}

/** §REQ:CPN-DI-SCNT-QAD-070 */
test('CPN-070: più articoli oltre 50 €: FirstPurchase vale il 10% e il totale si abbassa', () => {
  const items = cartOf('Vaso Duna', 'Candela Vaniglia'); // 34 + 22 = 56 €
  const plain = calculateCartTotalCents(items);
  assert.ok(plain.subtotalCents > 5000);

  assert.equal(validateCouponCode(COUPON_CODE, plain.subtotalCents), null);
  const discounted = calculateDiscountedCartTotals(items, COUPON_CODE);
  assert.equal(discounted.discountCents, 560);
  assert.ok(discounted.totalCents < plain.totalCents);
});
