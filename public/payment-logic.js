export const PAYMENT_METHODS = [
  { value: 'card', label: 'Carta di credito' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank-transfer', label: 'Bonifico bancario' }
];

export function validateShippingAddress(address) {
  const errors = {};
  const name = typeof address.name === 'string' ? address.name.trim() : '';
  const streetAddress = typeof address.address === 'string' ? address.address.trim() : '';
  const postalCode = typeof address.postalCode === 'string' ? address.postalCode.trim() : '';
  const city = typeof address.city === 'string' ? address.city.trim() : '';
  const email = typeof address.email === 'string' ? address.email.trim() : '';

  if (!name) {
    errors.name = 'Inserisci il nome';
  }

  if (!streetAddress) {
    errors.address = "Inserisci l'indirizzo";
  }

  if (!postalCode) {
    errors.postalCode = 'Inserisci il CAP';
  } else if (!/^\d{5}$/.test(postalCode)) {
    errors.postalCode = 'Il CAP deve avere 5 cifre';
  }

  if (!city) {
    errors.city = 'Inserisci la città';
  }

  if (!email) {
    errors.email = "Inserisci l'email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Inserisci un'email valida";
  }

  return errors;
}

export function validateCardPayment(card, now = new Date()) {
  const number = card.number.replace(/\s/g, '');
  if (!number) {
    return 'Inserisci il numero della carta';
  }

  if (!/^\d{16}$/.test(number)) {
    return 'Inserisci un numero di carta valido';
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
    return 'Inserisci una scadenza valida (MM/AA)';
  }

  const [month, shortYear] = card.expiry.split('/').map(Number);
  const year = 2000 + shortYear;
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return 'La carta è scaduta';
  }

  if (!/^\d{3,4}$/.test(card.code)) {
    return 'Inserisci un codice valido';
  }

  if (number === '4000000000000002') {
    return "Pagamento rifiutato. Prova con un'altra carta.";
  }

  if (number !== '4242424242424242') {
    return "Pagamento rifiutato. Prova con un'altra carta.";
  }

  return null;
}
