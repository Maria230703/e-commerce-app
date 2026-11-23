import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { PRODUCTS } from '../catalog-logic.js';
import { validateCardPayment } from '../public/payment-logic.js';
import { renderPaymentPageMarkup } from '../public/payment-ui.js';
import { createOrder } from '../orders.js';
import { INITIAL_FRAME_SELECTION } from '../public/frame-logic.js';
import { createFrameCartItem, FRAME_PHOTO_PRINT_NOTE } from '../public/cart-logic.js';

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

const vaso = PRODUCTS.find(({ name }) => name === 'Vaso Duna');
const REJECTED = "Pagamento rifiutato. Prova con un'altra carta.";

async function withOrdersFile(run) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ecommerce-esito-'));
  try {
    return await run(path.join(dir, 'orders.json'));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

/** §REQ:PGMN-EST-ORDN-PEC-010 */
test('PEC-010: la carta di prova valida viene accettata e l\'ordine è confermato con numero e totale', async () => {
  assert.equal(
    validateCardPayment({ number: '4242 4242 4242 4242', expiry: '12/30', code: '123' }, new Date('2026-11-23')),
    null
  );
  await withOrdersFile(async (file) => {
    const order = await createOrder(
      { items: [{ id: vaso.id, quantity: 1 }], address: validAddress, paymentMethod: 'card' },
      file
    );
    assert.match(order.number, /^ORD-\d{8}-[A-F0-9]{8}$/);
    assert.equal(order.status, 'Confermato');
    assert.equal(order.totalCents, 3890);
  });
  const markup = renderPaymentPageMarkup({
    items: [],
    stage: 'confirmation',
    errors: { orderNumber: 'ORD-20261123-ABCDEF12', orderStatus: 'Confermato', totalCents: 3890 }
  });
  assert.match(markup, /Ordine confermato/);
  assert.match(markup, /ORD-20261123-ABCDEF12/);
  assert.match(markup, /Totale pagato: <strong>38,90\s€<\/strong>/);
});

/** §REQ:PGMN-EST-ORDN-PEC-020 */
test('PEC-020: la carta 4000 0000 0000 0002 è rifiutata con il messaggio previsto', () => {
  assert.equal(
    validateCardPayment({ number: '4000 0000 0000 0002', expiry: '12/30', code: '123' }, new Date('2026-11-23')),
    REJECTED
  );
});

/** §REQ:PGMN-EST-ORDN-PEC-030 */
test('PEC-030: la carta con scadenza 01/20 è scaduta, anche se il numero è valido', () => {
  assert.equal(
    validateCardPayment({ number: '4242 4242 4242 4242', expiry: '01/20', code: '123' }, new Date('2026-11-23')),
    'La carta è scaduta'
  );
  assert.equal(
    validateCardPayment({ number: '4242 4242 4242 4242', expiry: '11/26', code: '123' }, new Date('2026-11-23')),
    null
  );
});

/** §REQ:PGMN-EST-ORDN-PEC-040 */
test('PEC-040: PayPal mostra la schermata simulata e dopo l\'approvazione l\'ordine è confermato', async () => {
  const approval = renderPaymentPageMarkup({ items: [vaso], stage: 'paypal-approval' });
  assert.match(approval, /Schermata simulata di PayPal/);
  assert.match(approval, /paypal-approve/);
  await withOrdersFile(async (file) => {
    const order = await createOrder(
      { items: [{ id: vaso.id, quantity: 1 }], address: validAddress, paymentMethod: 'paypal' },
      file
    );
    assert.equal(order.status, 'Confermato');
    assert.equal(order.paymentMethod, 'paypal');
    assert.match(order.number, /^ORD-\d{8}-[A-F0-9]{8}$/);
  });
});

/** §REQ:PGMN-EST-ORDN-PEC-050 */
test('PEC-050: il bonifico mostra IBAN di prova e causale col numero d\'ordine, stato in attesa', async () => {
  const markup = renderPaymentPageMarkup({
    items: [],
    stage: 'confirmation',
    errors: { orderNumber: 'ORD-20261123-ABCDEF12', orderStatus: 'In attesa di pagamento', totalCents: 3890, bankTransfer: true }
  });
  assert.match(markup, /IBAN di prova/);
  assert.match(markup, /Causale: <strong>ORD-20261123-ABCDEF12<\/strong>/);
  assert.match(markup, /In attesa di pagamento/);
  await withOrdersFile(async (file) => {
    const order = await createOrder(
      { items: [{ id: vaso.id, quantity: 1 }], address: validAddress, paymentMethod: 'bank-transfer' },
      file
    );
    assert.equal(order.status, 'In attesa di pagamento');
  });
});

/** §REQ:PGMN-EST-ORDN-PEC-060 */
test('PEC-060: i dati della carta non vengono salvati e i campi si riaprono vuoti', async () => {
  await withOrdersFile(async (file) => {
    await createOrder({
      items: [{ id: vaso.id, quantity: 1 }],
      address: validAddress,
      paymentMethod: 'card',
      cardNumber: '4242 4242 4242 4242',
      cardExpiry: '12/30',
      cardCode: '987'
    }, file);
    const stored = await fs.readFile(file, 'utf8');
    assert.doesNotMatch(stored, /4242|12\/30|987|cardNumber|cardExpiry|cardCode/);
  });
  const reopened = renderPaymentPageMarkup({ items: [vaso], selectedMethod: 'card', address: validAddress });
  const cardFields = reopened.match(/<input[^>]*name="card(?:Number|Expiry|Code)"[^>]*>/g);
  assert.equal(cardFields.length, 3);
  for (const field of cardFields) {
    assert.doesNotMatch(field, /value="[^"]/);
  }
});

/** §REQ:PGMN-EST-ORDN-PEC-070 */
test('PEC-070: l\'ordine riporta la foto "mare.jpg" da stampare su carta fotografica', async () => {
  const frame = createFrameCartItem(INITIAL_FRAME_SELECTION, { name: 'mare.jpg', url: 'blob:mare' });
  assert.equal(frame.framePhotoName, 'mare.jpg');
  await withOrdersFile(async (file) => {
    const order = await createOrder({
      items: [{
        id: frame.id,
        quantity: 1,
        frameSelection: frame.frameSelection,
        framePhotoName: frame.framePhotoName
      }],
      address: validAddress,
      paymentMethod: 'card'
    }, file);
    const [item] = order.items;
    assert.equal(item.framePhotoName, 'mare.jpg');
    assert.match(item.frameDescription, new RegExp(FRAME_PHOTO_PRINT_NOTE));
    assert.deepEqual(JSON.parse(await fs.readFile(file, 'utf8'))[0].items[0], item);
  });
});
