export const CATEGORIES = [
  { value: 'all', label: 'Tutti' },
  { value: 'arredo', label: 'Arredo' },
  { value: 'oggettistica', label: 'Oggettistica' },
  { value: 'cornici', label: 'Cornici' }
];

export const PRODUCTS = [
  {
    id: 1,
    name: 'Lampada Lume',
    category: 'arredo',
    price: 89,
    description: 'Paralume in lino e base in metallo. Luce calda e diffusa.',
    badge: 'Design'
  },
  {
    id: 2,
    name: 'Specchio Orbita',
    category: 'arredo',
    price: 119,
    description: 'Specchio tondo con bordo sottile in metallo.',
    badge: 'Novità'
  },
  {
    id: 3,
    name: 'Portavaso Trama',
    category: 'arredo',
    price: 45,
    description: 'Intreccio in rattan naturale con fondo impermeabile.',
    badge: 'Artigianale'
  },
  {
    id: 4,
    name: 'Vaso Duna',
    category: 'oggettistica',
    price: 34,
    description: 'Ceramica smaltata a mano con finitura opaca.',
    badge: 'Naturale'
  },
  {
    id: 5,
    name: 'Candela Vaniglia',
    category: 'oggettistica',
    price: 22,
    description: 'Cera vegetale in vasetto di vetro riutilizzabile.',
    badge: 'Profumata'
  },
  {
    id: 6,
    name: 'Cornice Atelier',
    category: 'cornici',
    price: 29,
    description: 'Profilo in legno con vetro antiriflesso.',
    badge: 'Elegante'
  }
];

export function filterProducts(items = PRODUCTS, options = {}) {
  const { search = '', category = 'all', sort = 'featured' } = options;
  const query = search.trim().toLowerCase();

  let filtered = [...items];

  if (query) {
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }

  if (category !== 'all') {
    filtered = filtered.filter((item) => item.category === category);
  }

  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      filtered.sort((a, b) => a.id - b.id);
      break;
  }

  return filtered;
}

export function transitionCatalogView(state, action) {
  switch (action.type) {
    case 'open-product':
      return { ...state, selectedProductId: action.productId };
    case 'back-to-catalog':
      return { ...state, selectedProductId: null };
    default:
      return state;
  }
}

export function calculateCartTotal(items = []) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 && subtotal < 100 ? 9.9 : 0;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = subtotal + shipping;

  return { subtotal, shipping, total, itemCount };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}
