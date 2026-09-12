import React, { useEffect, useId, useState } from 'react';
import {
  Check,
  Eye,
  FlipHorizontal,
  Heart,
  Palette,
  RotateCcw,
  Shield,
  Sliders,
  Sparkles,
  Stamp,
  Wand2,
} from 'lucide-react';
import {
  DEFAULT_ADJUST,
  DEFAULT_EFFECT,
  EFFECTS,
  FILTERS,
  STRIP_TEMPLATES,
  TEMPLATE_CATEGORIES,
  colorMatrix,
} from '../lib/presets.js';

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

export function TemplateSelector({ value, onChange, onToggleFavorite, favorites = [] }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTemplates = STRIP_TEMPLATES.filter(t => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Favorites') return favorites.includes(t.id);
    return t.category === activeCategory;
  });

  return (
    <div className="template-selector-container">
      {/* Category Pills Navigation */}
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

      {filteredTemplates.length === 0 && activeCategory === 'Favorites' ? (
        <div className="empty-favorites-hint">
          <Heart size={24} />
          <p>Belum ada template favorit.</p>
          <small>Klik ikon hati pada template untuk menyimpannya di sini!</small>
        </div>
      ) : (
        <div className="template-grid" role="radiogroup" aria-label="Strip templates">
          {filteredTemplates.map(t => {
            const isSelected = value === t.id;
            const isFav = favorites.includes(t.id);
            const isGradient = t.background.length > 1;
            const bgStyle = isGradient
              ? `linear-gradient(135deg, ${t.background.join(', ')})`
              : t.background[0];

            return (
              <div
                key={t.id}
                className={`template-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onChange(t.id)}
              >
                {/* Visual Thumbnail */}
                <div
                  className="template-card-preview"
                  style={{
                    background: bgStyle,
                    color: t.textColor,
                    border: t.border === 'comic' ? '2px solid #151515' : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="template-mini-strip">
                    <span className="template-mini-header" style={{ color: t.textColor }}>
                      ★
                    </span>
                    <div className="template-mini-photos">
                      {[1, 2, 3].map(n => (
                        <div
                          key={n}
                          className="template-mini-box"
                          style={{
                            background: t.border === 'white-thin' ? '#FFF' : 'rgba(0,0,0,0.1)',
                            border: t.border === 'pixel' ? `1px solid ${t.accentColor}` : undefined,
                          }}
                        />
                      ))}
                    </div>
                    <span className="template-mini-footer" style={{ color: t.accentColor || t.textColor }}>
                      {t.decorations?.[0]?.text || '✦'}
                    </span>
                  </div>

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
                  <span className="template-card-category">{t.category}</span>
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

      {/* Intensity Slider (Shown when an effect other than 'none' is chosen) */}
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

          {/* Privacy Box Positioning Controls if Privacy Effect is selected */}
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
}) {
  const [activeTab, setActiveTab] = useState('templates');
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('snapbooth_template_favorites');
      return stored ? JSON.parse(stored) : ['lavender-minimal', 'sakura-day', 'clean-white'];
    } catch {
      return ['lavender-minimal', 'sakura-day'];
    }
  });

  const toggleFavorite = id => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('snapbooth_template_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const update = (name, value) => onChange({ ...style, [name]: value });

  const tabs = [
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'filters', label: 'Filters', icon: Sparkles },
    { id: 'effects', label: 'Effects', icon: Wand2 },
    { id: 'adjust', label: 'Adjust', icon: Sliders },
    { id: 'stamps', label: 'Stamps', icon: Stamp },
  ];

  return (
    <div className="customizer">
      {/* Compact Segmented Control / Tab Navigation */}
      <div className="edit-nav-tabs" role="tablist" aria-label="Editing sections">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`edit-tab-button ${isActive ? 'active' : ''}`}
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
              <p>Setiap strip memiliki identitas visual, ornamen estetis, dan tipografi unik.</p>
            </div>

            <label className="field">
              Layout Style
              <select
                aria-label="Layout"
                value={style.layout}
                onChange={e => update('layout', e.target.value)}
              >
                <option value="vertical">Classic Vertical (4-Cut Strip)</option>
                <option value="grid">2 × 2 Grid</option>
                <option value="wide">Wide 4-Cut</option>
              </select>
            </label>

            <TemplateSelector
              value={style.template || style.frame}
              onChange={tplId => {
                update('template', tplId);
                update('frame', tplId);
              }}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        )}

        {/* TAB 2: FILTERS */}
        {activeTab === 'filters' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Studio Color Filters</h3>
              <p>Pilih tone warna studio untuk seluruh foto.</p>
            </div>
            <FilterSelector value={filter} onChange={onFilter} sample={sample} />
          </div>
        )}

        {/* TAB 3: CREATIVE EFFECTS */}
        {activeTab === 'effects' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Creative & Privacy Effects</h3>
              <p>Pixel Blur, 8-Bit, Dream Glow, Grain, VHS, atau Sensor Wajah.</p>
            </div>
            <EffectsSelector value={effect} onChange={onEffect} />
          </div>
        )}

        {/* TAB 4: ADJUST & MIRROR */}
        {activeTab === 'adjust' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Fine Tuning & Mirror</h3>
              <p>Sesuaikan orientasi mirror dan kecerahan foto.</p>
            </div>

            <div className="mirror-settings-group">
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
              <p className="hint">
                Perubahan mirror diterapkan langsung ke Canvas tanpa mengambil foto ulang.
              </p>
            </div>

            <AdjustPanel value={adjust} onChange={onAdjust} />

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

        {/* TAB 5: STAMPS & WORDS */}
        {activeTab === 'stamps' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h3>Stickers & Details</h3>
              <p>Tambahkan sentuhan personal pada bagian bawah photostrip.</p>
            </div>

            <div className="sticker-list">
              {[
                ['', 'No Sticker'],
                ['♡', 'Heart'],
                ['★', 'Star'],
                ['✦', 'Sparkle'],
                ['🎀', 'Ribbon'],
                ['🌸', 'Blossom'],
                ['🍀', 'Clover'],
                ['🍓', 'Berry'],
                ['🐰', 'Bunny'],
              ].map(([sticker, label]) => (
                <button
                  key={label}
                  type="button"
                  className={style.sticker === sticker ? 'selected' : ''}
                  aria-label={label}
                  aria-pressed={style.sticker === sticker}
                  title={label}
                  onClick={() => update('sticker', sticker)}
                >
                  {sticker || 'None'}
                </button>
              ))}
            </div>

            <Toggle
              label="Location"
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
                <small>Label lokasi tercetak di bawah strip.</small>
              </label>
            )}

            <Toggle label="Date" checked={style.showDate} onChange={v => update('showDate', v)} />
            <Toggle label="Time" checked={style.showTime} onChange={v => update('showTime', v)} />
            <Toggle
              label="Brand stamp"
              checked={style.showBrand}
              onChange={v => update('showBrand', v)}
            />

            <label className="field" style={{ marginTop: '15px' }}>
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
              <small>{style.text.length} / 60 characters</small>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
