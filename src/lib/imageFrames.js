/**
 * Artwork catalog. Apertures are calibrated in the source image's native pixels.
 * imageFrameSlots.json is the single source of truth for preview and HD export.
 * Static new URL references let Vite emit JPEGs under /assets/, which is served
 * by both the application server and the static host. /frames/ is not a server route.
 * See docs/photo-slot-layout.md to register a frame or a shaped / occluded slot.
 */
import calibratedSlots from './imageFrameSlots.json' with { type: 'json' };

const FRAME_CATALOG = [
  {
    "id": "frame-spiderman-3cut",
    "name": "Spidey Comic 3-Cut",
    "category": "Spidey",
    "src": new URL('../assets/frames/download.jpg', import.meta.url).href,
    "family": "frame-spiderman"
  },
  {
    "id": "frame-spiderman-booth-3cut",
    "name": "Spidey Booth 3-Cut",
    "category": "Spidey",
    "src": new URL('../assets/frames/ig_template_igstory_storytemplate_spiderman_spidey.jpg', import.meta.url).href,
    "family": "frame-spiderman"
  },
  {
    "id": "frame-snoopy-spiderman-2cut",
    "name": "Snoopy × Spidey 2-Cut",
    "category": "Spidey",
    "src": new URL('../assets/frames/download_12.jpg', import.meta.url).href,
    "family": "frame-snoopy"
  },
  {
    "id": "frame-babygirl-3cut",
    "name": "Baby Girl 3-Cut",
    "category": "Coquette",
    "src": new URL('../assets/frames/download_1.jpg', import.meta.url).href,
    "family": "frame-babygirl"
  },
  {
    "id": "frame-vintage-2cut",
    "name": "Vintage Gingham 2-Cut",
    "category": "Vintage",
    "src": new URL('../assets/frames/download_2.jpg', import.meta.url).href,
    "family": "frame-vintage"
  },
  {
    "id": "frame-teddy-vintage-2cut",
    "name": "Teddy Vintage 2-Cut",
    "category": "Vintage",
    "src": new URL('../assets/frames/download_3.jpg', import.meta.url).href,
    "family": "frame-teddy"
  },
  {
    "id": "frame-denim-2cut",
    "name": "Denim Bow 2-Cut",
    "category": "Denim",
    "src": new URL('../assets/frames/download_4.jpg', import.meta.url).href,
    "family": "frame-denim"
  },
  {
    "id": "frame-floral-denim-2cut",
    "name": "Floral Denim 2-Cut",
    "category": "Denim",
    "src": new URL('../assets/frames/download_5.jpg', import.meta.url).href,
    "family": "frame-denim"
  },
  {
    "id": "frame-minions-birthday-3cut",
    "name": "Minions Birthday 3-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/download_6.jpg', import.meta.url).href,
    "family": "frame-minions"
  },
  {
    "id": "frame-minions-3cut-strip",
    "name": "Minions 3-Cut Strip",
    "category": "Kawaii",
    "src": new URL('../assets/frames/download_7.jpg', import.meta.url).href,
    "family": "frame-minions"
  },
  {
    "id": "frame-minions-6cut",
    "name": "Minions 6-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/download_8.jpg', import.meta.url).href,
    "family": "frame-minions"
  },
  {
    "id": "frame-snoopy-1cut",
    "name": "Snoopy 1-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/download_9.jpg', import.meta.url).href,
    "family": "frame-snoopy"
  },
  {
    "id": "frame-snoopy-iloveyou-3cut",
    "name": "Snoopy I Love You 3-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/download_10.jpg', import.meta.url).href,
    "family": "frame-snoopy"
  },
  {
    "id": "frame-snoopy-music-3cut",
    "name": "Snoopy Music 3-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/download_18.jpg', import.meta.url).href,
    "family": "frame-snoopy"
  },
  {
    "id": "frame-snoopy-red-2cut",
    "name": "Snoopy Red Heart 2-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/jimena_.jpg', import.meta.url).href,
    "family": "frame-snoopy"
  },
  {
    "id": "frame-toystory-3cut",
    "name": "Toy Story 3-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/photostrip_toy_story__foto_punya_kak_abellll__cuma_mau_ngasih_tau_frame_nya_set_naev26meu9m.jpg', import.meta.url).href,
    "family": "frame-toystory"
  },
  {
    "id": "frame-buzztoy-4cut",
    "name": "Buzz Lightyear 4-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/download_11.jpg', import.meta.url).href,
    "family": "frame-toystory"
  },
  {
    "id": "frame-zootopia-film-2cut",
    "name": "Zootopia Film Roll 2-Cut",
    "category": "Disney",
    "src": new URL('../assets/frames/download_13.jpg', import.meta.url).href,
    "family": "frame-zootopia"
  },
  {
    "id": "frame-zootopia-message-2cut",
    "name": "Zootopia Message 2-Cut",
    "category": "Disney",
    "src": new URL('../assets/frames/download_14.jpg', import.meta.url).href,
    "family": "frame-zootopia"
  },
  {
    "id": "frame-zootopia-polaroid-2cut",
    "name": "Zootopia Polaroid 2-Cut",
    "category": "Disney",
    "src": new URL('../assets/frames/aesthetic,_vintage,_cartoon,_love_.jpg', import.meta.url).href,
    "family": "frame-zootopia"
  },
  {
    "id": "frame-vinyl-bw-3cut",
    "name": "Vinyl Record 3-Cut",
    "category": "Vintage",
    "src": new URL('../assets/frames/download_15.jpg', import.meta.url).href,
    "family": "frame-vinyl"
  },
  {
    "id": "frame-film-strip-stars-2cut",
    "name": "Film Strip Stars 6-Cut",
    "category": "Film",
    "src": new URL('../assets/frames/download_16.jpg', import.meta.url).href,
    "family": "frame-film"
  },
  {
    "id": "frame-kiki-moon-2cut",
    "name": "Kiki Moon 2-Cut",
    "category": "Aesthetic",
    "src": new URL('../assets/frames/download_17.jpg', import.meta.url).href,
    "family": "frame-kiki"
  },
  {
    "id": "frame-newspaper-punk-2cut",
    "name": "Newspaper Punk 2-Cut",
    "category": "Aesthetic",
    "src": new URL('../assets/frames/download_19.jpg', import.meta.url).href,
    "family": "frame-newspaper"
  },
  {
    "id": "frame-vintage-burgundy-3cut",
    "name": "Vintage Newspaper 3-Cut",
    "category": "Vintage",
    "src": new URL('../assets/frames/frame_1.jpg', import.meta.url).href,
    "family": "frame-vintage-burgundy"
  },
  {
    "id": "frame-vinyl-indie-3cut",
    "name": "Indie Vinyl & Stars 3-Cut",
    "category": "Vintage",
    "src": new URL('../assets/frames/frame_2.jpg', import.meta.url).href,
    "family": "frame-vinyl-indie"
  },
  {
    "id": "frame-snoopy-letter-1cut",
    "name": "Snoopy Love Letter 1-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/frame_3.jpg', import.meta.url).href,
    "family": "frame-snoopy"
  },
  {
    "id": "frame-snoopy-polka-1cut",
    "name": "Snoopy Polka Heart 1-Cut",
    "category": "Kawaii",
    "src": new URL('../assets/frames/frame_4.jpg', import.meta.url).href,
    "family": "frame-snoopy"
  },
  {
    "id": "frame-sunshine-cat-1cut",
    "name": "Sunshine Cat Scrapbook 1-Cut",
    "category": "Scrapbook",
    "src": new URL('../assets/frames/frame_5.jpg', import.meta.url).href,
    "family": "frame-sunshine-cat"
  },
  {
    "id": "frame-kunst-london-1cut",
    "name": "Retro Kunst Polaroid 1-Cut",
    "category": "Retro",
    "src": new URL('../assets/frames/frame_6.jpg', import.meta.url).href,
    "family": "frame-kunst"
  },
  {
    "id": "frame-kodak-cassette-1cut",
    "name": "Kodak 35mm Cassette 1-Cut",
    "category": "Film",
    "src": new URL('../assets/frames/frame_7.jpg', import.meta.url).href,
    "family": "frame-kodak"
  },
  {
    "id": "frame-star-clipboard-2cut",
    "name": "Star Paper Clipboard 2-Cut",
    "category": "Aesthetic",
    "src": new URL('../assets/frames/frame_8.jpg', import.meta.url).href,
    "family": "frame-clipboard"
  },
  {
    "id": "frame-agate-kunst-3cut",
    "name": "Agate & Flora Scrapbook 3-Cut",
    "category": "Vintage",
    "src": new URL('../assets/frames/frame_9.jpg', import.meta.url).href,
    "family": "frame-agate-kunst"
  },
  {
    "id": "frame-midnight-starry-4cut",
    "name": "Midnight Starry 4-Cut",
    "category": "Y2K",
    "src": new URL('../assets/frames/frame_10.jpg', import.meta.url).href,
    "family": "frame-midnight-starry"
  }
];

export const IMAGE_FRAMES = FRAME_CATALOG.map(frame => {
  const calibration = calibratedSlots[frame.id];
  if (!calibration) throw new Error(`Missing photo-slot calibration: ${frame.id}`);
  return { ...frame, ...calibration, supportedPhotoCounts: [calibration.slots.length] };
});

export function getImageFrameTemplates() {
  return IMAGE_FRAMES.map(frame => ({
    id: frame.id,
    name: frame.name,
    category: frame.category,
    family: frame.family || frame.id,
    imageFrame: true,
    imageSrc: frame.src,
    frameW: frame.frameW,
    frameH: frame.frameH,
    background: ['#FFFFFF'],
    textColor: '#1E1E24',
    accentColor: '#E11D48',
    canvas: { width: frame.frameW, height: frame.frameH },
    supportedPhotoCounts: frame.supportedPhotoCounts,
    photoSlots: frame.slots.map(slot => ({ ...slot, frameStyle: 'image-frame' })),
  }));
}

export const IMAGE_FRAME_CATEGORIES = [...new Set(IMAGE_FRAMES.map(frame => frame.category))];
