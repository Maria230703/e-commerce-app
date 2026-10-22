import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  calculateCartTotalCents,
  PRODUCTS
} from '../catalog-logic.js';
import {
  validateCardPayment,
  validateShippingAddress
} from '../public/payment-logic.js';
import {
  calculateDiscountedCartTotals,
  COUPON_CODE,
  validateCouponCode
} from '../public/coupon-logic.js';
import {
  renderCartPageMarkup,
  renderPaymentPageMarkup
} from '../public/payment-ui.js';
import { createOrder } from '../orders.js';
import { INITIAL_FRAME_SELECTION } from '../public/frame-logic.js';
import { createFrameCartItem } from '../public/cart-logic.js';

const validAddress = {
  name: 'Maria',
  surname: 'Rossi',
  address: 'Via Roma 1',
  postalCode: '20100',
  city: 'Milano',
  phonePrefix: '+39',
  phone: '3331234567',
  email: 'maria@example.it'
};

const vasoCart = [{ ...PRODUCTS.find(({ name }) => name === 'Vaso Duna'), quantity: 1 }];

test('valida i campi obbligatori e i formati di CAP ed email', () => {
  assert.deepEqual(validateShippingAddress({}), {
    name: 'Inserisci il nome',
    surname: 'Inserisci il cognome',
    address: "Inserisci l'indirizzo",
    postalCode: 'Inserisci il CAP',
    city: 'Inserisci la città',
    phonePrefix: 'Seleziona un prefisso internazionale valido',
    phone: 'Inserisci il numero di telefono',
    email: "Inserisci l'email"
  });
  assert.deepEqual(validateShippingAddress({
    ...validAddress,
    postalCode: '123',
    email: 'maria.esempio.it'
  }), {
    postalCode: 'Il CAP deve avere 5 cifre',
    email: "Inserisci un'email valida"
  });
  assert.deepEqual(validateShippingAddress(validAddress), {});
  assert.deepEqual(validateShippingAddress({
    ...validAddress,
    phone: '333 123 4567'
  }), {});
  assert.equal(validateShippingAddress({
    ...validAddress,
    phone: '333-ABC'
  }).phone, 'Inserisci un numero di telefono valido');
});

test('la carta simulata accetta la carta di prova, rifiuta la carta di test e controlla la scadenza', () => {
  assert.equal(validateCardPayment({
    number: '4242 4242 4242 4242',
    expiry: '12/30',
    code: '123'
  }), null);
  assert.equal(validateCardPayment({
    number: '4000 0000 0000 0002',
    expiry: '12/30',
    code: '123'
  }), "Pagamento rifiutato. Prova con un'altra carta.");
  assert.equal(validateCardPayment({
    number: '4242 4242 4242 4242',
    expiry: '01/20',
    code: '123'
  }), 'La carta è scaduta');
});

test('il totale del carrello usa centesimi e calcola la spedizione al limite corretto', () => {
  assert.deepEqual(calculateCartTotalCents(vasoCart), {
    subtotalCents: 3400,
    shippingCents: 490,
    totalCents: 3890
  });
  assert.deepEqual(calculateCartTotalCents([
    { price: 78.9, quantity: 1 }
  ]), {
    subtotalCents: 7890,
    shippingCents: 490,
    totalCents: 8380
  });
  assert.deepEqual(calculateCartTotalCents([
    { price: 79, quantity: 1 }
  ]), {
    subtotalCents: 7900,
    shippingCents: 0,
    totalCents: 7900
  });
});

test('il coupon ESEMPIO10 sconta del 10% solo sui carrelli oltre 50 euro', () => {
  const lampada = [{ ...PRODUCTS.find(({ name }) => name === 'Lampada Lume'), quantity: 1 }];
  const portavaso = [{ ...PRODUCTS.find(({ name }) => name === 'Portavaso Trama'), quantity: 1 }];
  const importoEsattoSoglia = [{ price: 50, quantity: 1 }];

  assert.equal(validateCouponCode(COUPON_CODE, 5001), null);
  assert.equal(validateCouponCode(COUPON_CODE, 5000), 'Il coupon è disponibile per acquisti superiori a 50,00 €');
  assert.equal(validateCouponCode('NONVALIDO', 8900), 'Codice coupon non valido');
  assert.deepEqual(calculateDiscountedCartTotals(lampada, COUPON_CODE), {
    subtotalCents: 8900,
    shippingCents: 0,
    discountCents: 890,
    totalCents: 8010
  });
  assert.equal(calculateDiscountedCartTotals(portavaso, COUPON_CODE).totalCents, 4990);
  assert.equal(calculateDiscountedCartTotals(importoEsattoSoglia, COUPON_CODE).discountCents, 0);
});

test('la pagina riepiloga il totale e non preseleziona un metodo', () => {
  const markup = renderPaymentPageMarkup({ items: vasoCart });

  assert.match(markup, /Vaso Duna × 1/);
  assert.match(markup, /Spedizione<\/span>\s*<strong>4,90\s€</);
  assert.match(markup, /Totale<\/span>\s*<strong>38,90\s€</);
  assert.match(markup, /<label for="shipping-name">Nome<\/label>/);
  assert.match(markup, /<label for="shipping-surname">Cognome<\/label>/);
  assert.match(markup, /<label for="shipping-phone">Numero di telefono<\/label>/);
  assert.match(markup, /<option value="\+39" selected>Italia \(\+39\)<\/option>/);
  assert.match(markup, /<option value="\+33">Francia \(\+33\)<\/option>/);
  assert.ok(markup.indexOf('shipping-name') < markup.indexOf('shipping-surname'));
  assert.ok(markup.indexOf('shipping-surname') < markup.indexOf('shipping-address'));
  assert.ok(markup.indexOf('shipping-address') < markup.indexOf('shipping-city'));
  assert.ok(markup.indexOf('shipping-city') < markup.indexOf('shipping-postalCode'));
  assert.ok(markup.indexOf('shipping-postalCode') < markup.indexOf('shipping-phone'));
  assert.ok(markup.indexOf('shipping-phone') < markup.indexOf('shipping-email'));
  assert.equal((markup.match(/type="radio"/g) ?? []).length, 3);
  assert.doesNotMatch(markup, /checked/);
  assert.match(markup, /Carta di credito/);
  assert.match(markup, /PayPal/);
  assert.match(markup, /Bonifico bancario/);
});

test('il carrello offre il pagamento solo se contiene articoli', () => {
  assert.doesNotMatch(renderCartPageMarkup([]), /Vai al pagamento/);
  assert.match(renderCartPageMarkup(vasoCart), /href="\/pagamento">Vai al pagamento<\/a>/);
});

test('il riepilogo del carrello e del pagamento mostra il coupon applicato', () => {
  const lampada = [{ ...PRODUCTS.find(({ name }) => name === 'Lampada Lume'), quantity: 1 }];
  const cartMarkup = renderCartPageMarkup(lampada, COUPON_CODE);
  const paymentMarkup = renderPaymentPageMarkup({ items: lampada, couponCode: COUPON_CODE });

  assert.match(cartMarkup, /Sconto coupon<\/span><strong>−8,90\s€<\/strong>/);
  assert.match(cartMarkup, /Totale<\/span><strong>80,10\s€<\/strong>/);
  assert.match(paymentMarkup, /Sconto coupon<\/span><strong>−8,90\s€<\/strong>/);
  assert.match(paymentMarkup, /Totale<\/span><strong>80,10\s€<\/strong>/);
  assert.doesNotMatch(renderCartPageMarkup(vasoCart, COUPON_CODE), /Sconto coupon/);
});

test('la conferma per bonifico indica lo stato e i dati fittizi per il pagamento', () => {
  const markup = renderPaymentPageMarkup({
    items: [],
    stage: 'confirmation',
    errors: {
      orderNumber: 'ORD-20261021-ABCDEF12',
      orderStatus: 'In attesa di pagamento',
      totalCents: 3890,
      customerName: 'Maria',
      customerSurname: 'Rossi',
      customerAddress: 'Via Roma 1',
      customerPostalCode: '20100',
      customerCity: 'Milano',
      customerPhonePrefix: '+39',
      customerPhone: '3331234567',
      customerEmail: 'maria@example.it',
      bankTransfer: true
    }
  });

  assert.match(markup, /Ordine confermato/);
  assert.match(markup, /In attesa di pagamento/);
  assert.match(markup, /Totale da pagare/);
  assert.match(markup, /IBAN di prova \(fittizio\)/);
  assert.match(markup, /Causale:/);
  assert.match(markup, /ORD-20261021-ABCDEF12/);
  assert.match(markup, /Maria Rossi/);
  assert.match(markup, /\+39 3331234567/);
});

test('gli ordini salvati non includono dati di carta e il bonifico resta in attesa', async () => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'ecommerce-orders-'));
  const ordersFile = path.join(temporaryDirectory, 'orders.json');

  try {
    const order = await createOrder({
      items: [{ id: 4, quantity: 1 }],
      address: validAddress,
      paymentMethod: 'bank-transfer',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/30',
      code: '123'
    }, ordersFile);
    const storedText = await fs.readFile(ordersFile, 'utf8');
    const storedOrders = JSON.parse(storedText);

    assert.match(order.number, /^ORD-\d{8}-[A-F0-9]{8}$/);
    assert.equal(order.status, 'In attesa di pagamento');
    assert.equal(order.totalCents, 3890);
    assert.deepEqual(order.address, validAddress);
    assert.deepEqual(storedOrders, [order]);
    assert.doesNotMatch(storedText, /cardNumber|expiry|code|4242/);
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('gli ordini applicano il coupon valido e rifiutano quello non applicabile', async () => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'ecommerce-coupon-order-'));
  const ordersFile = path.join(temporaryDirectory, 'orders.json');
  const lampada = PRODUCTS.find(({ name }) => name === 'Lampada Lume');

  try {
    const order = await createOrder({
      items: [{ id: lampada.id, quantity: 1 }],
      address: validAddress,
      paymentMethod: 'card',
      couponCode: COUPON_CODE
    }, ordersFile);

    assert.equal(order.subtotalCents, 8900);
    assert.equal(order.discountCents, 890);
    assert.equal(order.totalCents, 8010);
    assert.equal(order.couponCode, COUPON_CODE);
    await assert.rejects(
      createOrder({
        items: [{ id: 3, quantity: 1 }],
        address: validAddress,
        paymentMethod: 'card',
        couponCode: COUPON_CODE
      }, path.join(temporaryDirectory, 'ineligible-orders.json')),
      /Il coupon è disponibile per acquisti superiori a 50,00 €/
    );
    await assert.rejects(
      createOrder({
        items: [{ id: lampada.id, quantity: 1 }],
        address: validAddress,
        paymentMethod: 'card',
        couponCode: 'NONVALIDO'
      }, path.join(temporaryDirectory, 'invalid-coupon-orders.json')),
      /Codice coupon non valido/
    );
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('il carrello e il pagamento accettano una cornice configurata', async () => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'ecommerce-frame-order-'));
  const ordersFile = path.join(temporaryDirectory, 'orders.json');

  try {
    const frame = createFrameCartItem(INITIAL_FRAME_SELECTION);
    const order = await createOrder({
      items: [{ id: frame.id, quantity: 1, frameSelection: frame.frameSelection }],
      address: validAddress,
      paymentMethod: 'card'
    }, ordersFile);

    assert.equal(order.items[0].name, 'Cornice su misura');
    assert.equal(order.items[0].frameDescription, '13x18 cm, Noce, Classico, passe-partout Bianco');
    assert.equal(order.totalCents, 4380);
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('rifiuta gli ordini senza indirizzo valido o senza articoli', async () => {
  await assert.rejects(
    createOrder({ items: [], address: validAddress, paymentMethod: 'card' }, path.join(os.tmpdir(), 'no-orders.json')),
    /Il carrello è vuoto/
  );
  await assert.rejects(
    createOrder({ items: [{ id: 4, quantity: 1 }], address: {}, paymentMethod: 'card' }, path.join(os.tmpdir(), 'no-orders.json')),
    /Dati di spedizione non validi/
  );
  await assert.rejects(
    createOrder({
      items: [{ id: 4, quantity: 1 }],
      address: { ...validAddress, phone: 'no' },
      paymentMethod: 'card'
    }, path.join(os.tmpdir(), 'invalid-phone-orders.json')),
    /Dati di spedizione non validi/
  );
});
