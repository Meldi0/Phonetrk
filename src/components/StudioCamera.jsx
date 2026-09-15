import React, { useState } from 'react';
import { Camera, Check, FlipHorizontal, RefreshCw, RotateCcw, Settings2, ShieldCheck, Sliders, Sparkles, Sun, Timer, Video, X } from 'lucide-react';
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
  liveEnabled = false,
  onToggleLive,
}) {
  const [settings, setSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('tone');
  const [grid, setGrid] = useState(false);

  const activeFilterObj = FILTERS.find(f => f.id === filter) || FILTERS[0];

  return (
    <section className="camera-card" aria-label="Camera studio">
      <div className="camera-heading">
        <div>
          <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className={`live-dot ${camera.status === 'ready' ? 'on' : ''}`} />
          <span className="eyebrow">CissPic Camera</span>
          <span className="camera-filter-name">{activeFilterObj.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onToggleLive && (
            <button
              type="button"
              className={`live-pill-toggle ${liveEnabled ? 'active' : ''}`}
              onClick={onToggleLive}
              disabled={capture.busy}
              title={liveEnabled ? 'Live Photo: Aktif (2s klip gerak)' : 'Aktifkan Live Photo'}
            >
              <span className={`live-status-dot ${liveEnabled ? 'pulsing' : ''}`} />
              LIVE
            </button>
          )}
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

      {settings ? (
        /* In-flow Adjustment Console: Positioned directly BELOW the viewfinder so the user can see their live camera in real-time while tweaking brightness, contrast, warmth, mirror! */
        <div className="camera-adjust-console" aria-label="Pengaturan Kamera & Tone">
          <div className="adjust-console-header">
            <div className="adjust-console-title">
              <Sliders size={15} />
              <span>Pengaturan Kamera & Tone</span>
            </div>
            <button
              type="button"
              className="adjust-close-btn"
              onClick={() => setSettings(false)}
              aria-label="Tutup Pengaturan"
              title="Tutup Pengaturan"
            >
              <X size={15} />
            </button>
          </div>

          <div className="adjust-console-hint">
            <Sparkles size={12} />
            <span>Perubahan tone & filter langsung terlihat pada kamera di atas</span>
          </div>

          <div className="adjust-console-nav" role="tablist" aria-label="Kategori Pengaturan">
            <button
              type="button"
              className={`adjust-nav-pill ${settingsTab === 'tone' ? 'active' : ''}`}
              onClick={() => setSettingsTab('tone')}
              role="tab"
              aria-selected={settingsTab === 'tone'}
            >
              <Sun size={13} />
              <span>Cahaya & Tone</span>
            </button>
            <button
              type="button"
              className={`adjust-nav-pill ${settingsTab === 'mirror' ? 'active' : ''}`}
              onClick={() => setSettingsTab('mirror')}
              role="tab"
              aria-selected={settingsTab === 'mirror'}
            >
              <FlipHorizontal size={13} />
              <span>Mirror & Grid</span>
            </button>
            <button
              type="button"
              className={`adjust-nav-pill ${settingsTab === 'pace' ? 'active' : ''}`}
              onClick={() => setSettingsTab('pace')}
              role="tab"
              aria-selected={settingsTab === 'pace'}
            >
              <Timer size={13} />
              <span>Timer / Jeda</span>
            </button>
          </div>

          <div className="adjust-console-body">
            {settingsTab === 'tone' && (
              <div className="adjust-tab-content">
                <AdjustPanel value={adjust} onChange={onAdjust} />
              </div>
            )}

            {settingsTab === 'mirror' && (
              <div className="adjust-tab-content">
                <Toggle
                  label="Mirror Result (Hasil foto & strip di-mirror)"
                  checked={mirrorResult}
                  onChange={onMirrorResult}
                />
                <Toggle
                  label="Mirror All Photos (Terapkan orientasi ke semua pose)"
                  checked={mirrorAll}
                  onChange={onMirrorAll}
                />
                <Toggle
                  label="Preview Mirror (Flip tampilan viewfinder)"
                  checked={camera.mirror}
                  onChange={camera.setMirror}
                />
                <Toggle label="Composition grid (Garis bantu komposisi)" checked={grid} onChange={setGrid} />
              </div>
            )}

            {settingsTab === 'pace' && (
              <div className="adjust-tab-content">
                {onToggleLive && (
                  <Toggle
                    label="Live Photo (Ambil klip gerak 2 detik saat memotret)"
                    checked={liveEnabled}
                    onChange={onToggleLive}
                  />
                )}
                <div className="settings-section-title" style={{ marginTop: '8px' }}>
                  Capture Pace (Jeda Waktu Antar Pose)
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
              </div>
            )}
          </div>

          <div className="adjust-console-footer">
            <button
              type="button"
              className="button primary adjust-done-btn"
              onClick={() => setSettings(false)}
            >
              <Check size={16} />
              <span>Selesai Mengatur (Siap Jepret)</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Primary Action / Shutter Console (Directly below viewfinder & subline) */}
          <div className="shutter-area">
            {capture.busy ? (
              <button className="button shutter shutter-cancel" onClick={capture.cancel} aria-label="Cancel session">
                <X size={18} />
                Cancel session / Batal sesi
              </button>
            ) : retake !== null ? (
              <button
                className={`button shutter ${liveEnabled ? 'has-live-active' : ''}`}
                disabled={camera.status !== 'ready'}
                aria-label={`Jepret Ulang Foto ${retake + 1}`}
                onClick={() => onStart('manual', retake)}
              >
                <Camera size={19} />
                Jepret Ulang Foto {retake + 1} (Timer 3s) {liveEnabled ? '• Live On' : ''}
              </button>
            ) : capture.photos.length >= capture.poseCount ? (
              <button
                className="button shutter button-finish-session"
                disabled={camera.status !== 'ready'}
                aria-label="Selesai dan Masuk ke Editor"
                onClick={() => capture.finishManualSession()}
              >
                <Check size={19} />
                Selesai & Masuk Editor ➔
              </button>
            ) : (
              <button
                className={`button shutter ${liveEnabled ? 'has-live-active' : ''}`}
                disabled={camera.status !== 'ready'}
                aria-label={`Jepret Foto ${capture.photos.length + 1} dari ${capture.poseCount}`}
                onClick={() => onStart('manual')}
              >
                <Camera size={19} />
                Jepret Foto {capture.photos.length + 1} / {capture.poseCount} (Timer 3s) {liveEnabled ? '• Live On' : ''}
              </button>
            )}

            <div className="shutter-secondary">
              {retake !== null ? (
                <span>Mengganti Foto {retake + 1} saja • Timer 3 detik</span>
              ) : capture.photos.length >= capture.poseCount ? (
                <span>Semua foto terisi! Klik tombol di atas untuk masuk ke editor, atau klik slot untuk retake.</span>
              ) : capture.photos.length > 0 ? (
                <span>Foto {capture.photos.length + 1} dari {capture.poseCount} • Siap jepret (timer 3 detik)</span>
              ) : (
                <span>Klik tombol jepret di atas (timer 3 detik)</span>
              )}

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {retake !== null ? (
                  <button className="text-button" disabled={capture.busy} onClick={onCancelRetake}>
                    Batal retake
                  </button>
                ) : capture.photos.length > 0 && capture.photos.length < capture.poseCount ? (
                  <button
                    className="text-button"
                    disabled={capture.busy}
                    onClick={() => capture.finishManualSession()}
                  >
                    Ke Editor ({capture.photos.length} foto) ➔
                  </button>
                ) : null}
                {capture.photos.length > 0 && (
                  <button
                    type="button"
                    className="text-button reset-btn"
                    disabled={capture.busy}
                    onClick={capture.resetSession}
                    title="Hapus foto dan ulang sesi dari foto 1"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Compact Session Dock: Layout Sesi + Progress Slots */}
          <div className="camera-session-dock">
            <div className="pose-count-bar">
              <span className="pose-count-label">Layout Sesi:</span>
              <div className="pose-count-group" role="radiogroup" aria-label="Mode Jepret">
                {[
                  { count: 1, label: '1 Jepretan', badge: 'Solo' },
                  { count: 2, label: '2 Pose', badge: 'Duo' },
                  { count: 3, label: '3 Grid', badge: 'Trio' },
                  { count: 4, label: '4 Strip', badge: 'Klasik' },
                  { count: 6, label: '6 Grid', badge: 'Story' },
                ].map(({ count, label, badge }) => (
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
                    <span className="pill-title">{label}</span>
                    <span className="pill-badge">{badge}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="manual-session-tray">
              <div className="manual-session-header">
                <span>
                  Progres Slot: <strong>{Math.min(capture.photos.length, capture.poseCount)} / {capture.poseCount}</strong>
                  {capture.photos.length >= capture.poseCount && ' • Siap Cetak'}
                </span>
              </div>
              <div className={`manual-slot-grid count-${capture.poseCount}`}>
                {Array.from({ length: capture.poseCount }, (_, i) => {
                  const photo = capture.photos[i];
                  const isFilled = !!photo;
                  const isCurrent = i === capture.photos.length && retake === null;
                  const isTargetRetake = retake === i;

                  return (
                    <div
                      key={i}
                      className={`manual-slot-item ${isFilled ? 'filled' : ''} ${isCurrent ? 'current' : ''} ${isTargetRetake ? 'retaking' : ''}`}
                      onClick={() => {
                        if (isFilled && !capture.busy) {
                          onStart('manual', i);
                        }
                      }}
                      title={isFilled ? `Klik untuk jepret ulang Foto ${i + 1}` : `Slot Foto ${i + 1}`}
                    >
                      {isFilled ? (
                        <>
                          <img src={photo} alt={`Foto ${i + 1}`} className="slot-thumb-img" />
                          <div className="slot-retake-overlay">
                            <RotateCcw size={11} />
                            <span>Ganti</span>
                          </div>
                          <span className="slot-check-badge">✓</span>
                        </>
                      ) : (
                        <div className="slot-empty-content">
                          <span className="slot-num">{i + 1}</span>
                          {isCurrent && <span className="slot-next-indicator">NEXT</span>}
                        </div>
                      )}
                      <span className="slot-card-label">P{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="filter-heading">
            <span>Filter Studio ({activeFilterObj.name})</span>
            <span>{FILTERS.length} presets</span>
          </div>
          <FilterSelector value={filter} onChange={onFilter} disabled={capture.busy} sample={capture.photos[0]} />
        </>
      )}
    </section>
  );
}
