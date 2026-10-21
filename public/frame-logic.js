export const FRAME_OPTIONS = {
  measure: [
    { value: '10x15', label: '10x15', width: 10, height: 15, priceCents: 1500 },
    { value: '13x18', label: '13x18', width: 13, height: 18, priceCents: 1900 },
    { value: '15x20', label: '15x20', width: 15, height: 20, priceCents: 2400 },
    { value: '30x30', label: '30x30', width: 30, height: 30, priceCents: 3900 },
    { value: '50x70', label: '50x70', width: 50, height: 70, priceCents: 7900 }
  ],
  finish: [
    { value: 'noce', label: 'Noce', color: '#6B4A32', priceCents: 800 },
    { value: 'oro-spazzolato', label: 'Oro spazzolato', color: '#B89A55', priceCents: 1200 }
  ],
  profile: [
    { value: 'classico', label: 'Classico', borderWidth: 12, priceCents: 600 },
    { value: 'contemporaneo', label: 'Contemporaneo', borderWidth: 6, priceCents: 800 }
  ],
  mat: [
    { value: 'nessuno', label: 'Nessuno', color: null, priceCents: 0 },
    { value: 'bianco', label: 'Bianco', color: '#FBFAF7', priceCents: 590 },
    { value: 'verde-smeraldo', label: 'Verde smeraldo', color: '#50C878', priceCents: 590 },
    { value: 'rosso-carminio', label: 'Rosso carminio', color: '#960018', priceCents: 590 }
  ]
};

export const INITIAL_FRAME_SELECTION = {
  measure: '13x18',
  finish: 'noce',
  profile: 'classico',
  mat: 'bianco'
};

function selectedOption(selection, group) {
  return FRAME_OPTIONS[group].find(({ value }) => value === selection[group]);
}

export function calculateFramePriceCents(selection) {
  return Object.keys(FRAME_OPTIONS).reduce(
    (total, group) => total + selectedOption(selection, group).priceCents,
    0
  );
}

export function formatFramePrice(priceCents) {
  const euros = Math.floor(priceCents / 100);
  const cents = String(priceCents % 100).padStart(2, '0');
  return `${euros},${cents} €`;
}

export function describeFrameSelection(selection) {
  const measure = selectedOption(selection, 'measure');
  const finish = selectedOption(selection, 'finish');
  const profile = selectedOption(selection, 'profile');
  const mat = selectedOption(selection, 'mat');
  const matDescription = mat.value === 'nessuno'
    ? 'senza passe-partout'
    : `passe-partout ${mat.label}`;

  return `${measure.label} cm, ${finish.label}, ${profile.label}, ${matDescription}`;
}
