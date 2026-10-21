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
  renderCartPageMarkup,
  renderPaymentPageMarkup
} from '../public/payment-ui.js';
import { createOrder } from '../orders.js';

const validAddress = {
  name: 'Maria Rossi',
  address: 'Via Roma 1',
  postalCode: '20100',
  city: 'Milano',
  email: 'maria@example.it'
};

const vasoCart = [{ ...PRODUCTS.find(({ name }) => name === 'Vaso Duna'), quantity: 1 }];

test('valida i campi obbligatori e i formati di CAP ed email', () => {
  assert.deepEqual(validateShippingAddress({}), {
    name: 'Inserisci il nome',
    address: "Inserisci l'indirizzo",
    postalCode: 'Inserisci il CAP',
    city: 'Inserisci la città',
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

test('la pagina riepiloga il totale e non preseleziona un metodo', () => {
  const markup = renderPaymentPageMarkup({ items: vasoCart });

  assert.match(markup, /Vaso Duna × 1/);
  assert.match(markup, /Spedizione<\/span>\s*<strong>4,90\s€</);
  assert.match(markup, /Totale<\/span>\s*<strong>38,90\s€</);
  assert.match(markup, /<label for="shipping-name">Nome<\/label>/);
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

test('la conferma per bonifico indica lo stato e i dati fittizi per il pagamento', () => {
  const markup = renderPaymentPageMarkup({
    items: [],
    stage: 'confirmation',
    errors: {
      orderNumber: 'ORD-20261021-ABCDEF12',
      orderStatus: 'In attesa di pagamento',
      totalCents: 3890,
      customerName: 'Maria Rossi',
      customerAddress: 'Via Roma 1',
      customerPostalCode: '20100',
      customerCity: 'Milano',
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
    assert.deepEqual(storedOrders, [order]);
    assert.doesNotMatch(storedText, /cardNumber|expiry|code|4242/);
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
});
