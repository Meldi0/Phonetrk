export const FILTERS = [
  { id: 'natural', name: 'Natural Glow', brightness: 1.04, contrast: 1.02, saturation: 1.04 },
  { id: 'korean', name: 'Soft Korean', brightness: 1.07, contrast: 0.92, saturation: 0.96, warmth: 0.12 },
  { id: 'warm-studio', name: 'Warm Studio', brightness: 1.03, contrast: 1.04, saturation: 1.06, warmth: 0.28 },
  { id: 'cool-studio', name: 'Cool Studio', brightness: 1.02, contrast: 1.06, saturation: 0.94, warmth: -0.2 },
  { id: 'sakura', name: 'Sakura Film', brightness: 1.04, contrast: 0.93, saturation: 0.9, tint: [0.024, -0.008, 0.013] },
  { id: 'vintage', name: 'Vintage Film', brightness: 1.01, contrast: 0.88, saturation: 0.72, warmth: 0.32 },
  { id: 'retro', name: 'Retro Camera', brightness: 1.02, contrast: 0.94, saturation: 0.85, warmth: 0.18, tint: [0.01, 0.005, -0.01] },
  { id: 'disposable', name: 'Disposable Camera', brightness: 1.06, contrast: 1.15, saturation: 1.18, warmth: 0.15, tint: [-0.01, 0.02, -0.01] },
  { id: 'dreamy', name: 'Dreamy', brightness: 1.08, contrast: 0.88, saturation: 0.92, warmth: 0.08, tint: [0.015, -0.005, 0.02] },
  { id: 'faded', name: 'Faded Film', brightness: 1.04, contrast: 0.82, saturation: 0.65, warmth: 0.05 },
  { id: 'y2k', name: 'Y2K Digital', brightness: 1.08, contrast: 1.04, saturation: 1.12, tint: [0.015, -0.015, 0.035] },
  { id: 'blue-hour', name: 'Blue Hour', brightness: 0.98, contrast: 1.08, saturation: 1.1, warmth: -0.35, tint: [-0.02, 0.01, 0.04] },
  { id: 'golden-hour', name: 'Golden Hour', brightness: 1.05, contrast: 1.06, saturation: 1.15, warmth: 0.42, tint: [0.03, 0.01, -0.03] },
  { id: 'bw', name: 'B&W Classic', brightness: 1.02, contrast: 1.04, saturation: 0 },
  { id: 'noir', name: 'B&W Contrast', brightness: 1, contrast: 1.34, saturation: 0 },
  { id: 'sepia', name: 'Sepia Film', brightness: 1.02, contrast: 0.96, saturation: 0.25, warmth: 0.55, tint: [0.04, 0.02, -0.03] },
];

export const EFFECTS = [
  { id: 'none', name: 'Normal', category: 'Creative', description: 'No visual effect' },
  { id: 'pixel-blur', name: 'Pixel Blur', category: 'Creative', description: 'True canvas mosaic pixelation', defaultIntensity: 50 },
  { id: 'eight-bit', name: '8-Bit Art', category: 'Creative', description: 'Low-res retro pixelated palette', defaultIntensity: 50 },
  { id: 'dream-glow', name: 'Dream Glow', category: 'Creative', description: 'Soft Korean photobooth bloom', defaultIntensity: 55 },
  { id: 'film-grain', name: 'Film Grain', category: 'Creative', description: 'Subtle procedural film texture', defaultIntensity: 45 },
  { id: 'rgb-shift', name: 'RGB Shift', category: 'Creative', description: 'Y2K digital chromatic separation', defaultIntensity: 40 },
  { id: 'vhs', name: 'VHS Tape', category: 'Creative', description: 'Subtle scanlines & video noise', defaultIntensity: 45 },
  { id: 'low-res', name: 'Low-Res Cam', category: 'Creative', description: 'Vintage digicam sensor feel', defaultIntensity: 50 },
  { id: 'soft-blur', name: 'Soft Blur', category: 'Creative', description: 'Gentle whole-image softening', defaultIntensity: 35 },
  { id: 'motion-blur', name: 'Motion Blur', category: 'Creative', description: 'Subtle dynamic camera motion', defaultIntensity: 40 },
  { id: 'pixel-face', name: 'Pixel Face', category: 'Privacy', description: 'Pixel mosaic face censor', defaultIntensity: 65 },
  { id: 'blur-face', name: 'Blur Face', category: 'Privacy', description: 'Smooth face blur censor', defaultIntensity: 60 },
  { id: 'black-bar', name: 'Black Bar', category: 'Privacy', description: 'Aesthetic censor bar across eyes', defaultIntensity: 100 },
];

export const LAYOUT_OPTIONS = [
  { id: '1-single', name: '1-Cut Single', poses: 1, cols: 1, rows: 1, label: '1 Hero Portrait' },
  { id: '2-vertical', name: '2-Cut Duo', poses: 2, cols: 1, rows: 2, label: '2 Poses Vertical' },
  { id: '2-grid', name: '2-Cut Wide', poses: 2, cols: 2, rows: 1, label: '2 Poses Side-by-side' },
  { id: '4-vertical', name: '4-Cut Strip', poses: 4, cols: 1, rows: 4, label: 'Classic 4-Cut Strip' },
  { id: '4-grid', name: '4-Cut Grid', poses: 4, cols: 2, rows: 2, label: '2 × 2 Grid' },
  { id: '4-wide', name: '4-Cut Wide', poses: 4, cols: 4, rows: 1, label: 'Wide 4-Cut' },
  { id: '6-grid', name: '6-Cut Studio', poses: 6, cols: 2, rows: 3, label: '6 Poses (2 × 3)' },
  { id: '6-wide', name: '6-Cut Wide', poses: 6, cols: 3, rows: 2, label: '6 Poses (3 × 2)' },
];

import { ARTISTIC_TEMPLATES } from './artisticTemplates.js';

const RAW_STRIP_TEMPLATES = [
  ...ARTISTIC_TEMPLATES,
  // CLEAN
  {
    id: 'clean-white',
    name: 'Clean White',
    category: 'Clean',
    background: ['#FFFFFF'],
    textColor: '#242329',
    accentColor: '#7061A8',
    border: 'none',
    header: 'SNAPBOOTH',
    subHeader: 'K-STYLE SELF PHOTO STUDIO',
    font: 'sans',
    decorations: [],
  },
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    category: 'Clean',
    background: ['#141318'],
    textColor: '#F5F4F8',
    accentColor: '#ACA2C7',
    border: 'none',
    header: 'SNAPBOOTH',
    subHeader: 'STUDIO EDITION • MONOCHROME',
    font: 'sans',
    decorations: [],
  },
  {
    id: 'soft-grey',
    name: 'Soft Grey',
    category: 'Clean',
    background: ['#ECEBEF'],
    textColor: '#36343E',
    accentColor: '#6B627D',
    border: 'none',
    header: 'SNAPBOOTH',
    subHeader: 'MINIMAL ARCHIVE',
    font: 'sans',
    decorations: [],
  },
  {
    id: 'cream-paper',
    name: 'Cream Paper',
    category: 'Clean',
    background: ['#FAF6EC'],
    textColor: '#483E34',
    accentColor: '#8C7764',
    border: 'subtle',
    header: 'SnapBooth Studio',
    subHeader: 'KEEPSAKE MEMOIR',
    font: 'serif',
    decorations: [],
  },
  {
    id: 'lavender-minimal',
    name: 'Lavender Minimal',
    category: 'Clean',
    background: ['#ECE6F4'],
    textColor: '#423755',
    accentColor: '#705F94',
    border: 'none',
    header: 'SNAPBOOTH',
    subHeader: 'SEOUL MEMORIES',
    font: 'sans',
    decorations: [],
  },
  {
    id: 'studio-beige',
    name: 'Studio Beige',
    category: 'Clean',
    background: ['#EFECE6'],
    textColor: '#3F3B36',
    accentColor: '#7C7267',
    border: 'none',
    header: 'STUDIO BEIGE',
    subHeader: 'PHOTOBOOTH ARCHIVE',
    font: 'sans',
    decorations: [],
  },

  // CUTE
  {
    id: 'sakura-day',
    name: 'Sakura Day',
    category: 'Cute',
    background: ['#FDF1F4', '#F8E3EB'],
    textColor: '#613947',
    accentColor: '#D97995',
    border: 'white-thin',
    header: '♡ SAKURA DAY ♡',
    subHeader: 'SPRING IN SEOUL',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'bow-pink', x: 0.12, y: 0.05, size: 46 },
      { type: 'sticker', stickerType: 'sakura', x: 0.88, y: 0.05, size: 42 },
      { type: 'sticker', stickerType: 'sakura', x: 0.08, y: 0.92, size: 36 },
      { type: 'sticker', stickerType: 'bow-pink', x: 0.92, y: 0.92, size: 44 },
      { type: 'sticker', stickerType: 'heart-pastel', x: 0.5, y: 0.89, size: 34 },
    ],
  },
  {
    id: 'ribbon-diary',
    name: 'Ribbon Diary',
    category: 'Cute',
    background: ['#FFF8F5', '#FCEEE8'],
    textColor: '#66453F',
    accentColor: '#D47E72',
    border: 'white-thin',
    header: '୨୧ RIBBON DIARY ୨୧',
    subHeader: 'SWEET MOMENTS',
    font: 'serif',
    decorations: [
      { type: 'sticker', stickerType: 'bow-red', x: 0.12, y: 0.05, size: 48 },
      { type: 'sticker', stickerType: 'bow-red', x: 0.88, y: 0.05, size: 48 },
      { type: 'sticker', stickerType: 'heart-pastel', x: 0.5, y: 0.89, size: 34 },
      { type: 'sticker', stickerType: 'cherry', x: 0.08, y: 0.92, size: 42 },
      { type: 'sticker', stickerType: 'cherry', x: 0.92, y: 0.92, size: 42 },
    ],
  },
  {
    id: 'cloudy-blue',
    name: 'Cloudy Blue',
    category: 'Cute',
    background: ['#EDF4FB', '#E0EDF8'],
    textColor: '#34475C',
    accentColor: '#6B9ECD',
    border: 'white-thin',
    header: '☁ CLOUDY BLUE ☁',
    subHeader: 'DREAMY SKY BOOTH',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'star-twinkle', x: 0.12, y: 0.05, size: 40 },
      { type: 'sticker', stickerType: 'star-4point', x: 0.88, y: 0.05, size: 38, color: '#6B9ECD' },
      { type: 'sticker', stickerType: 'butterfly', x: 0.5, y: 0.89, size: 38 },
      { type: 'sticker', stickerType: 'bow-cream', x: 0.08, y: 0.92, size: 42 },
      { type: 'sticker', stickerType: 'star-twinkle', x: 0.92, y: 0.92, size: 36 },
    ],
  },
  {
    id: 'berry-milk',
    name: 'Berry Milk',
    category: 'Cute',
    background: ['#FCF0F5', '#F8E0EC'],
    textColor: '#663450',
    accentColor: '#CC639A',
    border: 'white-thin',
    header: '🍓 BERRY MILK 🍓',
    subHeader: 'LITTLE SWEET DAYS',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'strawberry', x: 0.12, y: 0.05, size: 44 },
      { type: 'sticker', stickerType: 'cherry', x: 0.88, y: 0.05, size: 46 },
      { type: 'sticker', stickerType: 'bow-pink', x: 0.5, y: 0.89, size: 42 },
      { type: 'sticker', stickerType: 'strawberry', x: 0.08, y: 0.92, size: 38 },
      { type: 'sticker', stickerType: 'heart-pastel', x: 0.92, y: 0.92, size: 34 },
    ],
  },
  {
    id: 'lucky-clover',
    name: 'Lucky Clover',
    category: 'Cute',
    background: ['#F1F7F3', '#E3F0E6'],
    textColor: '#31553E',
    accentColor: '#59A673',
    border: 'white-thin',
    header: '☘ LUCKY CLOVER ☘',
    subHeader: 'HAPPINESS EVERYWHERE',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'clover', x: 0.12, y: 0.05, size: 46 },
      { type: 'sticker', stickerType: 'clover', x: 0.88, y: 0.05, size: 46 },
      { type: 'sticker', stickerType: 'star-twinkle', x: 0.5, y: 0.89, size: 34 },
      { type: 'sticker', stickerType: 'clover', x: 0.08, y: 0.92, size: 38 },
      { type: 'sticker', stickerType: 'bow-cream', x: 0.92, y: 0.92, size: 40 },
    ],
  },
  {
    id: 'lavender-bunny',
    name: 'Lavender Bunny',
    category: 'Cute',
    background: ['#F3EFF9', '#E8E1F4'],
    textColor: '#4B3E63',
    accentColor: '#937BC2',
    border: 'white-thin',
    header: '🐰 LAVENDER BUNNY 🐰',
    subHeader: 'COZY PASTEL BOOTH',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'bunny', x: 0.12, y: 0.05, size: 46 },
      { type: 'sticker', stickerType: 'cat-paw', x: 0.88, y: 0.05, size: 42 },
      { type: 'sticker', stickerType: 'bow-pink', x: 0.5, y: 0.89, size: 42 },
      { type: 'sticker', stickerType: 'sakura', x: 0.08, y: 0.92, size: 36 },
      { type: 'sticker', stickerType: 'bunny', x: 0.92, y: 0.92, size: 40 },
    ],
  },

  // PLAYFUL
  {
    id: 'sticker-bomb',
    name: 'Sticker Bomb',
    category: 'Playful',
    background: ['#FFFBF2', '#F7F0E0'],
    textColor: '#3B3326',
    accentColor: '#E07558',
    border: 'white-thin',
    header: '★ STICKER BOMB ★',
    subHeader: 'SNAP • SMILE • COLLECT',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'star-4point', x: 0.1, y: 0.05, size: 44, color: '#E07558' },
      { type: 'sticker', stickerType: 'heart-sparkle', x: 0.9, y: 0.05, size: 42 },
      { type: 'sticker', stickerType: 'smiley', x: 0.08, y: 0.92, size: 38 },
      { type: 'sticker', stickerType: 'butterfly', x: 0.92, y: 0.92, size: 40 },
      { type: 'sticker', stickerType: 'badge-love', x: 0.5, y: 0.89, size: 44 },
    ],
  },
  {
    id: 'doodle-diary',
    name: 'Doodle Diary',
    category: 'Playful',
    background: ['#FCFBF7'],
    textColor: '#2E2C33',
    accentColor: '#635C72',
    border: 'doodle',
    header: '✏️ DOODLE DIARY ✏️',
    subHeader: 'SKETCHED WITH LOVE',
    font: 'serif',
    decorations: [
      { type: 'sticker', stickerType: 'smiley', x: 0.1, y: 0.05, size: 38 },
      { type: 'sticker', stickerType: 'star-4point', x: 0.9, y: 0.05, size: 38 },
      { type: 'sticker', stickerType: 'badge-besties', x: 0.5, y: 0.89, size: 42 },
    ],
  },
  {
    id: 'party-pop',
    name: 'Party Pop',
    category: 'Playful',
    background: ['#FFF0F5', '#EBF5FF'],
    textColor: '#3A3150',
    accentColor: '#8C52AC',
    border: 'white-thin',
    header: '🎉 PARTY POP 🎉',
    subHeader: 'BEST TIMES TOGETHER',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'star-twinkle', x: 0.1, y: 0.045, size: 40 },
      { type: 'sticker', stickerType: 'heart-sparkle', x: 0.9, y: 0.045, size: 40 },
      { type: 'sticker', stickerType: 'badge-besties', x: 0.5, y: 0.89, size: 44 },
      { type: 'sticker', stickerType: 'smiley', x: 0.08, y: 0.92, size: 36 },
      { type: 'sticker', stickerType: 'star-4point', x: 0.92, y: 0.92, size: 38, color: '#8C52AC' },
    ],
  },
  {
    id: 'comic-cut',
    name: 'Comic Cut',
    category: 'Playful',
    background: ['#FFFDEB'],
    textColor: '#151515',
    accentColor: '#E63946',
    border: 'comic',
    header: '💥 COMIC CUT 💥',
    subHeader: 'ISSUE NO. 01 • STUDIO',
    font: 'sans',
    decorations: [
      { type: 'text', text: 'BOOM!', x: 0.12, y: 0.05, size: 16, font: '900 16px Impact, Arial', color: '#E63946' },
      { type: 'sticker', stickerType: 'star-4point', x: 0.9, y: 0.05, size: 40, color: '#151515' },
      { type: 'sticker', stickerType: 'badge-love', x: 0.5, y: 0.89, size: 44, color: '#E63946' },
    ],
  },
  {
    id: 'happy-mix',
    name: 'Happy Mix',
    category: 'Playful',
    background: ['#FDE2E4', '#DFECF2'],
    textColor: '#423748',
    accentColor: '#78558A',
    border: 'white-thin',
    header: '★ HAPPY MIX ★',
    subHeader: 'GOOD VIBES ONLY',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'sakura', x: 0.1, y: 0.05, size: 38 },
      { type: 'sticker', stickerType: 'star-4point', x: 0.9, y: 0.05, size: 38 },
      { type: 'sticker', stickerType: 'heart-pastel', x: 0.5, y: 0.89, size: 36 },
      { type: 'sticker', stickerType: 'butterfly', x: 0.08, y: 0.92, size: 38 },
      { type: 'sticker', stickerType: 'smiley', x: 0.92, y: 0.92, size: 36 },
    ],
  },

  // RETRO
  {
    id: 'retro-film',
    name: 'Retro Film',
    category: 'Retro',
    background: ['#1C1B19'],
    textColor: '#EFEAE1',
    accentColor: '#D87A38',
    border: 'film',
    header: '35MM COLOR FILM',
    subHeader: 'ISO 400 • ANALOG PROCESS',
    font: 'sans',
    decorations: [
      { type: 'film-marks' },
      { type: 'sticker', stickerType: 'badge-memories', x: 0.5, y: 0.89, size: 42, color: '#D87A38' },
    ],
  },
  {
    id: '90s-photolab',
    name: '90s Photo Lab',
    category: 'Retro',
    background: ['#232120'],
    textColor: '#F2E8D5',
    accentColor: '#E8A35D',
    border: 'photolab',
    header: 'PHOTO LAB 1994',
    subHeader: 'EXPRESS ONE-HOUR PRINT',
    font: 'sans',
    decorations: [
      { type: 'timestamp-digital', color: '#FF7A29' },
      { type: 'sticker', stickerType: 'badge-kstyle', x: 0.5, y: 0.89, size: 40, color: '#E8A35D' },
    ],
  },
  {
    id: 'analog-date',
    name: 'Analog Date',
    category: 'Retro',
    background: ['#F3EFE7'],
    textColor: '#3E3832',
    accentColor: '#B05930',
    border: 'subtle',
    header: 'ANALOG ARCHIVE',
    subHeader: 'DATE & TIME STAMPED',
    font: 'serif',
    decorations: [
      { type: 'timestamp-analog', color: '#B05930' },
      { type: 'sticker', stickerType: 'badge-memories', x: 0.5, y: 0.89, size: 42, color: '#B05930' },
    ],
  },
  {
    id: 'photobooth-2000',
    name: 'Photo Booth 2000',
    category: 'Retro',
    background: ['#28262C'],
    textColor: '#EDE8F2',
    accentColor: '#A290B8',
    border: 'classic-kiosk',
    header: 'PHOTO BOOTH 2000',
    subHeader: 'AUTOMATIC PORTRAIT KIOSK',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'badge-besties', x: 0.5, y: 0.89, size: 42, color: '#A290B8' },
    ],
  },
  {
    id: 'vintage-cream',
    name: 'Vintage Cream',
    category: 'Retro',
    background: ['#F5EFE3', '#ECE1CF'],
    textColor: '#4A3E31',
    accentColor: '#91795E',
    border: 'subtle',
    header: 'VINTAGE PHOTOBOOTH',
    subHeader: 'CLASSIC SEPIA TONE',
    font: 'serif',
    decorations: [
      { type: 'sticker', stickerType: 'badge-memories', x: 0.5, y: 0.89, size: 40, color: '#91795E' },
    ],
  },
  {
    id: 'old-camera-black',
    name: 'Old Camera Black',
    category: 'Retro',
    background: ['#141416'],
    textColor: '#E6E5E9',
    accentColor: '#8E8C96',
    border: 'film',
    header: 'CAMERA NO. 4',
    subHeader: 'SILVER GELATIN PRINT',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'badge-kstyle', x: 0.5, y: 0.89, size: 42, color: '#8E8C96' },
    ],
  },

  // Y2K
  {
    id: 'cyber-lavender',
    name: 'Cyber Lavender',
    category: 'Y2K',
    background: ['#E9E1FA', '#D7CCF2'],
    textColor: '#392C59',
    accentColor: '#8055CD',
    border: 'silver',
    header: '✧ CYBER LAVENDER ✧',
    subHeader: 'DIGITAL ARCHIVE 2003',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'star-4point', x: 0.1, y: 0.05, size: 44, color: '#8055CD' },
      { type: 'sticker', stickerType: 'star-4point', x: 0.9, y: 0.05, size: 44, color: '#8055CD' },
      { type: 'sticker', stickerType: 'heart-chrome', x: 0.5, y: 0.89, size: 40 },
      { type: 'sticker', stickerType: 'butterfly', x: 0.08, y: 0.92, size: 40 },
      { type: 'sticker', stickerType: 'star-twinkle', x: 0.92, y: 0.92, size: 36 },
    ],
  },
  {
    id: 'chrome-heart',
    name: 'Chrome Heart',
    category: 'Y2K',
    background: ['#E7E9ED', '#D3D7DD'],
    textColor: '#272A32',
    accentColor: '#636E84',
    border: 'silver',
    header: '† CHROME HEART †',
    subHeader: 'METALLIC SERIES',
    font: 'serif',
    decorations: [
      { type: 'sticker', stickerType: 'heart-chrome', x: 0.12, y: 0.05, size: 46 },
      { type: 'sticker', stickerType: 'star-4point', x: 0.88, y: 0.05, size: 42, color: '#636E84' },
      { type: 'sticker', stickerType: 'heart-chrome', x: 0.5, y: 0.89, size: 42 },
      { type: 'sticker', stickerType: 'star-4point', x: 0.08, y: 0.92, size: 36, color: '#636E84' },
      { type: 'sticker', stickerType: 'heart-chrome', x: 0.92, y: 0.92, size: 38 },
    ],
  },
  {
    id: 'digital-camera',
    name: 'Digital Camera',
    category: 'Y2K',
    background: ['#E3EEF8', '#CEE0F2'],
    textColor: '#233952',
    accentColor: '#3F7BB3',
    border: 'white-thin',
    header: '● REC • DIGICAM 3.2MP',
    subHeader: 'SD CARD • 2048x1536',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'rec-badge', x: 0.1, y: 0.05, size: 28 },
      { type: 'text', text: 'HQ', x: 0.9, y: 0.05, size: 16, font: 'bold 16px monospace', color: '#3F7BB3' },
      { type: 'sticker', stickerType: 'star-4point', x: 0.5, y: 0.89, size: 36, color: '#3F7BB3' },
    ],
  },
  {
    id: 'pink-pixel',
    name: 'Pink Pixel',
    category: 'Y2K',
    background: ['#FBE6EE', '#F2C8DA'],
    textColor: '#5A223A',
    accentColor: '#BC467A',
    border: 'pixel',
    header: '■ PINK PIXEL ■',
    subHeader: '8-BIT MEMORY CARD',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'heart-pixel', x: 0.1, y: 0.05, size: 44, color: '#BC467A' },
      { type: 'sticker', stickerType: 'heart-pixel', x: 0.9, y: 0.05, size: 44, color: '#BC467A' },
      { type: 'sticker', stickerType: 'heart-pixel', x: 0.5, y: 0.89, size: 38, color: '#BC467A' },
    ],
  },
  {
    id: 'blue-y2k',
    name: 'Blue Y2K',
    category: 'Y2K',
    background: ['#DEE9F8', '#C8DCF4'],
    textColor: '#253B5C',
    accentColor: '#4577B5',
    border: 'white-thin',
    header: '✧ CYBER SPACE 2000 ✧',
    subHeader: 'Y2K OPTICAL DISC',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'star-4point', x: 0.1, y: 0.05, size: 44, color: '#4577B5' },
      { type: 'sticker', stickerType: 'butterfly', x: 0.9, y: 0.05, size: 42 },
      { type: 'sticker', stickerType: 'star-twinkle', x: 0.5, y: 0.89, size: 38 },
    ],
  },
  {
    id: 'silver-star',
    name: 'Silver Star',
    category: 'Y2K',
    background: ['#ECEFF3', '#DCE0E8'],
    textColor: '#32353F',
    accentColor: '#6E7584',
    border: 'silver',
    header: '★ SILVER STAR ★',
    subHeader: 'METALLIC FLASH',
    font: 'sans',
    decorations: [
      { type: 'sticker', stickerType: 'star-4point', x: 0.1, y: 0.05, size: 44, color: '#6E7584' },
      { type: 'sticker', stickerType: 'star-4point', x: 0.9, y: 0.05, size: 44, color: '#6E7584' },
      { type: 'sticker', stickerType: 'heart-chrome', x: 0.5, y: 0.89, size: 40 },
    ],
  },
];

export const STRIP_TEMPLATES = Array.from(
  new Map(RAW_STRIP_TEMPLATES.map(t => [t.id, t])).values()
);

export const TEMPLATE_CATEGORIES = [
  'All',
  'Cute',
  'Clean',
  'Scrapbook',
  'Denim',
  'Vintage',
  'Film',
  'Polaroid',
  'Minimal',
  'Playful',
  'Retro',
  'Y2K',
  'Favorites',
];

export const RECOMMENDED_TEMPLATES = {
  1: 'polaroid-hero-1',
  2: 'denim-lace-2',
  4: 'airmail-love-4',
  6: 'contact-sheet-6',
};

export function getCompatibleTemplates(count = 4, category = 'All') {
  return STRIP_TEMPLATES.filter(tpl => {
    const supports = tpl.supportedPhotoCounts || [tpl.photoSlots?.length || 4];
    const matchesCount = count ? supports.includes(count) : true;
    const matchesCategory = !category || category === 'All' || tpl.category === category;
    return matchesCount && matchesCategory;
  });
}

// Backward compatibility for FRAMES
export const FRAMES = STRIP_TEMPLATES.map(t => ({
  id: t.id,
  name: t.name,
  category: t.category,
  colors: t.background,
  ink: t.textColor,
}));

export const DEFAULT_ADJUST = { brightness: 0, contrast: 0, saturation: 0, warmth: 0, glow: false };

export const DEFAULT_EFFECT = {
  id: 'none',
  intensity: 50,
  privacyBox: { x: 0.25, y: 0.2, width: 0.5, height: 0.35 },
};

export const DEFAULT_STYLE = {
  template: 'airmail-love',
  frame: 'airmail-love',
  layout: '4-vertical',
  poseCount: 4,
  sticker: '',
  userStickers: [],
  customBg: '',
  borderStyle: 'default',
  header: '',
  text: '',
  location: 'Bandung, West Java',
  showLocation: true,
  showDate: true,
  showTime: true,
  showBrand: true,
};

export const CAPTURE_PACES = [
  { id: 'relaxed', name: 'Relaxed', countdownDuration: 1000, breakDuration: 2500, label: '3s timer • 2.5s jeda' },
  { id: 'normal', name: 'Normal', countdownDuration: 1000, breakDuration: 1800, label: '3s timer • 1.8s jeda' },
  { id: 'fast', name: 'Fast', countdownDuration: 800, breakDuration: 1000, label: '3s timer • 1.0s jeda' },
];

export const DEFAULT_PACE = 'normal';

export function colorMatrix(filterId, adjust = DEFAULT_ADJUST) {
  const p = FILTERS.find(f => f.id === filterId) || FILTERS[0];
  const b = p.brightness * (1 + (adjust?.brightness || 0) / 100) * (adjust?.glow ? 1.025 : 1);
  const c = p.contrast * (1 + (adjust?.contrast || 0) / 100) * (adjust?.glow ? 0.95 : 1);
  const s = p.saturation * (1 + (adjust?.saturation || 0) / 100);
  const warm = (p.warmth || 0) + (adjust?.warmth || 0) / 100;
  const tint = p.tint || [0, 0, 0];
  const luma = [0.2126, 0.7152, 0.0722];
  const offsets = [warm * 0.065, warm * 0.012, -warm * 0.065];
  return [0, 1, 2]
    .flatMap(row => [
      ...luma.map((v, col) => b * c * ((1 - s) * v + (row === col ? s : 0))),
      0,
      (1 - c) / 2 + offsets[row] + tint[row],
    ])
    .concat([0, 0, 0, 1, 0]);
}

export function cropRect(width, height, ratio = 4 / 3) {
  const w = Math.min(width, height * ratio);
  const h = w / ratio;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}

export function filename(date) {
  const d = new Date(date),
    pad = n => String(n).padStart(2, '0');
  return `SnapBooth-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.png`;
}
