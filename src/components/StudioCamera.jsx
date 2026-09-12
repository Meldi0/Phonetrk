import React, { useState } from 'react';
import { Camera, FlipHorizontal, RefreshCw, Settings2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { AdjustPanel, FilterSelector, Toggle } from './Controls.jsx';
import { CAPTURE_PACES, FILTERS } from '../lib/presets.js';

export default function StudioCamera({
  camera,
  capture,
  filter,
  onFilter,
  adjust,
  onAdjust,
  filterId,
  retake,
  onCancelRetake,
  onStart,
  paused,
  onResume,
  mirrorResult,
  onMirrorResult,
  mirrorAll,
  onMirrorAll,
  onPoseCountChange,
}) {
  const [settings, setSettings] = useState(false);
  const [grid, setGrid] = useState(false);

  const activeFilterObj = FILTERS.find(f => f.id === filter) || FILTERS[0];

  return (
    <section className="camera-card" aria-label="Camera studio">
      <div className="camera-heading">
        <div>
          <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className={`live-dot ${camera.status === 'ready' ? 'on' : ''}`} />
          <span className="eyebrow">SnapBooth Camera</span>
          <span className="camera-filter-name">{activeFilterObj.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="icon-button"
            aria-label="Camera settings"
            aria-expanded={settings}
            onClick={() => setSettings(!settings)}
            disabled={capture.busy}
            title="Settings"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      <div className="viewfinder">
        <video
          ref={camera.videoRef}
          autoPlay
          muted
          playsInline
          aria-label="Live camera preview"
          style={{
            filter: `url(#${filterId})`,
            transform: camera.mirror ? 'scaleX(-1)' : undefined,
          }}
        />

        {camera.status === 'ready' && (
          <>
            <div className="viewfinder-corners" aria-hidden="true" />
            {grid && <div className="camera-grid" aria-hidden="true" />}
            <span className="camera-caption">
              {camera.mirror ? 'Preview mirrored' : 'Preview normal'} • Result:{' '}
              {mirrorResult ? 'Mirrored (ON)' : 'Normal (OFF)'}
            </span>
          </>
        )}

        {camera.status !== 'ready' && (
          <div className="camera-state" role="status">
            <div className={`camera-state-icon ${camera.status === 'loading' ? 'starting' : ''}`}>
              <Camera size={28} />
            </div>
            <h2>
              {camera.status === 'loading'
                ? 'Starting camera…'
                : camera.status === 'error'
                ? 'Let’s reconnect your camera'
                : 'Your moment starts here'}
            </h2>
            <p>
              {camera.error ||
                (camera.status === 'loading'
                  ? 'Allow camera access when your browser asks.'
                  : 'Start your camera, find your light, and make it yours.')}
            </p>
            {camera.status !== 'loading' && (
              <button className="button camera-start" onClick={paused ? onResume : camera.retry}>
                {camera.status === 'error' ? 'Try Again' : 'Open camera'}
              </button>
            )}
          </div>
        )}

        {/* Small capture preview after each shot */}
        {capture.lastPhoto && (
          <img
            className="last-capture"
            src={capture.lastPhoto}
            alt="Just captured"
            style={{
              filter: `url(#${filterId})`,
              transform: mirrorResult ? 'scaleX(-1)' : undefined,
            }}
          />
        )}

        {/* Relaxed Inter-Pose "GET READY / NEXT POSE" Overlay */}
        {capture.getReady && (
          <div className="get-ready-overlay" role="status" aria-live="polite">
            <div className="get-ready-badge">
              <Sparkles size={16} />
              <span>GET READY</span>
            </div>
            <h2>NEXT POSE</h2>
            <div className="get-ready-counter">
              POSE {capture.nextPose} / {capture.total}
            </div>
            <p>Change your pose now!</p>
          </div>
        )}

        {/* Current Pose Indicator */}
        {capture.busy && !capture.getReady && (
          <span className="pose-label">
            POSE {capture.pose} / {capture.total}
          </span>
        )}

        {/* 3 -> 2 -> 1 Countdown */}
        {capture.countdown && (
          <div className="countdown" role="status" aria-live="assertive">
            <span key={capture.countdown}>{capture.countdown}</span>
          </div>
        )}

        {/* Shutter Flash */}
        {capture.flash && <div className="capture-flash" aria-hidden="true" />}
      </div>

      <div className="camera-subline">
        <span>
          <ShieldCheck size={14} />
          Photos stay on your device
        </span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="text-button"
            disabled={capture.busy || camera.status !== 'ready'}
            onClick={() => camera.setMirror(!camera.mirror)}
            title="Toggle camera preview mirror"
          >
            <FlipHorizontal size={14} />
            Flip Preview
          </button>
          <button
            className="text-button"
            disabled={capture.busy || camera.status !== 'ready' || camera.devices.length < 2}
            onClick={camera.switchCamera}
            title={camera.devices.length < 2 ? 'Only one camera available' : 'Switch camera'}
          >
            <RefreshCw size={14} />
            Switch camera
          </button>
        </div>
      </div>

      {settings && (
        <div className="camera-settings">
          <div className="settings-section-title">Mirror & Orientation</div>
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
          <Toggle
            label="Preview Mirror (Flip viewfinder preview)"
            checked={camera.mirror}
            onChange={camera.setMirror}
          />
          <Toggle label="Composition grid" checked={grid} onChange={setGrid} />

          <div className="settings-section-title" style={{ marginTop: '12px' }}>
            Capture Pace
          </div>
          <div className="pace-selector" role="radiogroup" aria-label="Capture Pace">
            {CAPTURE_PACES.map(p => (
              <button
                key={p.id}
                type="button"
                className={`pace-button ${capture.pace === p.id ? 'selected' : ''}`}
                onClick={() => capture.setPace(p.id)}
                disabled={capture.busy}
              >
                <strong>{p.name}</strong>
                <small>{p.label}</small>
              </button>
            ))}
          </div>

          <div className="settings-section-title" style={{ marginTop: '12px' }}>
            Light & Tone
          </div>
          <AdjustPanel value={adjust} onChange={onAdjust} />
        </div>
      )}

      {/* Grid / Pose Count Selector (1, 2, 4, 6) */}
      <div className="pose-count-bar">
        <span>Session Layout:</span>
        <div className="pose-count-group" role="radiogroup" aria-label="Pose Count">
          {[1, 2, 4, 6].map(count => (
            <button
              key={count}
              type="button"
              className={`pose-count-pill ${capture.poseCount === count ? 'active' : ''}`}
              disabled={capture.busy}
              onClick={() => {
                capture.setPoseCount(count);
                if (onPoseCountChange) onPoseCountChange(count);
              }}
            >
              {count} {count === 1 ? 'Foto' : 'Cut'}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-heading">
        <span>Contact sheet / choose a filter</span>
        <span>{FILTERS.length} studio presets</span>
      </div>
      <FilterSelector value={filter} onChange={onFilter} disabled={capture.busy} sample={capture.photos[0]} />

      <div className="shutter-area">
        {capture.busy ? (
          <button className="button shutter" onClick={capture.cancel}>
            <X size={18} />
            Cancel session
          </button>
        ) : (
          <button
            className="button shutter"
            disabled={camera.status !== 'ready'}
            onClick={() => onStart(retake !== null ? 'retake' : 'auto')}
          >
            <Camera size={19} />
            {retake !== null ? `Retake Pose ${retake + 1}` : `Start ${capture.poseCount}-Cut Session`}
          </button>
        )}
        <div className="shutter-secondary">
          <span>
            {retake !== null
              ? 'Replace just this pose'
              : `${capture.poseCount} poses • ${capture.pace === 'relaxed' ? 'Relaxed' : capture.pace === 'fast' ? 'Fast' : 'Normal'} pace`}
          </span>
          {retake !== null ? (
            <button className="text-button" disabled={capture.busy} onClick={onCancelRetake}>
              Cancel retake
            </button>
          ) : (
            <button
              className="text-button"
              disabled={camera.status !== 'ready' || capture.busy}
              onClick={() => onStart('single')}
            >
              Take single shot ↗
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
