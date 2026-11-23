import test from 'node:test';
import assert from 'node:assert/strict';

import { PRODUCTS } from '../catalog-logic.js';
import { validatePaymentSubmission } from '../public/payment-logic.js';
import { renderCartPageMarkup, renderPaymentPageMarkup } from '../public/payment-ui.js';
import { createOrder } from '../orders.js';

const validAddress = {
  name: 'Maria', surname: 'Rossi', address: 'Via Roma 1', postalCode: '20100',
  city: 'Milano', phonePrefix: '+39', phone: '3331234567', email: 'maria@example.it'
};
const vaso = [{ ...PRODUCTS.find(({ name }) => name === 'Vaso Duna'), quantity: 1 }];

/** §REQ:PGMN-DATI-DI-SPDZ-ICN-010 — dal carrello con un articolo si va alla pagina di pagamento. */
test('PGMN-010: il carrello offre il link al pagamento e la pagina mostra spedizione e metodi', () => {
  assert.match(renderCartPageMarkup(vaso), /href="\/pagamento">Vai al pagamento<\/a>/);
  assert.match(renderCartPageMarkup(vaso), /Totale<\/span><strong>38,90\s€/);
  const page = renderPaymentPageMarkup({ items: vaso });
  assert.match(page, /<h2 id="shipping-title">Dati di spedizione<\/h2>/);
  assert.match(page, /<legend>Metodo di pagamento<\/legend>/);
});

/** §REQ:PGMN-DATI-DI-SPDZ-ICN-020 — carrello vuoto: nessun pulsante "Vai al pagamento". */
test('PGMN-020: con il carrello vuoto non c\'è "Vai al pagamento"', () => {
  assert.doesNotMatch(renderCartPageMarkup([]), /Vai al pagamento/);
});

/** §REQ:PGMN-DATI-DI-SPDZ-ICN-030 — tre metodi, nessuno preselezionato. */
test('PGMN-030: metodi Carta di credito, PayPal, Bonifico bancario e nessuno selezionato', () => {
  const page = renderPaymentPageMarkup({ items: vaso });
  for (const label of ['Carta di credito', 'PayPal', 'Bonifico bancario']) {
    assert.ok(page.includes(label), label);
  }
  assert.equal((page.match(/type="radio"/g) ?? []).length, 3);
  assert.doesNotMatch(page, /checked/);
});

/** §REQ:PGMN-DATI-DI-SPDZ-ICN-040 — ogni campo obbligatorio mancante dà il suo messaggio e l'ordine non parte. */
test('PGMN-040: campo obbligatorio mancante → messaggio e ordine non confermato', async () => {
  const cases = [
    ['name', 'name', 'Inserisci il nome'],
    ['surname', 'surname', 'Inserisci il cognome'],
    ['address', 'address', "Inserisci l'indirizzo"],
    ['city', 'city', 'Inserisci la città'],
    ['postalCode', 'postalCode', 'Inserisci il CAP'],
    ['phone', 'phone', 'Inserisci il numero di telefono'],
    ['email', 'email', "Inserisci l'email"]
  ];
  for (const [field, key, message] of cases) {
    const address = { ...validAddress, [field]: '' };
    assert.equal(validatePaymentSubmission(address, 'card')[key], message, field);
    await assert.rejects(
      createOrder({ items: [{ id: 4, quantity: 1 }], address, paymentMethod: 'card' }, '/tmp/pgmn-040-never-written.json'),
      /Dati di spedizione non validi/
    );
  }
});

/** §REQ:PGMN-DATI-DI-SPDZ-ICN-050 — prefisso europeo +33 selezionabile e mantenuto. */
test('PGMN-050: il prefisso +33 è selezionato per il numero inserito', () => {
  const page = renderPaymentPageMarkup({ items: vaso, address: { ...validAddress, phonePrefix: '+33', phone: '3331234567' } });
  assert.match(page, /<option value="\+33" selected>Francia \(\+33\)<\/option>/);
  assert.doesNotMatch(page, /<option value="\+39" selected>/);
  assert.deepEqual(validatePaymentSubmission({ ...validAddress, phonePrefix: '+33' }, 'card'), {});
});

/** §REQ:PGMN-DATI-DI-SPDZ-ICN-060 — CAP "123" non valido. */
test('PGMN-060: CAP di 3 cifre → "Il CAP deve avere 5 cifre"', () => {
  assert.equal(validatePaymentSubmission({ ...validAddress, postalCode: '123' }, 'card').postalCode, 'Il CAP deve avere 5 cifre');
  assert.equal(validatePaymentSubmission({ ...validAddress, postalCode: '20100' }, 'card').postalCode, undefined);
});

/** §REQ:PGMN-DATI-DI-SPDZ-ICN-070 — email senza chiocciola non valida. */
test('PGMN-070: email "maria.esempio.it" → "Inserisci un\'email valida"', () => {
  assert.equal(validatePaymentSubmission({ ...validAddress, email: 'maria.esempio.it' }, 'card').email, "Inserisci un'email valida");
  assert.equal(validatePaymentSubmission(validAddress, 'card').email, undefined);
});

/** §REQ:PGMN-DATI-DI-SPDZ-ICN-080 — dati corretti ma nessun metodo: messaggio e ordine non confermato. */
test('PGMN-080: nessun metodo scelto → "Scegli un metodo di pagamento"', async () => {
  assert.deepEqual(validatePaymentSubmission(validAddress, ''), { paymentMethod: 'Scegli un metodo di pagamento' });
  assert.deepEqual(validatePaymentSubmission(validAddress, 'paypal'), {});
  await assert.rejects(
    createOrder({ items: [{ id: 4, quantity: 1 }], address: validAddress, paymentMethod: '' }, '/tmp/pgmn-080-never-written.json')
  );
  const page = renderPaymentPageMarkup({ items: vaso, errors: { paymentMethod: 'Scegli un metodo di pagamento' } });
  assert.match(page, /role="alert">Scegli un metodo di pagamento<\/p>/);
});

/** §REQ:PGMN-DATI-DI-SPDZ-ICN-090 — riepilogo: Vaso Duna 34,00, spedizione 4,90, totale 38,90. */
test('PGMN-090: riepilogo dell\'ordine con articolo, spedizione e totale', () => {
  const page = renderPaymentPageMarkup({ items: vaso });
  assert.match(page, /Vaso Duna × 1<\/span>\s*<strong>34,00\s€<\/strong>/);
  assert.match(page, /Spedizione<\/span><strong>4,90\s€<\/strong>/);
  assert.match(page, /Totale<\/span><strong>38,90\s€<\/strong>/);
});
