export const CATEGORIES = [
  { value: 'all', label: 'Tutti i prodotti' },
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'informatica', label: 'Informatica' },
  { value: 'audio', label: 'Audio' },
  { value: 'accessori', label: 'Accessori' },
  { value: 'cornici', label: 'Cornici' }
];

export const PRODUCTS = [
  {
    id: 1,
    name: 'Smartphone Apex X5',
    category: 'smartphone',
    price: 499,
    description: 'Display AMOLED da 6,7", fotocamera triple 50MP e batteria da 5000mAh.',
    badge: 'Nuovo'
  },
  {
    id: 2,
    name: 'Laptop Nova 14',
    category: 'informatica',
    price: 899,
    description: 'Notebook ultrasottile per lavoro e creatività, con SSD 1TB e 16GB RAM.',
    badge: 'Top seller'
  },
  {
    id: 3,
    name: 'Cuffie SoundWave Pro',
    category: 'audio',
    price: 149,
    description: 'Audio immersivo con cancellazione attiva del rumore e 30 ore di autonomia.',
    badge: 'Hot'
  },
  {
    id: 4,
    name: 'Smartwatch Pulse 3',
    category: 'accessori',
    price: 199,
    description: 'Monitora attività fisica, sonno e frequenza cardiaca con precisione.',
    badge: 'Fitness'
  },
  {
    id: 5,
    name: 'Auricolari Echo Mini',
    category: 'audio',
    price: 59,
    description: 'Design leggero e suono chiaro, perfetto per la giornata da casa o in viaggio.',
    badge: 'Essenziale'
  },
  {
    id: 6,
    name: 'Cornice Aura',
    category: 'cornici',
    price: 59,
    description: 'Cornice elegante per esporre i tuoi ricordi preferiti in ogni ambiente.',
    badge: 'Novità'
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
