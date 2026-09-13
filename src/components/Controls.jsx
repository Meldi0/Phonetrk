import React, { useEffect, useId, useState } from 'react';
import {
  Check,
  FlipHorizontal,
  Grid,
  Heart,
  Palette,
  Plus,
  Redo2,
  RotateCcw,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Stamp,
  Trash2,
  Type,
  Undo2,
  Wand2,
} from 'lucide-react';
import {
  DEFAULT_ADJUST,
  DEFAULT_EFFECT,
  EFFECTS,
  FILTERS,
  LAYOUT_OPTIONS,
  STRIP_TEMPLATES,
  TEMPLATE_CATEGORIES,
  RECOMMENDED_TEMPLATES,
  colorMatrix,
} from '../lib/presets.js';
import { STICKER_CATEGORIES, STICKER_LIBRARY } from '../lib/stickers.js';
import { getTemplateThumbnail } from '../lib/thumbnails.js';
import { NON_FORMAL_FONTS } from './TextCanvasEditor.jsx';

export function FilterDefinitions({ filter, adjust, id }) {
  return (
    <svg className="filter-defs" aria-hidden="true">
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={colorMatrix(filter, adjust).join(' ')} />
        </filter>
      </defs>
    </svg>
  );
}

export function FilterSelector({ value, onChange, disabled, sample }) {
  const uid = useId().replaceAll(':', '');
  return (
    <div className="filter-rail" aria-label="Photo filters">
      {FILTERS.map(f => (
        <button
          key={f.id}
          className={`filter-item ${value === f.id ? 'selected' : ''}`}
          aria-pressed={value === f.id}
          disabled={disabled}
          onClick={() => onChange(f.id)}
          title={f.name}
        >
          <FilterDefinitions id={`${uid}-${f.id}`} filter={f.id} adjust={DEFAULT_ADJUST} />
          <span className="filter-thumbnail" style={{ filter: `url(#${uid}-${f.id})` }}>
            {sample ? (
              <img src={sample} alt="" />
            ) : (
              <svg viewBox="0 0 100 75" aria-hidden="true">
                <rect width="100" height="75" fill="#d6c4b8" />
                <path d="M0 49L100 36V75H0Z" fill="#ece5d9" />
                <ellipse cx="49" cy="63" rx="28" ry="5" fill="#bcb2a6" />
                <path d="M35 31H65L61 62H39Z" fill="#f5ede2" />
                <path d="M49 35Q35 6 29 14Q28 30 49 35M50 34Q67 5 72 13Q75 27 50 34" fill="#708673" />
                <path d="M50 40V15" stroke="#657967" strokeWidth="2" />
                <circle cx="49" cy="12" r="8" fill="#c88880" />
              </svg>
            )}
          </span>
          <span>{f.name}</span>
        </button>
      ))}
    </div>
  );
}

export function TemplateSelector({ value, onChange, onToggleFavorite, favorites = [], photoCount = 4 }) {
  const [countFilter, setCountFilter] = useState(photoCount || 4);
  const [activeCategory, setActiveCategory] = useState('All');

  // Sync count filter when photoCount changes externally
  useEffect(() => {
    if (photoCount) {
      setCountFilter(photoCount);
    }
  }, [photoCount]);

  const COUNT_TABS = [
    { value: 1, label: '1 Foto' },
    { value: 2, label: '2 Cut' },
    { value: 4, label: '4 Cut' },
    { value: 6, label: '6 Cut' },
    { value: 'all', label: 'Semua' },
  ];

  const filteredTemplates = STRIP_TEMPLATES.filter(t => {
    // 1. Photo Count matching
    if (countFilter !== 'all') {
      const supported = t.supportedPhotoCounts || [t.photoSlots?.length || t.recommendedPoses || 4];
      if (!supported.includes(Number(countFilter))) {
        return false;
      }
    }

    // 2. Category matching
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Favorites') return favorites.includes(t.id);
    return t.category === activeCategory;
  });

  return (
    <div className="template-selector-container">
      {/* Level 1: Photo Count Tabs */}
      <div className="template-filter-header">
        <div className="count-pill-rail" role="tablist" aria-label="Photo count filters">
          {COUNT_TABS.map(tab => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={countFilter === tab.value}
              className={`count-pill ${countFilter === tab.value ? 'active' : ''}`}
              onClick={() => setCountFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="template-matching-info">
          <span>
            {countFilter === 'all'
              ? `Semua template (${filteredTemplates.length} desain)`
              : `Khusus ${countFilter} foto (${filteredTemplates.length} desain siap pakai)`}
          </span>
        </div>
      </div>

      {/* Level 2: Category Pills Navigation */}
      <div className="category-pill-rail" role="tablist" aria-label="Template categories">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'Favorites' ? `♥ Favorites (${favorites.length})` : cat}
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="empty-favorites-hint">
          {activeCategory === 'Favorites' ? (
            <>
              <Heart size={24} />
              <p>Belum ada template favorit untuk pilihan ini.</p>
              <small>Klik ikon hati pada template untuk menyimpannya di sini!</small>
            </>
          ) : (
            <>
              <p>Tidak ada template yang cocok dengan kombinasi filter ini.</p>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setCountFilter('all');
                  setActiveCategory('All');
                }}
              >
                Tampilkan Semua Template
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="template-grid" role="radiogroup" aria-label="Strip templates">
          {filteredTemplates.map(t => {
            const isSelected = value === t.id;
            const isFav = favorites.includes(t.id);
            const thumb = getTemplateThumbnail(t.id);
            const cuts = t.supportedPhotoCounts || [t.photoSlots?.length || t.recommendedPoses || 4];

            return (
              <div
                key={t.id}
                className={`template-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onChange(t.id)}
              >
                {/* Visual Thumbnail showing real photostrip artwork */}
                <div className="template-card-preview">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={t.name}
                      className="template-card-thumb-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="template-mini-strip">
                      <span className="template-mini-header">{t.name}</span>
                    </div>
                  )}

                  {/* Favorite Toggle Button */}
                  <button
                    type="button"
                    className={`favorite-button ${isFav ? 'active' : ''}`}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={e => {
                      e.stopPropagation();
                      onToggleFavorite(t.id);
                    }}
                  >
                    <Heart size={14} fill={isFav ? '#E05A7B' : 'none'} color={isFav ? '#E05A7B' : '#FFF'} />
                  </button>

                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="selected-badge">
                      <Check size={14} color="#FFF" />
                    </div>
                  )}
                </div>

                <div className="template-card-info">
                  <strong className="template-card-name">{t.name}</strong>
                  <div className="template-card-meta">
                    <span className="template-card-category">{t.category}</span>
                    <span className="template-poses-tag">
                      {cuts.length === 1 ? `${cuts[0]} Cut` : `${cuts.join('/')} Cut`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EffectsSelector({ value, onChange }) {
  const [effectCategory, setEffectCategory] = useState('All');
  const effectId = value?.id || 'none';
  const intensity = value?.intensity ?? 50;
  const privacyBox = value?.privacyBox || { x: 0.25, y: 0.2, width: 0.5, height: 0.35 };

  const filteredEffects = EFFECTS.filter(e => {
    if (effectCategory === 'All') return true;
    return e.category === effectCategory;
  });

  function selectEffect(id) {
    const eff = EFFECTS.find(e => e.id === id);
    onChange({
      ...value,
      id,
      intensity: eff?.defaultIntensity ?? 50,
      privacyBox,
    });
  }

  function updateIntensity(newIntensity) {
    onChange({
      ...value,
      intensity: newIntensity,
    });
  }

  function updatePrivacyPosition(positionPreset) {
    let newBox = { ...privacyBox };
    if (positionPreset === 'eyes') {
      newBox = { x: 0.2, y: 0.22, width: 0.6, height: 0.16 };
    } else if (positionPreset === 'face') {
      newBox = { x: 0.22, y: 0.16, width: 0.56, height: 0.44 };
    } else if (positionPreset === 'mouth') {
      newBox = { x: 0.25, y: 0.42, width: 0.5, height: 0.22 };
    }
    onChange({
      ...value,
      privacyBox: newBox,
    });
  }

  return (
    <div className="effects-panel">
      {/* Category Pills */}
      <div className="category-pill-rail">
        {['All', 'Creative', 'Privacy'].map(cat => (
          <button
            key={cat}
            type="button"
            className={`category-pill ${effectCategory === cat ? 'active' : ''}`}
            onClick={() => setEffectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Effect Cards Rail / Grid */}
      <div className="effect-grid">
        {filteredEffects.map(e => {
          const isSelected = effectId === e.id;
          return (
            <button
              key={e.id}
              type="button"
              className={`effect-card ${isSelected ? 'selected' : ''}`}
              onClick={() => selectEffect(e.id)}
            >
              <div className="effect-card-icon">
                {e.category === 'Privacy' ? <Shield size={18} /> : <Wand2 size={18} />}
              </div>
              <strong>{e.name}</strong>
              <small>{e.description}</small>
              {isSelected && (
                <span className="effect-selected-check">
                  <Check size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Intensity Slider */}
      {effectId !== 'none' && (
        <div className="effect-controls-box">
          <label className="slider-label">
            <span>
              <strong>Effect Intensity</strong>
              <span>{intensity}%</span>
            </span>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={intensity}
              onChange={e => updateIntensity(Number(e.target.value))}
            />
          </label>

          {/* Privacy Box Positioning Controls */}
          {['pixel-face', 'blur-face', 'black-bar'].includes(effectId) && (
            <div className="privacy-box-controls">
              <span className="label-small">Censor Position Target:</span>
              <div className="preset-buttons">
                <button
                  type="button"
                  className="button-sm"
                  onClick={() => updatePrivacyPosition('eyes')}
                >
                  Eyes Area
                </button>
                <button
                  type="button"
                  className="button-sm"
                  onClick={() => updatePrivacyPosition('face')}
                >
                  Full Face
                </button>
                <button
                  type="button"
                  className="button-sm"
                  onClick={() => updatePrivacyPosition('mouth')}
                >
                  Lower Face
                </button>
              </div>
              <p className="hint" style={{ marginTop: '6px' }}>
                Area sensor diterapkan langsung ke Canvas foto saat preview dan unduhan.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden="true" />
    </label>
  );
}

export function AdjustPanel({ value, onChange }) {
  return (
    <div className="adjust-panel">
      {['brightness', 'contrast', 'saturation', 'warmth'].map(name => (
        <label className="slider-label" key={name}>
          <span>
            <span className="capitalize">{name}</span>
            <span aria-hidden="true">
              {value[name] > 0 ? '+' : ''}
              {value[name]}
            </span>
          </span>
          <input
            type="range"
            aria-label={name[0].toUpperCase() + name.slice(1)}
            min="-35"
            max="35"
            step="1"
            value={value[name]}
            onChange={e => onChange({ ...value, [name]: Number(e.target.value) })}
          />
        </label>
      ))}
      <Toggle label="Soft Glow" checked={value.glow} onChange={glow => onChange({ ...value, glow })} />
      <p className="hint">A gentle lift in light and softer contrast. Your features stay your own.</p>
      <button className="text-button" onClick={() => onChange({ ...DEFAULT_ADJUST })}>
        <RotateCcw size={14} />
        Reset adjustments
      </button>
    </div>
  );
}

export function Customizer({
  style,
  onChange,
  filter,
  onFilter,
  adjust,
  onAdjust,
  effect,
  onEffect,
  sample,
  mirrorResult,
  onMirrorResult,
  mirrorAll,
  onMirrorAll,
  onResetAll,
  selectedStickerId,
  onSelectSticker,
  onAddSticker,
  canUndoStickers,
  canRedoStickers,
  onUndoStickers,
  onRedoStickers,
  onClearStickers,
  photoCount,
  selectedTextId,
  onSelectText,
  onAddText,
}) {
  const [activeTab, setActiveTab] = useState('templates');
  const [stickerCategory, setStickerCategory] = useState('All');
  const [stickerSearch, setStickerSearch] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('cisspic_template_favorites') || localStorage.getItem('snapbooth_template_favorites');
      return stored ? JSON.parse(stored) : ['lavender-minimal', 'sakura-day', 'clean-white'];
    } catch {
      return ['lavender-minimal', 'sakura-day'];
    }
  });

  const [favoriteStickers, setFavoriteStickers] = useState(() => {
    try {
      const stored = localStorage.getItem('cisspic_sticker_favorites') || localStorage.getItem('snapbooth_sticker_favorites');
      return stored ? JSON.parse(stored) : ['red-stitched-star', 'burgundy-lily', 'chrome-star-3d'];
    } catch {
      return ['red-stitched-star', 'burgundy-lily'];
    }
  });

  const toggleFavorite = id => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('cisspic_template_favorites', JSON.stringify(next));
        localStorage.setItem('snapbooth_template_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleStickerFavorite = (id, e) => {
    e.stopPropagation();
    setFavoriteStickers(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('cisspic_sticker_favorites', JSON.stringify(next));
        localStorage.setItem('snapbooth_sticker_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const update = (name, value) => onChange({ ...style, [name]: value });

  const tabs = [
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'layout', label: 'Grid / Layout', icon: Grid },
    { id: 'stickers', label: 'Stickers', icon: Stamp },
    { id: 'text', label: 'Teks & Font', icon: Type },
    { id: 'filters', label: 'Filters', icon: Sparkles },
    { id: 'effects', label: 'Effects', icon: Wand2 },
    { id: 'adjust', label: 'Adjust & Theme', icon: Sliders },
  ];

  const userStickers = Array.isArray(style.userStickers) ? style.userStickers : [];

  const [newTextContent, setNewTextContent] = useState('');
  const [selectedFont, setSelectedFont] = useState('Caveat');
  const [selectedTextColor, setSelectedTextColor] = useState('#FFFFFF');
  const [selectedTextSize, setSelectedTextSize] = useState(36);
  const [hasBgPill, setHasBgPill] = useState(false);
  const [bgPillColor, setBgPillColor] = useState('rgba(18, 20, 24, 0.85)');

  const userTexts = Array.isArray(style.userTexts) ? style.userTexts : [];

  function handleCreateText(e) {
    e?.preventDefault();
    const content = newTextContent.trim() || 'CissPic Memories ★';
    const instanceId = 'txt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const maxZ = userTexts.reduce((max, t) => Math.max(max, t.zIndex || 1), 1);
    const count = userTexts.length;
    const staggerY = 0.82 + ((count % 3) - 1) * 0.05;

    const newText = {
      id: instanceId,
      text: content,
      font: selectedFont,
      fontSize: selectedTextSize,
      color: selectedTextColor,
      hasBg: hasBgPill,
      bgColor: bgPillColor,
      x: 0.50,
      y: Math.max(0.15, Math.min(0.92, staggerY)),
      rotation: 0,
      scale: 1.0,
      zIndex: maxZ + 1,
    };

    if (onAddText) {
      onAddText(newText);
    } else {
      const next = [...userTexts, newText];
      update('userTexts', next);
      onSelectText?.(instanceId);
    }
    setNewTextContent('');
  }

  function handleDeleteTextItem(id) {
    const next = userTexts.filter(t => t.id !== id);
    update('userTexts', next);
    if (selectedTextId === id) onSelectText?.(null);
  }

  const filteredStickers = STICKER_LIBRARY.filter(s => {
    if (stickerSearch.trim()) {
      const q = stickerSearch.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchTags = s.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchTags) return false;
    }
    if (stickerCategory === 'All') return true;
    if (stickerCategory === 'Favorites') return favoriteStickers.includes(s.id);
    return s.category === stickerCategory;
  });

  function handleAddSticker(stk) {
    const instanceId = 'stk_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const maxZ = userStickers.reduce((max, s) => Math.max(max, s.zIndex || 1), 1);
    const newStk = {
      instanceId,
      stickerId: stk.id,
      x: 0.50,
      y: 0.45,
      scale: stk.defaultScale || 0.18,
      rotation: 0,
      flipX: false,
      zIndex: maxZ + 1,
    };
    if (onAddSticker) {
      onAddSticker(newStk);
    } else {
      const next = [...userStickers, newStk];
      update('userStickers', next);
      onSelectSticker?.(instanceId);
    }
  }

  return (
    <div className="customizer">
      {/* Compact Segmented Control / Tab Navigation */}
      <div className="edit-nav-tabs" role="tablist" aria-label="Editing sections">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`edit-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="tab-panel-container">
        {/* TAB 1: STRIP TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Choose Strip Template</h3>
              <p>Klik template untuk langsung mengubah tema, warna, dan hiasan strip!</p>
            </div>

            {/* Atomic update of both template and frame */}
            <TemplateSelector
              value={style.template || style.frame}
              photoCount={photoCount || style.poseCount || 4}
              onChange={tplId => {
                onChange({ ...style, template: tplId, frame: tplId, customBg: '' });
              }}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        )}

        {/* TAB 2: GRID & LAYOUT */}
        {activeTab === 'layout' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Strip Grid & Pose Count</h3>
              <p>Pilih jumlah foto dan tata letak grid (1, 2, 4, atau 6 foto).</p>
            </div>

            <div className="layout-card-grid">
              {LAYOUT_OPTIONS.map(opt => {
                const isSelected = style.layout === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`layout-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      const newPoseCount = opt.poses;
                      let nextTemplate = style.template;
                      const curTpl = STRIP_TEMPLATES.find(t => t.id === style.template);
                      if (curTpl && curTpl.supportedPhotoCounts && !curTpl.supportedPhotoCounts.includes(newPoseCount)) {
                        const family = curTpl.family || curTpl.id.replace(/-\d+$/, '');
                        const famMatch = STRIP_TEMPLATES.find(
                          t => (t.family === family || t.id.startsWith(family)) &&
                               t.supportedPhotoCounts?.includes(newPoseCount)
                        );
                        nextTemplate = famMatch?.id || RECOMMENDED_TEMPLATES[newPoseCount] || style.template;
                      }
                      onChange({
                        ...style,
                        layout: opt.id,
                        poseCount: newPoseCount,
                        template: nextTemplate,
                        frame: nextTemplate,
                      });
                    }}
                  >
                    <div className="layout-card-icon">
                      <Grid size={18} />
                      <span className="layout-poses-badge">{opt.poses} Foto</span>
                    </div>
                    <strong>{opt.name}</strong>
                    <small>{opt.label}</small>
                    {isSelected && (
                      <span className="layout-selected-check">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GRAPHIC STICKERS */}
        {activeTab === 'stickers' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <div className="tab-title-row">
                <div>
                  <h3>Scrapbook Stickers</h3>
                  <p>Stiker fisik: patch rajut, bunga lili, 35mm film, piringan hitam, & retro ephemera.</p>
                </div>
                <div className="sticker-history-actions">
                  <button
                    type="button"
                    className="icon-action-btn"
                    onClick={onUndoStickers}
                    disabled={!canUndoStickers}
                    title="Undo aksi stiker"
                    aria-label="Undo"
                  >
                    <Undo2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-action-btn"
                    onClick={onRedoStickers}
                    disabled={!canRedoStickers}
                    title="Redo aksi stiker"
                    aria-label="Redo"
                  >
                    <Redo2 size={16} />
                  </button>
                  {userStickers.length > 0 && (
                    <button
                      type="button"
                      className="icon-action-btn danger"
                      onClick={onClearStickers}
                      title="Hapus semua stiker"
                      aria-label="Clear all stickers"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sticker Search Bar */}
            <div className="sticker-search-bar">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Cari stiker (star, lily, denim, camera...)"
                value={stickerSearch}
                onChange={e => setStickerSearch(e.target.value)}
              />
              {stickerSearch && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setStickerSearch('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sticker Categories Rail */}
            <div className="category-pill-rail">
              {STICKER_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${stickerCategory === cat ? 'active' : ''}`}
                  onClick={() => setStickerCategory(cat)}
                >
                  {cat === 'Favorites' ? `♥ ${cat}` : cat}
                </button>
              ))}
            </div>

            {/* Active Stickers Counter & Notice */}
            <div className="sticker-info-strip">
              <span>{filteredStickers.length} stiker tersedia</span>
              {userStickers.length > 0 && (
                <span className="active-badge">{userStickers.length} terpasang</span>
              )}
            </div>

            {/* Sticker Catalog Grid */}
            <div className="sticker-catalog-grid">
              {filteredStickers.map(stk => {
                const isFav = favoriteStickers.includes(stk.id);
                return (
                  <div
                    key={stk.id}
                    className="sticker-catalog-card"
                    onClick={() => handleAddSticker(stk)}
                    title={`Tambah ${stk.name}`}
                  >
                    <button
                      type="button"
                      className={`sticker-fav-heart ${isFav ? 'active' : ''}`}
                      onClick={e => toggleStickerFavorite(stk.id, e)}
                      title={isFav ? 'Hapus favorit' : 'Favoritkan'}
                      aria-label="Toggle favorite"
                    >
                      <Heart size={12} fill={isFav ? '#E53935' : 'transparent'} />
                    </button>
                    <div className="sticker-thumb-container">
                      <img
                        src={stk.src}
                        alt={stk.name}
                        className="sticker-thumb-img"
                        loading="lazy"
                      />
                    </div>
                    <span className="sticker-card-name">{stk.name}</span>
                  </div>
                );
              })}
              {filteredStickers.length === 0 && (
                <div className="sticker-empty-catalog">
                  <p>Tidak ada stiker yang cocok dengan kata kunci.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: TEKS & NON-FORMAL FONT */}
        {activeTab === 'text' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Tambah Teks & Font Lucu</h3>
              <p>Tambahkan teks bebas dengan font estetik (handwriting, marker, pixel, bouncy script). Geser dan atur teks di atas foto!</p>
            </div>

            <form onSubmit={handleCreateText} className="text-editor-form">
              <label className="field">
                Isi Teks / Tulisan:
                <input
                  type="text"
                  maxLength={60}
                  placeholder="Contoh: BESTIES FOR LIFE ★"
                  value={newTextContent}
                  onChange={e => setNewTextContent(e.target.value)}
                />
              </label>

              <div className="theme-section" style={{ marginTop: '10px' }}>
                <span className="label-small">Pilih Gaya Font Estetik:</span>
                <div className="font-chip-grid">
                  {NON_FORMAL_FONTS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      className={`font-chip ${selectedFont === f.id ? 'active' : ''}`}
                      onClick={() => setSelectedFont(f.id)}
                    >
                      <span className="font-chip-preview" style={{ fontFamily: f.family }}>
                        {f.preview}
                      </span>
                      <span className="font-chip-label">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color & Palette */}
              <div className="theme-section" style={{ marginTop: '12px' }}>
                <span className="label-small">Warna Teks:</span>
                <div className="color-swatches">
                  {[
                    { name: 'Putih', value: '#FFFFFF' },
                    { name: 'Hitam', value: '#18181B' },
                    { name: 'Rose Pink', value: '#F43F5E' },
                    { name: 'Canary Gold', value: '#FACC15' },
                    { name: 'Sky Cyan', value: '#38BDF8' },
                    { name: 'Lime Green', value: '#A3E635' },
                    { name: 'Lavender', value: '#C084FC' },
                    { name: 'Racing Red', value: '#DC2626' },
                  ].map(sw => (
                    <button
                      key={sw.value}
                      type="button"
                      className={`color-swatch-circle ${selectedTextColor === sw.value ? 'selected' : ''}`}
                      style={{ background: sw.value }}
                      title={sw.name}
                      onClick={() => setSelectedTextColor(sw.value)}
                    >
                      {selectedTextColor === sw.value && (
                        <Check size={12} color={sw.value === '#FFFFFF' || sw.value === '#FAF6EC' ? '#111' : '#FFF'} />
                      )}
                    </button>
                  ))}
                  <label className="color-swatch-circle color-picker-custom-swatch" title="Pilih Warna Bebas (Wheel)">
                    <input
                      type="color"
                      value={selectedTextColor}
                      onChange={e => setSelectedTextColor(e.target.value)}
                    />
                    <span style={{ fontSize: '10px' }}>🎨</span>
                  </label>
                </div>
              </div>

              {/* Font Size Slider */}
              <div className="theme-section" style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="label-small">Ukuran Font:</span>
                  <span className="label-small" style={{ fontWeight: 700 }}>{selectedTextSize}px</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={64}
                  value={selectedTextSize}
                  onChange={e => setSelectedTextSize(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Background Pill Toggle */}
              <div className="theme-section" style={{ marginTop: '12px' }}>
                <label className="checkbox-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasBgPill}
                    onChange={e => setHasBgPill(e.target.checked)}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Gunakan Latar Belakang Badge / Pill</span>
                </label>

                {hasBgPill && (
                  <div className="color-swatches" style={{ marginTop: '8px' }}>
                    {[
                      { name: 'Dark Semi-transparent', value: 'rgba(18, 20, 24, 0.85)' },
                      { name: 'White Solid', value: '#FFFFFF' },
                      { name: 'Pastel Pink', value: '#F43F5E' },
                      { name: 'Neon Cyber', value: '#6366F1' },
                      { name: 'Lemon', value: '#EAB308' },
                    ].map(sw => (
                      <button
                        key={sw.name}
                        type="button"
                        className={`color-swatch-circle ${bgPillColor === sw.value ? 'selected' : ''}`}
                        style={{ background: sw.value }}
                        title={sw.name}
                        onClick={() => setBgPillColor(sw.value)}
                      >
                        {bgPillColor === sw.value && <Check size={12} color="#fff" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="button primary"
                style={{ width: '100%', marginTop: '14px' }}
              >
                <Plus size={16} />
                Tambah Teks ke Strip
              </button>
            </form>

            {/* List of active texts on strip */}
            {userTexts.length > 0 && (
              <div className="active-texts-section" style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                <span className="label-small">Teks yang Sudah Dipasang ({userTexts.length}):</span>
                <div className="active-texts-list">
                  {userTexts.map(t => (
                    <div
                      key={t.id}
                      className={`active-text-item ${selectedTextId === t.id ? 'selected' : ''}`}
                      onClick={() => onSelectText?.(t.id)}
                    >
                      <span className="active-text-preview" style={{ fontFamily: t.font || 'Caveat', color: t.color }}>
                        {t.text}
                      </span>
                      <div className="active-text-actions">
                        <span className="badge-font-tag">{t.font || 'Caveat'}</span>
                        <button
                          type="button"
                          className="button-icon-del"
                          title="Hapus teks ini"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteTextItem(t.id);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FILTERS */}
        {activeTab === 'filters' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Studio Color Filters</h3>
              <p>Pilih tone warna studio untuk seluruh foto.</p>
            </div>
            <FilterSelector value={filter} onChange={onFilter} sample={sample} />
          </div>
        )}

        {/* TAB 5: CREATIVE EFFECTS */}
        {activeTab === 'effects' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Creative & Privacy Effects</h3>
              <p>Pixel Blur, 8-Bit, Dream Glow, Grain, VHS, atau Sensor Wajah.</p>
            </div>
            <EffectsSelector value={effect} onChange={onEffect} />
          </div>
        )}

        {/* TAB 6: ADJUST & THEME */}
        {activeTab === 'adjust' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Theme Customizer & Fine Tuning</h3>
              <p>Sesuaikan orientasi mirror, background, border, dan detail teks.</p>
            </div>

            {/* Background Color Swatches & Manual Color Wheel */}
            <div className="theme-section">
              <span className="label-small">Warna Background Frame (Preset / Manual):</span>
              <div className="color-swatches">
                {[
                  { name: 'Default Template', value: '' },
                  { name: 'Pure White', value: '#FFFFFF' },
                  { name: 'Midnight Noir', value: '#141318' },
                  { name: 'Silver Digicam', value: '#CBD5E1' },
                  { name: 'Baby Pink', value: '#FDF1F4' },
                  { name: 'Baby Blue', value: '#EDF4FB' },
                  { name: 'Lavender Pastel', value: '#ECE6F4' },
                  { name: 'Butter Cream', value: '#FAF6EC' },
                  { name: 'Matcha Green', value: '#E8EFE9' },
                  { name: 'Racing Red', value: '#DC2626' },
                  { name: 'Cyber Violet', value: '#7C3AED' },
                ].map(sw => (
                  <button
                    key={sw.name}
                    type="button"
                    className={`color-swatch-circle ${style.customBg === sw.value ? 'selected' : ''}`}
                    style={{ background: sw.value || 'linear-gradient(45deg, #ccc 25%, #fff 25%, #fff 75%, #ccc 75%)' }}
                    title={sw.name}
                    onClick={() => update('customBg', sw.value)}
                  >
                    {style.customBg === sw.value && (
                      <Check size={12} color={sw.value === '#141318' || sw.value === '#DC2626' || sw.value === '#7C3AED' ? '#FFF' : '#333'} />
                    )}
                  </button>
                ))}
              </div>

              {/* Manual Color Wheel Picker */}
              <div className="custom-color-picker-row" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label className="color-wheel-btn" title="Pilih Warna Bebas (Color Wheel)">
                  <input
                    type="color"
                    value={style.customBg && style.customBg.startsWith('#') ? style.customBg : '#ffffff'}
                    onChange={e => update('customBg', e.target.value)}
                  />
                  <span className="color-wheel-indicator" style={{ background: style.customBg || '#ffffff' }} />
                  <span>Pilih Warna Manual (Wheel)</span>
                </label>
                {style.customBg && (
                  <button
                    type="button"
                    className="button-link-small"
                    style={{ fontSize: '12px', background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => update('customBg', '')}
                  >
                    Reset ke Warna Template
                  </button>
                )}
              </div>
            </div>

            {/* Photo Border Styles */}
            <div className="theme-section" style={{ marginTop: '12px' }}>
              <span className="label-small">Photo Border Style:</span>
              <div className="border-style-group">
                {[
                  { id: 'default', label: 'Template Default' },
                  { id: 'polaroid', label: 'Polaroid White' },
                  { id: 'film', label: '35mm Film' },
                  { id: 'comic', label: 'Comic Bold' },
                  { id: 'silver', label: 'Silver Y2K' },
                  { id: 'pixel', label: 'Pixel Art' },
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    className={`border-pill ${(style.borderStyle || 'default') === b.id ? 'active' : ''}`}
                    onClick={() => update('borderStyle', b.id)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mirror-settings-group" style={{ marginTop: '14px' }}>
              <Toggle
                label="Mirror Result (Final photo & photostrip mirrored)"
                checked={mirrorResult}
                onChange={onMirrorResult}
              />
              <Toggle
                label="Mirror All Photos (Apply orientation to all poses)"
                checked={mirrorAll}
                onChange={onMirrorAll}
              />
            </div>

            <AdjustPanel value={adjust} onChange={onAdjust} />

            <div className="theme-section" style={{ marginTop: '15px' }}>
              <Toggle
                label="Show Location Label"
                checked={style.showLocation}
                onChange={v => update('showLocation', v)}
              />
              {style.showLocation && (
                <label className="field">
                  Location label
                  <input
                    maxLength={48}
                    value={style.location}
                    onChange={e => update('location', e.target.value)}
                  />
                </label>
              )}
              <Toggle label="Show Date" checked={style.showDate} onChange={v => update('showDate', v)} />
              <Toggle label="Show Time" checked={style.showTime} onChange={v => update('showTime', v)} />
              <Toggle label="Show Brand" checked={style.showBrand} onChange={v => update('showBrand', v)} />

              <label className="field" style={{ marginTop: '10px' }}>
                Custom Header Title
                <input
                  maxLength={24}
                  placeholder="Kosongkan untuk menggunakan header template"
                  value={style.header}
                  onChange={e => update('header', e.target.value)}
                />
              </label>
              <label className="field">
                Keepsake Message
                <textarea
                  rows={2}
                  maxLength={60}
                  placeholder="A day to remember."
                  value={style.text}
                  onChange={e => update('text', e.target.value)}
                />
              </label>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--line)' }}>
              <button
                type="button"
                className="button secondary"
                style={{ width: '100%' }}
                onClick={onResetAll}
              >
                <RotateCcw size={15} />
                Reset Filter, Efek & Adjust ke Default
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
