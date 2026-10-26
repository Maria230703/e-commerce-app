import { formatCurrencyCents } from '../catalog-logic.js';
import { calculateDiscountedCartTotals } from './coupon-logic.js';
import { EUROPEAN_PHONE_PREFIXES, PAYMENT_METHODS } from './payment-logic.js';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function renderOrderSummary(items, couponCode) {
  const totals = calculateDiscountedCartTotals(items, couponCode);
  const rows = items.map((item) => `
    <div class="payment-summary-row">
      <span>${escapeHtml(item.name)}${item.frameDescription ? ` — ${escapeHtml(item.frameDescription)}` : ''} × ${item.quantity}</span>
      <strong>${formatCurrencyCents(Math.round(item.price * 100) * item.quantity)}</strong>
    </div>
  `).join('');

  return `
    <section class="payment-section" aria-labelledby="payment-summary-title">
      <h2 id="payment-summary-title">Riepilogo dell'ordine</h2>
      ${rows}
      <div class="payment-summary-row"><span>Subtotale</span><strong>${formatCurrencyCents(totals.subtotalCents)}</strong></div>
      <div class="payment-summary-row"><span>Spedizione</span><strong>${formatCurrencyCents(totals.shippingCents)}</strong></div>
      ${totals.discountCents > 0 ? `<div class="payment-summary-row"><span>Sconto coupon</span><strong>−${formatCurrencyCents(totals.discountCents)}</strong></div>` : ''}
      <div class="payment-summary-row total-row"><span>Totale</span><strong>${formatCurrencyCents(totals.totalCents)}</strong></div>
    </section>
  `;
}

function renderShippingField(name, label, type, error, autocomplete, value = '') {
  const id = `shipping-${name}`;
  return `
    <div class="payment-field">
      <label for="${id}">${label}</label>
      <input id="${id}" name="${name}" type="${type}" autocomplete="${autocomplete}" value="${escapeHtml(value)}" ${name === 'postalCode' ? 'inputmode="numeric" maxlength="5"' : ''}${name === 'cardNumber' ? ' inputmode="numeric" maxlength="19"' : ''}${name === 'cardExpiry' ? ' inputmode="numeric" maxlength="5"' : ''}${name === 'cardCode' ? ' inputmode="numeric" maxlength="4"' : ''}>
      <span class="payment-field-error" role="alert"${error ? '' : ' hidden'}>${escapeHtml(error ?? '')}</span>
    </div>
  `;
}

function renderPhoneField(errors, address) {
  return `
    <div class="payment-field">
      <label for="shipping-phone">Numero di telefono</label>
      <div class="phone-fields">
        <select id="shipping-phonePrefix" name="phonePrefix" autocomplete="tel-country-code" aria-label="Prefisso internazionale">
          ${EUROPEAN_PHONE_PREFIXES.map(({ country, value }) => `
            <option value="${value}"${(address.phonePrefix ?? '+39') === value ? ' selected' : ''}>${country} (${value})</option>
          `).join('')}
        </select>
        <input id="shipping-phone" name="phone" type="tel" autocomplete="tel-national" inputmode="tel" value="${escapeHtml(address.phone ?? '')}" aria-describedby="shipping-phone-error">
      </div>
      <span id="shipping-phone-error" class="payment-field-error" role="alert"${errors.phone ? '' : ' hidden'}>${escapeHtml(errors.phone ?? '')}</span>
      <span id="shipping-phone-prefix-error" class="payment-field-error" role="alert"${errors.phonePrefix ? '' : ' hidden'}>${escapeHtml(errors.phonePrefix ?? '')}</span>
    </div>
  `;
}

function renderCardFields(errors) {
  return `
    <fieldset class="payment-card-fields">
      <legend>Dati della carta (simulazione)</legend>
      ${renderShippingField('cardNumber', 'Numero carta', 'text', errors.cardNumber, 'off')}
      ${renderShippingField('cardExpiry', 'Scadenza (MM/AA)', 'text', errors.cardExpiry, 'off')}
      ${renderShippingField('cardCode', 'Codice CVV', 'password', errors.cardCode, 'off')}
      <p class="payment-field-error payment-card-general-error" role="alert"${errors.card ? '' : ' hidden'}>${escapeHtml(errors.card ?? '')}</p>
    </fieldset>
  `;
}

export function renderPaymentPageMarkup({
  items,
  selectedMethod = '',
  errors = {},
  stage = 'form',
  address = {},
  couponCode = '',
  couponInput = '',
  couponError = ''
}) {
  if (!items.length && stage !== 'confirmation') {
    return `
      <section class="payment-page" aria-labelledby="payment-page-title">
        <a class="back-button" href="/carrello">Torna al carrello</a>
        <a class="back-button" href="/scopri">Torna a Scopri</a>
        <h2 id="payment-page-title">Pagamento</h2>
        <p class="empty-cart">Il carrello è vuoto.</p>
      </section>
    `;
  }

  return `
    <section class="payment-page" aria-labelledby="payment-page-title">
      <a class="back-button" href="/carrello">Torna al carrello</a>
      <a class="back-button" href="/scopri">Torna a Scopri</a>
      <h2 id="payment-page-title">Pagamento</h2>
      ${stage === 'confirmation' ? '' : renderOrderSummary(items, couponCode)}
      ${stage === 'form' ? `
        <section class="payment-section payment-coupon" aria-labelledby="coupon-title">
          <h2 id="coupon-title">Codice sconto</h2>
          <form id="payment-coupon-form" novalidate>
            <label for="payment-coupon-input">Inserisci qui il tuo codice sconto</label>
            <div class="coupon-entry">
              <input id="payment-coupon-input" name="couponCode" type="text" placeholder="Inserisci qui il tuo codice sconto" autocomplete="off" value="${escapeHtml(couponInput)}" aria-describedby="payment-coupon-error">
              <button class="checkout-button coupon-apply" type="submit">${couponCode ? 'Aggiorna coupon' : 'Applica coupon'}</button>
            </div>
            <p id="payment-coupon-error" class="payment-field-error" role="alert"${couponError ? '' : ' hidden'}>${escapeHtml(couponError)}</p>
            ${couponCode ? `
              <p class="coupon-applied" role="status">Coupon ${escapeHtml(couponCode)} applicato</p>
              <button id="coupon-remove" class="coupon-remove" type="button">Rimuovi coupon</button>
            ` : ''}
          </form>
        </section>
        <form id="payment-form" novalidate>
          <section class="payment-section" aria-labelledby="shipping-title">
            <h2 id="shipping-title">Dati di spedizione</h2>
            ${renderShippingField('name', 'Nome', 'text', errors.name, 'name', address.name)}
            ${renderShippingField('surname', 'Cognome', 'text', errors.surname, 'family-name', address.surname)}
            ${renderShippingField('address', 'Indirizzo', 'text', errors.address, 'street-address', address.address)}
            ${renderShippingField('city', 'Città', 'text', errors.city, 'address-level2', address.city)}
            ${renderShippingField('postalCode', 'CAP', 'text', errors.postalCode, 'postal-code', address.postalCode)}
            ${renderPhoneField(errors, address)}
            ${renderShippingField('email', 'Email', 'email', errors.email, 'email', address.email)}
          </section>
          <fieldset class="payment-section payment-methods">
            <legend>Metodo di pagamento</legend>
            ${PAYMENT_METHODS.map(({ value, label }) => `
              <label class="payment-method">
                <input type="radio" name="paymentMethod" value="${value}"${selectedMethod === value ? ' checked' : ''}>
                ${label}
              </label>
            `).join('')}
            <p class="payment-field-error" role="alert"${errors.paymentMethod ? '' : ' hidden'}>${escapeHtml(errors.paymentMethod ?? '')}</p>
          </fieldset>
          ${selectedMethod === 'card' ? renderCardFields(errors) : ''}
          ${selectedMethod === 'bank-transfer' ? `
            <p>Bonifico bancario simulato. L'ordine sarà in attesa di pagamento.</p>
          ` : ''}
          <button class="checkout-button" type="submit">Conferma ordine</button>
          <p class="payment-request-error" role="alert"${errors.request ? '' : ' hidden'}>${escapeHtml(errors.request ?? '')}</p>
        </form>
      ` : ''}
      ${stage === 'paypal-approval' ? `
        <section class="paypal-simulation" aria-label="Schermata simulata di PayPal">
          <h2>PayPal (simulazione)</h2>
          <p>Approva il pagamento simulato per continuare.</p>
          <button class="back-button paypal-approve" type="button">Approva</button>
        </section>
      ` : ''}
      ${stage === 'confirmation' ? `
        <section class="payment-confirmation" aria-live="polite">
          <h2>Ordine confermato</h2>
          <p>Numero d'ordine: <strong>${escapeHtml(errors.orderNumber)}</strong></p>
          <p>Stato: <strong>${escapeHtml(errors.orderStatus)}</strong></p>
          <p>${errors.bankTransfer ? 'Totale da pagare' : 'Totale pagato'}: <strong>${formatCurrencyCents(errors.totalCents)}</strong></p>
          <h3>Dati di spedizione</h3>
          <p>${escapeHtml(errors.customerName)} ${escapeHtml(errors.customerSurname)}</p>
          <p>${escapeHtml(errors.customerAddress)}, ${escapeHtml(errors.customerPostalCode)} ${escapeHtml(errors.customerCity)}</p>
          <p>${escapeHtml(errors.customerPhonePrefix)} ${escapeHtml(errors.customerPhone)}</p>
          <p>${escapeHtml(errors.customerEmail)}</p>
          ${errors.bankTransfer ? `
            <p>IBAN di prova (fittizio): <strong>IT00 X000 0000 0000 0000 0000 000</strong></p>
            <p>Causale: <strong>${escapeHtml(errors.orderNumber)}</strong></p>
          ` : ''}
          <a class="back-button" href="/scopri">Torna a Scopri</a>
        </section>
      ` : ''}
    </section>
  `;
}

export function renderCartPageMarkup(items, couponCode = '') {
  if (!items.length) {
    return `
      <section class="cart-page">
        <p class="empty-cart">Il carrello è vuoto.</p>
        <a class="back-button" href="/scopri">Indietro</a>
      </section>
    `;
  }

  const totals = calculateDiscountedCartTotals(items, couponCode);
  return `
    <section class="cart-page">
      <a class="back-button" href="/scopri">Indietro</a>
      <div class="cart-items">
        ${items.map((item) => `
          <div class="cart-item">
            <div class="cart-item-name">
              <strong>${escapeHtml(item.name)}</strong>
              ${item.frameDescription ? `<span>${escapeHtml(item.frameDescription)}</span>` : ''}
              <span>Qtà: ${item.quantity}</span>
            </div>
            <div class="cart-item-price">
              <strong>${formatCurrencyCents(Math.round(item.price * 100) * item.quantity)}</strong>
              <button class="cart-quantity-button" type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Aumenta ${escapeHtml(item.name)}">+</button>
              <button class="cart-quantity-button" type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Diminuisci ${escapeHtml(item.name)}">−</button>
              <button class="cart-remove-button" type="button" data-cart-action="remove" data-product-id="${item.id}">Rimuovi</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="totals">
        <div class="row"><span>Subtotale</span><strong>${formatCurrencyCents(totals.subtotalCents)}</strong></div>
        <div class="row"><span>Spedizione</span><strong>${formatCurrencyCents(totals.shippingCents)}</strong></div>
        ${totals.discountCents > 0 ? `<div class="row"><span>Sconto coupon</span><strong>−${formatCurrencyCents(totals.discountCents)}</strong></div>` : ''}
        <div class="row total-row"><span>Totale</span><strong>${formatCurrencyCents(totals.totalCents)}</strong></div>
      </div>
      <a class="checkout-button cart-checkout-link" href="/pagamento">Vai al pagamento</a>
    </section>
  `;
}
