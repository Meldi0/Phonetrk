import React, { useId } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { colorMatrix, DEFAULT_ADJUST, FILTERS, FRAMES } from '../lib/presets.js';

export function FilterDefinitions({ filter, adjust, id }) {
  return <svg className="filter-defs" aria-hidden="true"><defs>
    <filter id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={colorMatrix(filter, adjust).join(' ')} /></filter>
  </defs></svg>;
}
export function FilterSelector({ value, onChange, disabled, sample }) {
  const uid = useId().replaceAll(':', '');
  return <div className="filter-rail" aria-label="Photo filters">
    {FILTERS.map(f => <button key={f.id} className={`filter-item ${value === f.id ? 'selected' : ''}`} aria-pressed={value === f.id} disabled={disabled} onClick={() => onChange(f.id)}>
      <FilterDefinitions id={`${uid}-${f.id}`} filter={f.id} adjust={DEFAULT_ADJUST} />
      <span className="filter-thumbnail" style={{ filter: `url(#${uid}-${f.id})` }}>
        {sample ? <img src={sample} alt="" /> : <svg viewBox="0 0 100 75" aria-hidden="true"><rect width="100" height="75" fill="#d6c4b8" /><path d="M0 49L100 36V75H0Z" fill="#ece5d9" /><ellipse cx="49" cy="63" rx="28" ry="5" fill="#bcb2a6" /><path d="M35 31H65L61 62H39Z" fill="#f5ede2" /><path d="M49 35Q35 6 29 14Q28 30 49 35M50 34Q67 5 72 13Q75 27 50 34" fill="#708673" /><path d="M50 40V15" stroke="#657967" strokeWidth="2" /><circle cx="49" cy="12" r="8" fill="#c88880" /></svg>}
      </span><span>{f.name}</span>
    </button>)}
  </div>;
}
export function Toggle({ label, checked, onChange }) {
  return <label className="toggle-row"><span>{label}</span><input type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)} /><span className="toggle-track" aria-hidden="true" /></label>;
}
export function AdjustPanel({ value, onChange }) {
  return <div className="adjust-panel">
    {['brightness', 'contrast', 'saturation', 'warmth'].map(name => <label className="slider-label" key={name}>
      <span><span className="capitalize">{name}</span><span aria-hidden="true">{value[name] > 0 ? '+' : ''}{value[name]}</span></span>
      <input type="range" aria-label={name[0].toUpperCase() + name.slice(1)} min="-35" max="35" step="1" value={value[name]} onChange={e => onChange({ ...value, [name]: Number(e.target.value) })} />
    </label>)}
    <Toggle label="Soft Glow" checked={value.glow} onChange={glow => onChange({ ...value, glow })} />
    <p className="hint">A gentle lift in light and softer contrast. Your features stay your own.</p>
    <button className="text-button" onClick={() => onChange({ ...DEFAULT_ADJUST })}><RotateCcw size={14} />Reset adjustments</button>
  </div>;
}
export function Customizer({ style, onChange, filter, onFilter, adjust, onAdjust, sample }) {
  const update = (name, value) => onChange({ ...style, [name]: value });
  return <div className="customizer">
    <details open><summary><span>Frame & layout</span><span>01</span></summary><div className="detail-content">
      <label className="field">Layout<select aria-label="Layout" value={style.layout} onChange={e => update('layout', e.target.value)}>
        <option value="vertical">Classic Vertical</option><option value="grid">2 × 2 Grid</option><option value="wide">Wide 4-Cut</option>
      </select></label>
      {['Pastel', 'Classic', 'Monochrome', 'Special'].map(category => <div className="swatch-group" key={category}><span className="label-small">{category}</span><div className="swatches">
        {FRAMES.filter(f => f.category === category).map(f => <button key={f.id} title={f.name} aria-label={`${category}: ${f.name}`} aria-pressed={style.frame === f.id} className={`swatch ${style.frame === f.id ? 'selected' : ''}`} onClick={() => update('frame', f.id)}><span style={{ background: f.colors.length > 1 ? `linear-gradient(145deg, ${f.colors.join(',')})` : f.colors[0], color: f.ink }}>{style.frame === f.id && <Check size={16} />}</span></button>)}
      </div></div>)}
      <p className="hint">{FRAMES.find(f => f.id === style.frame)?.name}</p>
    </div></details>
    <details><summary><span>Filter & adjust</span><span>02</span></summary><div className="detail-content"><FilterSelector value={filter} onChange={onFilter} sample={sample} /><AdjustPanel value={adjust} onChange={onAdjust} /></div></details>
    <details><summary><span>Stickers & stamps</span><span>03</span></summary><div className="detail-content">
      <div className="sticker-list">{[['', 'No Sticker'], ['♡', 'Heart'], ['★', 'Star'], ['✦', 'Sparkle'], ['🎀', 'Ribbon'], ['🌸', 'Blossom']].map(([sticker, label]) => <button key={label} className={style.sticker === sticker ? 'selected' : ''} aria-label={label} aria-pressed={style.sticker === sticker} title={label} onClick={() => update('sticker', sticker)}>{sticker || 'None'}</button>)}</div>
      <Toggle label="Location" checked={style.showLocation} onChange={v => update('showLocation', v)} />
      {style.showLocation && <label className="field">Location label<input maxLength={48} value={style.location} onChange={e => update('location', e.target.value)} /><small>Custom label, not detected GPS location.</small></label>}
      <Toggle label="Date" checked={style.showDate} onChange={v => update('showDate', v)} />
      <Toggle label="Time" checked={style.showTime} onChange={v => update('showTime', v)} />
      <Toggle label="Brand stamp" checked={style.showBrand} onChange={v => update('showBrand', v)} />
    </div></details>
    <details><summary><span>Your words</span><span>04</span></summary><div className="detail-content">
      <label className="field">Strip header<input maxLength={24} value={style.header} onChange={e => update('header', e.target.value)} /></label>
      <label className="field">A little message<textarea rows={2} maxLength={60} placeholder="A day to remember." value={style.text} onChange={e => update('text', e.target.value)} /><small>{style.text.length} / 60 characters</small></label>
    </div></details>
  </div>;
}
