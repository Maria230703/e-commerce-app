import {
  CATEGORIES,
  PRODUCTS,
  filterProducts,
  formatCurrency,
  formatCurrencyCents,
  calculateCartTotalCents,
  transitionCatalogView
} from '/catalog-logic.js';
import { renderProductDetailMarkup } from '/product-detail.js';
import { renderLookScene } from '/look-scene.js';
import { INITIAL_FRAME_SELECTION, validateFramePhoto } from '/frame-logic.js';
import { renderFrameConfiguratorMarkup } from '/frame-configurator.js';
import { validateCardPayment, validateShippingAddress } from '/payment-logic.js';
import { renderCartPageMarkup, renderPaymentPageMarkup } from '/payment-ui.js';
import {
  FAVORITES_STORAGE_KEY,
  readFavoriteIds,
  renderFavoriteButtonMarkup,
  renderFavoritesMarkup,
  toggleFavoriteId
} from '/favorites.js';

const CART_STORAGE_KEY = 'e-commerce-cart';

const state = {
  products: PRODUCTS,
  search: '',
  category: 'all',
  sort: 'featured',
  selectedProductId: null,
  frameSelection: { ...INITIAL_FRAME_SELECTION },
  framePhoto: null,
  framePhotoError: '',
  favoriteIds: readFavoriteIds(window.localStorage, PRODUCTS),
  cart: readCart(),
  selectedPaymentMethod: '',
  shippingAddress: {},
  paymentErrors: {},
  paymentStage: 'form',
  orderSubmitting: false
};

const isFavoritesPage = window.location.pathname === '/preferiti';
const isFrameConfiguratorPage = window.location.pathname === '/configuratore-cornice';
const isCartPage = window.location.pathname === '/carrello';
const isPaymentPage = window.location.pathname === '/pagamento';
const pageTitle = document.querySelector('#page-title');
const layout = document.querySelector('.layout');
const lookSceneContainer = document.querySelector('#look-scene-container');
const productList = document.querySelector('#product-list');
const cartPanel = document.querySelector('.cart-panel');
const categoryFilters = document.querySelector('#category-filters');
const toolbar = document.querySelector('.toolbar');
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');
const cartItems = document.querySelector('#cart-items');
const subtotalEl = document.querySelector('#subtotal');
const shippingEl = document.querySelector('#shipping');
const totalEl = document.querySelector('#total');
const cartCountEl = document.querySelector('#cart-count');
const itemsCountEl = document.querySelector('#items-count');
const favoritesCountEl = document.querySelector('#favorites-count');
const checkoutButton = document.querySelector('#cart-checkout-button');

function readCart() {
  const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);

  if (storedValue === null) {
    return [];
  }

  const storedItems = JSON.parse(storedValue);
  if (!Array.isArray(storedItems)) {
    throw new TypeError('Il carrello salvato deve essere un elenco di articoli.');
  }

  return storedItems.flatMap(({ id, quantity }) => {
    const product = PRODUCTS.find((item) => item.id === id);
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return [];
    }
    return [{ ...product, quantity }];
  });
}

function persistCart() {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(
    state.cart.map(({ id, quantity }) => ({ id, quantity }))
  ));
}

function setCartQuantity(productId, change) {
  const item = state.cart.find(({ id }) => id === productId);
  if (!item) {
    return;
  }

  item.quantity += change;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(({ id }) => id !== productId);
  }
  persistCart();
  renderCart();
  if (isCartPage) {
    renderCartPage();
  }
}

function renderFavoriteCount() {
  favoritesCountEl.textContent = String(state.favoriteIds.length);
}

function renderFavoritesPage() {
  pageTitle.textContent = 'Preferiti';
  lookSceneContainer.hidden = true;
  toolbar.hidden = true;
  categoryFilters.hidden = true;
  productList.innerHTML = `
    <div class="favorites-page">
      ${renderFavoritesMarkup(
        state.products.filter((product) => state.favoriteIds.includes(product.id))
      )}
      <a class="back-button favorites-back-link" href="/scopri">Torna a Scopri</a>
    </div>
  `;
}

function toggleFavorite(productId) {
  state.favoriteIds = toggleFavoriteId(state.favoriteIds, productId);
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.favoriteIds));
  renderFavoriteCount();
  renderProducts();
}

function renderCategoryFilters() {
  categoryFilters.innerHTML = `${CATEGORIES.map(
    (category) => `
      <button
        type="button"
        class="filter-chip ${state.category === category.value ? 'active' : ''}"
        data-category="${category.value}"
      >
        ${category.label}
      </button>
    `
  ).join('')}
    <a class="frame-configurator-link" href="/configuratore-cornice">Crea la tua cornice</a>
  `;

  categoryFilters.querySelectorAll('.filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderCategoryFilters();
      renderProducts();
    });
  });
}

function renderFrameConfiguratorPage() {
  pageTitle.textContent = 'Crea la tua cornice';
  lookSceneContainer.hidden = true;
  toolbar.hidden = true;
  categoryFilters.hidden = true;
  cartPanel.hidden = true;
  layout.classList.add('frame-configurator-layout');
  productList.classList.add('frame-configurator-container');
  productList.innerHTML = renderFrameConfiguratorMarkup(
    state.frameSelection,
    state.framePhoto,
    state.framePhotoError
  );

  productList.querySelectorAll('.frame-option').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.frameOption;
      state.frameSelection[group] = button.dataset.frameValue;
      renderFrameConfiguratorPage();
    });
  });

  const photoInput = productList.querySelector('.frame-photo-input');
  productList.querySelector('.frame-upload-photo').addEventListener('click', () => {
    photoInput.click();
  });

  photoInput.addEventListener('change', () => {
    const [file] = photoInput.files;

    if (!file) {
      return;
    }

    const validationError = validateFramePhoto(file);

    if (validationError) {
      state.framePhotoError = validationError;
      renderFrameConfiguratorPage();
      return;
    }

    if (state.framePhoto) {
      URL.revokeObjectURL(state.framePhoto.url);
    }

    state.framePhoto = {
      name: file.name,
      url: URL.createObjectURL(file)
    };
    state.framePhotoError = '';
    renderFrameConfiguratorPage();
  });

  productList.querySelector('.frame-remove-photo')?.addEventListener('click', () => {
    URL.revokeObjectURL(state.framePhoto.url);
    state.framePhoto = null;
    state.framePhotoError = '';
    renderFrameConfiguratorPage();
  });
}

function renderCartPage() {
  pageTitle.textContent = 'Il tuo carrello';
  lookSceneContainer.hidden = true;
  toolbar.hidden = true;
  categoryFilters.hidden = true;
  cartPanel.hidden = true;
  layout.classList.add('payment-layout');
  productList.classList.add('payment-page-container');
  productList.innerHTML = renderCartPageMarkup(state.cart);

  productList.querySelectorAll('[data-cart-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.productId);
      if (button.dataset.cartAction === 'remove') {
        state.cart = state.cart.filter(({ id }) => id !== productId);
        persistCart();
        renderCart();
        renderCartPage();
      } else {
        setCartQuantity(productId, button.dataset.cartAction === 'increase' ? 1 : -1);
      }
    });
  });
}

function showOrderConfirmation(order) {
  state.cart = [];
  persistCart();
  renderCart();
  state.paymentStage = 'confirmation';
  state.paymentErrors = {
    orderNumber: order.number,
    orderStatus: order.status,
    totalCents: order.totalCents,
    customerName: order.address.name,
    customerAddress: order.address.address,
    customerPostalCode: order.address.postalCode,
    customerCity: order.address.city,
    customerEmail: order.address.email,
    bankTransfer: order.paymentMethod === 'bank-transfer'
  };
  renderPaymentPage();
}

async function createOrder(paymentMethod) {
  if (state.orderSubmitting) {
    return;
  }

  state.orderSubmitting = true;
  state.paymentErrors = {};

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: state.cart.map(({ id, quantity }) => ({ id, quantity })),
        address: state.shippingAddress,
        paymentMethod
      })
    });
    const result = await response.json();

    if (!response.ok) {
      state.orderSubmitting = false;
      state.paymentErrors.request = result.error || 'Non è stato possibile salvare l’ordine. Riprova.';
      state.paymentStage = 'form';
      renderPaymentPage();
      return;
    }

    showOrderConfirmation(result.order);
  } catch {
    state.orderSubmitting = false;
    state.paymentErrors.request = 'Non è stato possibile contattare il server. Riprova.';
    state.paymentStage = 'form';
    renderPaymentPage();
  }
}

function renderPaymentPage() {
  pageTitle.textContent = 'Pagamento';
  lookSceneContainer.hidden = true;
  toolbar.hidden = true;
  categoryFilters.hidden = true;
  cartPanel.hidden = true;
  layout.classList.add('payment-layout');
  productList.classList.add('payment-page-container');
  productList.innerHTML = renderPaymentPageMarkup({
    items: state.cart,
    selectedMethod: state.selectedPaymentMethod,
    errors: state.paymentErrors,
    stage: state.paymentStage,
    address: state.shippingAddress
  });

  if (state.paymentStage === 'confirmation' || !state.cart.length) {
    return;
  }

  const form = productList.querySelector('#payment-form');
  if (form) {
    form.querySelectorAll('#shipping-name, #shipping-address, #shipping-postalCode, #shipping-city, #shipping-email').forEach((input) => {
      input.addEventListener('input', () => {
        state.shippingAddress[input.name] = input.value;
        const fieldErrors = validateShippingAddress(state.shippingAddress);
        const error = form.querySelector(`#${input.id} + [role="alert"]`);
        if (error) {
          error.textContent = fieldErrors[input.name] ?? '';
          error.hidden = !fieldErrors[input.name];
        }
      });
    });

    form.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        state.selectedPaymentMethod = radio.value;
        state.paymentErrors = {};
        renderPaymentPage();
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      state.shippingAddress = {
        name: formData.get('name')?.toString() ?? '',
        address: formData.get('address')?.toString() ?? '',
        postalCode: formData.get('postalCode')?.toString() ?? '',
        city: formData.get('city')?.toString() ?? '',
        email: formData.get('email')?.toString() ?? ''
      };
      state.selectedPaymentMethod = formData.get('paymentMethod')?.toString() ?? '';
      state.paymentErrors = validateShippingAddress(state.shippingAddress);

      if (!state.selectedPaymentMethod) {
        state.paymentErrors.paymentMethod = 'Scegli un metodo di pagamento';
      }

      if (Object.keys(state.paymentErrors).length > 0) {
        renderPaymentPage();
        return;
      }

      if (state.selectedPaymentMethod === 'card') {
        const cardError = validateCardPayment({
          number: formData.get('cardNumber')?.toString() ?? '',
          expiry: formData.get('cardExpiry')?.toString() ?? '',
          code: formData.get('cardCode')?.toString() ?? ''
        });
        if (cardError) {
          const alert = form.querySelector('.payment-card-general-error');
          alert.textContent = cardError;
          alert.hidden = false;
          return;
        }
        createOrder('card');
      } else if (state.selectedPaymentMethod === 'paypal') {
        state.paymentStage = 'paypal-approval';
        renderPaymentPage();
      } else {
        createOrder('bank-transfer');
      }
    });
  }

  productList.querySelector('.paypal-approve')?.addEventListener('click', () => {
    createOrder('paypal');
  });
}

function renderProducts() {
  if (isFavoritesPage) {
    renderFavoritesPage();
    return;
  }

  if (isFrameConfiguratorPage) {
    renderFrameConfiguratorPage();
    return;
  }

  if (isCartPage) {
    renderCartPage();
    return;
  }

  if (isPaymentPage) {
    renderPaymentPage();
    return;
  }

  if (state.selectedProductId !== null) {
    const product = state.products.find((item) => item.id === state.selectedProductId);

    if (product) {
      lookSceneContainer.hidden = true;
      renderProductDetail(product);
      return;
    }

    state.selectedProductId = null;
  }

  pageTitle.textContent = 'Scopri';
  lookSceneContainer.hidden = false;
  toolbar.hidden = false;
  categoryFilters.hidden = false;
  cartPanel.hidden = false;
  layout.classList.remove('frame-configurator-layout');
  productList.classList.remove('frame-configurator-container');

  const filteredProducts = filterProducts(state.products, {
    search: state.search,
    category: state.category,
    sort: state.sort
  });

  if (!filteredProducts.length) {
    productList.innerHTML = '<div class="empty-cart">Nessun prodotto trovato con i filtri correnti.</div>';
    return;
  }

  productList.innerHTML = filteredProducts.map((product) => {
    const emojiMap = {
      arredo: '💡',
      oggettistica: '🏺',
      cornici: '🖼️'
    };

    return `
      <article class="product-card">
        <button class="product-detail-button" type="button" data-product-id="${product.id}">
          <div class="product-image" aria-hidden="true">${emojiMap[product.category]}</div>
          <div class="product-body">
            <div class="product-top">
              <span class="badge">${product.badge}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          </div>
        </button>
        <div class="product-footer">
          <span class="price">${formatCurrency(product.price)}</span>
          <button class="add-button" type="button" data-product-id="${product.id}">Aggiungi al carrello</button>
          ${renderFavoriteButtonMarkup(product, state.favoriteIds.includes(product.id))}
        </div>
      </article>
    `;
  }).join('');

  productList.querySelectorAll('.product-detail-button').forEach((button) => {
    button.addEventListener('click', () => {
      Object.assign(
        state,
        transitionCatalogView(state, {
          type: 'open-product',
          productId: Number(button.dataset.productId)
        })
      );
      renderProducts();
    });
  });

  productList.querySelectorAll('.add-button').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.productId);
      const product = state.products.find((item) => item.id === productId);

      if (!product) {
        return;
      }

      const existingItem = state.cart.find((item) => item.id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }

      persistCart();
      renderCart();
    });
  });

  productList.querySelectorAll('.favorite-button').forEach((button) => {
    button.addEventListener('click', () => {
      toggleFavorite(Number(button.dataset.favoriteProductId));
    });
  });
}

function openProduct(productId) {
  Object.assign(
    state,
    transitionCatalogView(state, {
      type: 'open-product',
      productId
    })
  );
  renderProducts();
}

function renderProductDetail(product) {
  pageTitle.textContent = product.name;
  toolbar.hidden = true;
  categoryFilters.hidden = true;

  productList.innerHTML = renderProductDetailMarkup(
    product,
    state.favoriteIds.includes(product.id)
  );

  productList.querySelector('.back-button').addEventListener('click', () => {
    Object.assign(state, transitionCatalogView(state, { type: 'back-to-catalog' }));
    renderProducts();
  });

  productList.querySelector('.favorite-button').addEventListener('click', () => {
    toggleFavorite(product.id);
  });
}

lookSceneContainer.innerHTML = renderLookScene();
lookSceneContainer.querySelectorAll('.look-hotspot').forEach((button) => {
  button.addEventListener('click', () => {
    openProduct(Number(button.dataset.productId));
  });
});

function renderCart() {
  const { subtotalCents, shippingCents, totalCents } = calculateCartTotalCents(state.cart);
  const itemCount = state.cart.reduce((count, item) => count + item.quantity, 0);

  if (!state.cart.length) {
    cartItems.innerHTML = '<div class="empty-cart">Il carrello è vuoto.</div>';
  } else {
    cartItems.innerHTML = state.cart.map((item) => `
      <div class="cart-item">
        <div class="cart-item-name">
          <strong>${item.name}</strong>
          <span>Qtà: ${item.quantity}</span>
        </div>
        <div class="cart-item-price">
          <strong>${formatCurrencyCents(Math.round(item.price * 100) * item.quantity)}</strong>
          <button class="cart-quantity-button" type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Diminuisci ${item.name}">−</button>
          <button class="cart-quantity-button" type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Aumenta ${item.name}">+</button>
          <button class="cart-remove-button" type="button" data-cart-action="remove" data-product-id="${item.id}">Rimuovi</button>
        </div>
      </div>
      `).join('');
  }

  subtotalEl.textContent = formatCurrencyCents(subtotalCents);
  shippingEl.textContent = formatCurrencyCents(shippingCents);
  totalEl.textContent = formatCurrencyCents(totalCents);
  cartCountEl.textContent = String(itemCount);
  itemsCountEl.textContent = `${itemCount} articoli`;
  checkoutButton.hidden = state.cart.length === 0;

  cartItems.querySelectorAll('[data-cart-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const productId = Number(button.dataset.productId);
        if (button.dataset.cartAction === 'remove') {
          state.cart = state.cart.filter(({ id }) => id !== productId);
          persistCart();
          renderCart();
        } else {
          setCartQuantity(productId, button.dataset.cartAction === 'increase' ? 1 : -1);
        }
      });
  });
}

searchInput.addEventListener('input', (event) => {
  state.search = event.target.value;
  renderProducts();
});

sortSelect.addEventListener('change', (event) => {
  state.sort = event.target.value;
  renderProducts();
});

renderCategoryFilters();
renderFavoriteCount();
renderProducts();
renderCart();
