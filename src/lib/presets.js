export const FILTERS = [
  { id: 'natural', name: 'Natural Glow', brightness: 1.04, contrast: 1.02, saturation: 1.04 },
  { id: 'soft', name: 'Soft Korean', brightness: 1.07, contrast: .92, saturation: .96, warmth: .12 },
  { id: 'sakura', name: 'Sakura Film', brightness: 1.04, contrast: .93, saturation: .9, tint: [.024, -.008, .013] },
  { id: 'vintage', name: 'Vintage Film', brightness: 1.01, contrast: .88, saturation: .72, warmth: .32 },
  { id: 'cool', name: 'Cool Studio', brightness: 1.02, contrast: 1.06, saturation: .94, warmth: -.2 },
  { id: 'y2k', name: 'Y2K Digital', brightness: 1.08, contrast: 1.04, saturation: 1.12, tint: [.015, -.015, .035] },
  { id: 'bw', name: 'B&W Classic', brightness: 1.02, contrast: 1.04, saturation: 0 },
  { id: 'noir', name: 'B&W Contrast', brightness: 1, contrast: 1.34, saturation: 0 },
];
export const DEFAULT_ADJUST = { brightness: 0, contrast: 0, saturation: 0, warmth: 0, glow: false };
export const FRAMES = [
  { id: 'lavender', name: 'Lavender', category: 'Pastel', colors: ['#E8E1F2'], ink: '#4C4261' },
  { id: 'pink', name: 'Baby Pink', category: 'Pastel', colors: ['#F5DEE4'], ink: '#69424F' },
  { id: 'mint', name: 'Mint', category: 'Pastel', colors: ['#DEEBE3'], ink: '#3E5A4B' },
  { id: 'cream', name: 'Butter Cream', category: 'Pastel', colors: ['#F6EDCF'], ink: '#62523B' },
  { id: 'blue', name: 'Baby Blue', category: 'Pastel', colors: ['#DDE8F4'], ink: '#43556E' },
  { id: 'white', name: 'White', category: 'Classic', colors: ['#FFFEFA'], ink: '#33323A' },
  { id: 'black', name: 'Black', category: 'Classic', colors: ['#242329'], ink: '#F8F5F0' },
  { id: 'beige', name: 'Beige', category: 'Classic', colors: ['#DED2C2'], ink: '#534738' },
  { id: 'mono-white', name: 'White', category: 'Monochrome', colors: ['#FFFFFF'], ink: '#252525' },
  { id: 'grey', name: 'Grey', category: 'Monochrome', colors: ['#C8C8CE'], ink: '#34343A' },
  { id: 'mono-black', name: 'Black', category: 'Monochrome', colors: ['#18181B'], ink: '#FAFAFA' },
  { id: 'gradient', name: 'Gradient Lavender', category: 'Special', colors: ['#DFD6F1', '#F2E9DD'], ink: '#574766' },
  { id: 'sakura', name: 'Soft Sakura', category: 'Special', colors: ['#F1D9E3', '#F9EEE2'], ink: '#694855' },
  { id: 'y2k', name: 'Y2K', category: 'Special', colors: ['#D5DEF5', '#EDDCF0'], ink: '#4A476C' },
];
export const DEFAULT_STYLE = {
  frame: 'lavender', layout: 'vertical', sticker: '', header: 'SNAPBOOTH', text: '',
  location: 'Bandung, West Java', showLocation: true, showDate: true, showTime: true, showBrand: true,
};

// A single RGB matrix powers the SVG live preview and Canvas pixel processing.
// No CanvasRenderingContext2D.filter dependency (including on mobile Safari).
export function colorMatrix(filterId, adjust = DEFAULT_ADJUST) {
  const p = FILTERS.find(f => f.id === filterId) || FILTERS[0];
  const b = p.brightness * (1 + adjust.brightness / 100) * (adjust.glow ? 1.025 : 1);
  const c = p.contrast * (1 + adjust.contrast / 100) * (adjust.glow ? .95 : 1);
  const s = p.saturation * (1 + adjust.saturation / 100);
  const warm = (p.warmth || 0) + adjust.warmth / 100;
  const tint = p.tint || [0, 0, 0];
  const luma = [.2126, .7152, .0722];
  const offsets = [warm * .065, warm * .012, -warm * .065];
  return [0, 1, 2].flatMap(row => [
    ...luma.map((v, col) => b * c * ((1 - s) * v + (row === col ? s : 0))),
    0, (1 - c) / 2 + offsets[row] + tint[row],
  ]).concat([0, 0, 0, 1, 0]);
}

export function cropRect(width, height, ratio = 4 / 3) {
  const w = Math.min(width, height * ratio);
  const h = w / ratio;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}
export function filename(date) {
  const d = new Date(date), pad = n => String(n).padStart(2, '0');
  return `SnapBooth-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.png`;
}
