import React, { useEffect, useId, useRef, useState } from 'react';
import { Camera, Check, Download, Image as ImageIcon, Moon, Printer, RotateCcw, Share2, SlidersHorizontal, Sun, User, X } from 'lucide-react';
import StudioCamera from './components/StudioCamera.jsx';
import { Customizer, FilterDefinitions } from './components/Controls.jsx';
import Gallery from './components/Gallery.jsx';
import Modal from './components/Modal.jsx';
import { useCamera } from './hooks/useCamera.js';
import { useCapture } from './hooks/useCapture.js';
import { useStrip } from './hooks/useStrip.js';
import { DEFAULT_ADJUST, DEFAULT_STYLE, FILTERS, filename } from './lib/presets.js';
import { canvasBlob, downloadBlob, shareBlob } from './lib/photos.js';
import { deleteGalleryItem, readGallery, saveGalleryItem } from './lib/gallery.js';
import './snapbooth.css';

export default function App() {
  const [tab, setTab] = useState('studio');
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('snapbooth-theme') === 'dark'; } catch { return false; } });
  const [activeFilter, setActiveFilter] = useState('natural');
  const [adjust, setAdjust] = useState({ ...DEFAULT_ADJUST });
  const [style, setStyle] = useState({ ...DEFAULT_STYLE });
  const [paused, setPaused] = useState(false);
  const [retake, setRetake] = useState(null);
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null);
  const [gallery, setGallery] = useState([]), [galleryLoading, setGalleryLoading] = useState(true);
  const [saving, setSaving] = useState(false), [copies, setCopies] = useState(1), [paper, setPaper] = useState('Glossy');
  const savedKey = useRef(''), savingRef = useRef(false);
  const filterId = `snap-filter-${useId().replaceAll(':', '')}`;
  const camera = useCamera(tab === 'studio' && !paused);
  const capture = useCapture(camera.videoRef, () => { setTab('customize'); setRetake(null); }, setNotice);
  const strip = useStrip(capture.photos, activeFilter, adjust, style, capture.timestamp);
  const currentFilter = FILTERS.find(f => f.id === activeFilter);

  useEffect(() => {
    let active = true;
    readGallery().then(items => { if (active) setGallery(items.filter(item => item.blob instanceof Blob).sort((a, b) => b.savedAt.localeCompare(a.savedAt))); })
      .catch(() => { if (active) setNotice('Local gallery storage is unavailable. You can still download your photos.'); })
      .finally(() => { if (active) setGalleryLoading(false); });
    return () => { active = false; };
  }, []);
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

  function navigate(next) {
    capture.cancel(); setRetake(null); setTab(next);
    if (next === 'studio') setPaused(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function start(mode) {
    if (capture.photos.length && retake === null) { setModal({ type: 'new', mode }); return; }
    capture.start(mode, retake);
  }
  function beginRetake(index) { capture.cancel(); setRetake(index); setPaused(false); setTab('studio'); window.scrollTo({ top: 0, behavior: 'instant' }); }
  async function persist() {
    if (!strip.ready || savedKey.current === strip.result.key) return;
    const item = {
      id: crypto.randomUUID(), blob: strip.result.blob, timestamp: capture.timestamp,
      savedAt: new Date().toISOString(), filename: filename(capture.timestamp), filter: currentFilter.name, photoCount: capture.photos.length,
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
  const poseTiles = <div className="pose-tiles">{Array.from({ length: 4 }, (_, i) => <div className="pose-tile" key={i}>
    {capture.photos[i] ? <><img src={capture.photos[i]} alt={`Your pose ${i + 1}`} style={{ filter: `url(#${filterId})` }} /><button aria-label={`Retake Pose ${i + 1}`} title={`Retake Pose ${i + 1}`} disabled={capture.busy} onClick={() => beginRetake(i)}><RotateCcw size={14} /></button><span>{String(i + 1).padStart(2, '0')}</span></> : <span className="empty-pose">{String(i + 1).padStart(2, '0')}</span>}
  </div>)}</div>;
  const preview = <div className={`strip-stage ${style.layout !== 'vertical' ? 'landscape' : ''}`} aria-busy={capture.photos.length > 0 && !strip.ready}>
    {strip.result ? <img className="strip-image" src={strip.result.url} alt="Your finished SnapBooth photostrip" /> : <div className="empty-strip"><strong>★ SNAPBOOTH ★</strong><small>K-STYLE SELF PHOTO STUDIO</small>{[1, 2, 3, 4].map(n => <div key={n}><span>{String(n).padStart(2, '0')}</span></div>)}<p>A little moment.<br />A forever keepsake.</p><small>MADE BY YOU</small></div>}
    {capture.photos.length > 0 && !strip.ready && !strip.error && <span className="render-label" role="status">Developing your strip…</span>}
    {strip.error && <p className="inline-error" role="alert">{strip.error}</p>}
  </div>;
  const actions = <div className="result-actions">
    <button className="button primary" disabled={!strip.ready || saving || capture.busy} onClick={() => save(true)}><Download size={17} />{saving ? 'Saving…' : 'Simpan Strip Foto'}</button>
    <div className="secondary-actions"><button className="button secondary" disabled={!strip.ready || capture.busy} onClick={() => share()}><Share2 size={16} />Share</button><button className="button secondary" disabled={!strip.ready || capture.busy} onClick={() => setModal({ type: 'print' })}><Printer size={16} />Pesan Cetak</button></div>
    <details className="more-downloads"><summary>More ways to keep it</summary><div><button className="text-button" disabled={!strip.ready || saving} onClick={() => save(false)}><Check size={14} />Save to Gallery</button>{strip.ready && strip.result.processed.map((photo, i) => <button key={i} className="text-button" onClick={async () => { try { downloadBlob(await canvasBlob(photo), filename(capture.timestamp).replace('.png', `-Pose-${i + 1}.png`)); } catch (err) { setNotice(err.message); } }}><Download size={14} />Download Pose {i + 1}</button>)}</div></details>
    <p className="export-note">{strip.ready ? `${strip.result.width} × ${strip.result.height} px · PNG` : 'High-resolution PNG · Made on your device'}</p>
  </div>;

  return <div className={`snapbooth ${dark ? 'dark' : ''}`}>
    <FilterDefinitions filter={activeFilter} adjust={adjust} id={filterId} />
    <a className="skip-link" href="#main">Skip to studio</a>
    <header className="site-header"><div className="header-inner">
      <button className="brand" onClick={() => navigate('studio')} aria-label="SnapBooth studio"><span className="brand-mark"><Camera size={21} /></span><span><strong>SnapBooth<span className="brand-dot">®</span></strong><small>K-STYLE SELF PHOTO STUDIO</small></span></button>
      <nav className="desktop-nav" aria-label="Main navigation">{[['studio', 'Studio'], ['customize', 'Edit'], ['gallery', 'Gallery']].map(([id, label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => navigate(id)}>{label}</button>)}</nav>
      <div className="header-actions"><button className="icon-button" aria-label={dark ? 'Use light theme' : 'Use dark theme'} onClick={() => setDark(!dark)}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button><button className="account-button" aria-label="My space" onClick={() => setModal({ type: 'account' })}><User size={18} /><span>My space</span></button></div>
    </div></header>
    <main id="main" className="main-content">
      {tab !== 'gallery' && <section className="hero"><p className="eyebrow">✦ K-STYLE SELF PHOTO STUDIO</p><h1>{tab === 'customize' ? 'Make the moment yours.' : 'Aesthetic 4-Cut Photo Studio'}</h1><p>{tab === 'customize' ? 'Your poses. Your colors. Your little keepsake.' : 'Take your own K-style photostrip directly from your browser.'}</p><div className="steps"><span className={tab === 'studio' ? 'current' : 'complete'}>01 <span>Strike a pose</span></span><i /><span className={tab === 'customize' ? 'current' : ''}>02 <span>Make it yours</span></span><i /><span>03 <span>Keep the moment</span></span></div></section>}
      {notice && <div className="notice" role="status"><span>{notice}</span><button className="icon-button" aria-label="Dismiss message" onClick={() => setNotice('')}><X size={16} /></button></div>}
      {tab === 'studio' && <div className="studio-layout"><StudioCamera camera={camera} capture={capture} filter={activeFilter} onFilter={setActiveFilter} adjust={adjust} onAdjust={setAdjust} filterId={filterId} retake={retake} onCancelRetake={() => setRetake(null)} onStart={start} paused={paused} onResume={() => setPaused(false)} />
        <section className="result-card"><div className="section-heading"><div><p className="eyebrow">Made by you</p><h2>Your Photo Strip</h2></div><span className="count-label">{capture.photos.length} / 4</span></div>
          {poseTiles}{preview}<p className="studio-result-hint">{capture.photos.length ? 'A pose worth another take? Tap its retake icon.' : 'Four poses, one little story. Your photos will appear here.'}</p>
          <button className="button secondary" disabled={!capture.photos.length || capture.busy} onClick={() => navigate('customize')}><SlidersHorizontal size={16} />Customize your strip</button>{actions}
        </section>
      </div>}
      {tab === 'customize' && (capture.photos.length ? <div className="edit-layout"><section className="result-card edit-preview"><div className="section-heading"><div><p className="eyebrow">Your photos</p><h2>A keepsake in the making.</h2></div><button className="text-button" onClick={() => navigate('studio')}>Back to studio</button></div>{poseTiles}{preview}<p className="export-note">Preview and download use the same finished image.</p></section><section className="result-card edit-controls"><div className="section-heading"><div><p className="eyebrow">The finishing touches</p><h2>Make it yours</h2></div><SlidersHorizontal size={20} /></div><Customizer style={style} onChange={setStyle} filter={activeFilter} onFilter={setActiveFilter} adjust={adjust} onAdjust={setAdjust} sample={capture.photos[0]} />{actions}</section></div> : <section className="gallery-empty"><Camera size={40} strokeWidth={1} /><h2>First, a little camera time.</h2><p>Take a photo to start customizing your strip.</p><button className="button primary" onClick={() => navigate('studio')}>Open the studio</button></section>)}
      {tab === 'gallery' && <Gallery items={gallery} loading={galleryLoading} onStudio={() => navigate('studio')} onShare={share} onDelete={item => setModal({ type: 'delete', item })} />}
    </main>
    <footer className="site-footer"><span>SnapBooth <span className="footer-star">✦</span> Made for your moments.</span><span>K-style studio · {new Date().getFullYear()}</span></footer>
    <nav className="bottom-nav" aria-label="Mobile navigation">{[['studio', 'Studio', Camera], ['customize', 'Edit', SlidersHorizontal], ['gallery', 'Gallery', ImageIcon]].map(([id, label, Icon]) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={20} /><span>{label}</span></button>)}</nav>
    {modal && <Modal title={{ new: 'Start a new session?', delete: 'Delete this photostrip?', print: 'Print Order', account: 'Your own little space' }[modal.type]} onClose={() => { if (!saving) setModal(null); }}>
      {modal.type === 'new' && <><p>This will replace the photos in your current editor. Download or save your strip first if you want to keep it.</p><div className="modal-actions"><button className="button secondary" onClick={() => setModal(null)}>Keep editing</button><button className="button primary" onClick={() => { const mode = modal.mode; setModal(null); capture.start(mode); }}>Start new session</button></div></>}
      {modal.type === 'delete' && <><p>This removes the saved strip from this browser. Downloaded files stay on your device.</p><div className="modal-actions"><button className="button secondary" disabled={saving} onClick={() => setModal(null)}>Keep it</button><button className="button danger" disabled={saving} onClick={() => remove(modal.item)}>{saving ? 'Deleting…' : 'Delete photostrip'}</button></div></>}
      {modal.type === 'account' && <><p>No account needed. Your gallery is stored in this browser. Nothing is uploaded or synced to a server.</p><p>Clearing browser data removes saved strips. Download your favorites to keep a separate copy.</p><button className="button primary" onClick={() => { setModal(null); navigate('gallery'); }}>Open my gallery</button></>}
      {modal.type === 'print' && <><div className="print-preview"><img src={strip.result?.url} alt="Photostrip print preview" /></div><p><strong>Frontend print planner.</strong> Online ordering and delivery are not connected. No order or payment will be submitted.</p><div className="print-options"><label className="field">Copies<select aria-label="Copies" value={copies} onChange={e => setCopies(Number(e.target.value))}>{[1, 2, 3].map(n => <option key={n} value={n}>{n} {n === 1 ? 'copy' : 'copies'}</option>)}</select></label><label className="field">Paper preference<select aria-label="Paper preference" value={paper} onChange={e => setPaper(e.target.value)}><option>Glossy</option><option>Matte</option></select></label></div><p className="hint">Choose matching {paper.toLowerCase()} paper and print settings on your printer. For a classic strip, use 50 × 150 mm paper; fit to page.</p><button className="button primary" onClick={() => window.print()}><Printer size={16} />Open print dialog</button></>}
    </Modal>}
    {modal?.type === 'print' && <div className="print-sheet">{Array.from({ length: copies }, (_, i) => <img src={strip.result?.url} key={i} alt={`Print copy ${i + 1}`} />)}</div>}
  </div>;
}

