import React, { useState } from 'react';
import { Camera, RefreshCw, Settings2, ShieldCheck, X } from 'lucide-react';
import { AdjustPanel, FilterSelector, Toggle } from './Controls.jsx';
import { FILTERS } from '../lib/presets.js';

export default function StudioCamera({ camera, capture, filter, onFilter, adjust, onAdjust, filterId, retake, onCancelRetake, onStart, paused, onResume }) {
  const [settings, setSettings] = useState(false), [grid, setGrid] = useState(false);
  return <section className="camera-card" aria-label="Camera studio">
    <div className="camera-heading"><div><span className={`live-dot ${camera.status === 'ready' ? 'on' : ''}`} /><span className="eyebrow">Live studio</span><span className="camera-filter-name">{FILTERS.find(f => f.id === filter)?.name}</span></div>
      <button className="icon-button" aria-label="Camera settings" aria-expanded={settings} onClick={() => setSettings(!settings)} disabled={capture.busy}><Settings2 size={18} /></button>
    </div>
    <div className="viewfinder">
      <video ref={camera.videoRef} autoPlay muted playsInline aria-label="Live camera preview" style={{ filter: `url(#${filterId})`, transform: camera.mirror ? 'scaleX(-1)' : undefined }} />
      {camera.status === 'ready' && <><div className="viewfinder-corners" aria-hidden="true" />{grid && <div className="camera-grid" aria-hidden="true" />}<span className="camera-caption">{camera.mirror ? 'Mirrored preview · original photo saved' : 'Original orientation'}</span></>}
      {camera.status !== 'ready' && <div className="camera-state" role="status"><div className={`camera-state-icon ${camera.status === 'loading' ? 'starting' : ''}`}><Camera size={28} /></div>
        <h2>{camera.status === 'loading' ? 'Starting camera…' : camera.status === 'error' ? 'Let’s reconnect your camera' : 'Your moment starts here'}</h2>
        <p>{camera.error || (camera.status === 'loading' ? 'Allow camera access when your browser asks.' : 'Start your camera, find your light, and make it yours.')}</p>
        {camera.status !== 'loading' && <button className="button camera-start" onClick={paused ? onResume : camera.retry}>{camera.status === 'error' ? 'Try Again' : 'Open camera'}</button>}
      </div>}
      {capture.lastPhoto && <img className="last-capture" src={capture.lastPhoto} alt="Just captured" style={{ filter: `url(#${filterId})` }} />}
      {capture.busy && <span className="pose-label">POSE {capture.pose} / {capture.total}</span>}
      {capture.countdown && <div className="countdown" role="status" aria-live="assertive"><span key={capture.countdown}>{capture.countdown}</span></div>}
      {capture.flash && <div className="capture-flash" aria-hidden="true" />}
    </div>
    <div className="camera-subline"><span><ShieldCheck size={14} />Photos stay on your device</span><button className="text-button" disabled={capture.busy || camera.status !== 'ready' || camera.devices.length < 2} onClick={camera.switchCamera} title={camera.devices.length < 2 ? 'Only one camera available' : 'Switch camera'}><RefreshCw size={15} />Switch camera</button></div>
    {settings && <div className="camera-settings"><Toggle label="Composition grid" checked={grid} onChange={setGrid} /><AdjustPanel value={adjust} onChange={onAdjust} /></div>}
    <div className="filter-heading"><span>Find your tone</span><span>8 studio presets</span></div>
    <FilterSelector value={filter} onChange={onFilter} disabled={capture.busy} sample={capture.photos[0]} />
    <div className="shutter-area">
      {capture.busy ? <button className="button shutter" onClick={capture.cancel}><X size={18} />Cancel session</button> : <button className="button shutter" disabled={camera.status !== 'ready'} onClick={() => onStart(retake !== null ? 'retake' : 'auto')}><Camera size={19} />{retake !== null ? `Retake Pose ${retake + 1}` : 'Start 4-Cut Session'}</button>}
      <div className="shutter-secondary"><span>{retake !== null ? 'Replace just this pose' : '3-count timer · 4 automatic poses'}</span>{retake !== null ? <button className="text-button" disabled={capture.busy} onClick={onCancelRetake}>Cancel retake</button> : <button className="text-button" disabled={camera.status !== 'ready' || capture.busy} onClick={() => onStart('single')}>Take single shot ↗</button>}</div>
    </div>
  </section>;
}
