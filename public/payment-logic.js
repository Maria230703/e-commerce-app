export const PAYMENT_METHODS = [
  { value: 'card', label: 'Carta di credito' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank-transfer', label: 'Bonifico bancario' }
];

export const EUROPEAN_PHONE_PREFIXES = [
  { country: 'Albania', value: '+355' },
  { country: 'Andorra', value: '+376' },
  { country: 'Armenia', value: '+374' },
  { country: 'Austria', value: '+43' },
  { country: 'Azerbaigian', value: '+994' },
  { country: 'Belgio', value: '+32' },
  { country: 'Bielorussia', value: '+375' },
  { country: 'Bosnia ed Erzegovina', value: '+387' },
  { country: 'Bulgaria', value: '+359' },
  { country: 'Cipro', value: '+357' },
  { country: 'Croazia', value: '+385' },
  { country: 'Danimarca', value: '+45' },
  { country: 'Estonia', value: '+372' },
  { country: 'Finlandia', value: '+358' },
  { country: 'Francia', value: '+33' },
  { country: 'Georgia', value: '+995' },
  { country: 'Germania', value: '+49' },
  { country: 'Grecia', value: '+30' },
  { country: 'Irlanda', value: '+353' },
  { country: 'Islanda', value: '+354' },
  { country: 'Italia', value: '+39' },
  { country: 'Kosovo', value: '+383' },
  { country: 'Lettonia', value: '+371' },
  { country: 'Liechtenstein', value: '+423' },
  { country: 'Lituania', value: '+370' },
  { country: 'Lussemburgo', value: '+352' },
  { country: 'Macedonia del Nord', value: '+389' },
  { country: 'Malta', value: '+356' },
  { country: 'Moldavia', value: '+373' },
  { country: 'Monaco', value: '+377' },
  { country: 'Montenegro', value: '+382' },
  { country: 'Norvegia', value: '+47' },
  { country: 'Paesi Bassi', value: '+31' },
  { country: 'Polonia', value: '+48' },
  { country: 'Portogallo', value: '+351' },
  { country: 'Regno Unito', value: '+44' },
  { country: 'Repubblica Ceca', value: '+420' },
  { country: 'Romania', value: '+40' },
  { country: 'Russia', value: '+7' },
  { country: 'San Marino', value: '+378' },
  { country: 'Serbia', value: '+381' },
  { country: 'Slovacchia', value: '+421' },
  { country: 'Slovenia', value: '+386' },
  { country: 'Spagna', value: '+34' },
  { country: 'Svezia', value: '+46' },
  { country: 'Svizzera', value: '+41' },
  { country: 'Turchia', value: '+90' },
  { country: 'Ucraina', value: '+380' },
  { country: 'Ungheria', value: '+36' }
];

export function validateShippingAddress(address) {
  const errors = {};
  const name = typeof address.name === 'string' ? address.name.trim() : '';
  const surname = typeof address.surname === 'string' ? address.surname.trim() : '';
  const streetAddress = typeof address.address === 'string' ? address.address.trim() : '';
  const postalCode = typeof address.postalCode === 'string' ? address.postalCode.trim() : '';
  const city = typeof address.city === 'string' ? address.city.trim() : '';
  const phonePrefix = typeof address.phonePrefix === 'string' ? address.phonePrefix : '';
  const phone = typeof address.phone === 'string' ? address.phone.trim() : '';
  const email = typeof address.email === 'string' ? address.email.trim() : '';

  if (!name) {
    errors.name = 'Inserisci il nome';
  }

  if (!surname) {
    errors.surname = 'Inserisci il cognome';
  }

  if (!streetAddress) {
    errors.address = "Inserisci l'indirizzo";
  }

  if (!city) {
    errors.city = 'Inserisci la città';
  }

  if (!postalCode) {
    errors.postalCode = 'Inserisci il CAP';
  } else if (!/^\d{5}$/.test(postalCode)) {
    errors.postalCode = 'Il CAP deve avere 5 cifre';
  }

  if (!EUROPEAN_PHONE_PREFIXES.some(({ value }) => value === phonePrefix)) {
    errors.phonePrefix = 'Seleziona un prefisso internazionale valido';
  }

  if (!phone) {
    errors.phone = 'Inserisci il numero di telefono';
  } else if (!/^\d{6,15}$/.test(phone.replace(/[ .()-]/g, ''))) {
    errors.phone = 'Inserisci un numero di telefono valido';
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
    return 'Inserisci un CVV valido';
  }

  if (number === '4000000000000002') {
    return "Pagamento rifiutato. Prova con un'altra carta.";
  }

  if (number !== '4242424242424242') {
    return "Pagamento rifiutato. Prova con un'altra carta.";
  }

  return null;
}
