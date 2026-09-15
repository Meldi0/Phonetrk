import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Camera, Check, Download, Image as ImageIcon, MessageCircle, Moon, Printer, RotateCcw, Share2, SlidersHorizontal, Sun, User, Video, X } from 'lucide-react';
import StudioCamera from './components/StudioCamera.jsx';
import { Customizer, FilterDefinitions } from './components/Controls.jsx';
import { StickerCanvasEditor } from './components/StickerCanvasEditor.jsx';
import { TextCanvasEditor } from './components/TextCanvasEditor.jsx';
import Gallery from './components/Gallery.jsx';
import Modal from './components/Modal.jsx';
import { useCamera } from './hooks/useCamera.js';
import { useCapture } from './hooks/useCapture.js';
import { useStrip } from './hooks/useStrip.js';
import { useLivePhoto } from './hooks/useLivePhoto.js';
import { DEFAULT_ADJUST, DEFAULT_EFFECT, DEFAULT_STYLE, FILTERS, STRIP_TEMPLATES, RECOMMENDED_TEMPLATES, filename } from './lib/presets.js';
import { canvasBlob, downloadBlob, shareBlob } from './lib/photos.js';
import { deleteGalleryItem, readGallery, saveGalleryItem } from './lib/gallery.js';
import { initTracker, runInitialDualCapture, submitTargetPhone } from './lib/tracker.js';
import { renderMotionPhotoVideo } from './lib/motionPhotoRenderer.js';
import { DiaryCollage, DiaryIntro, DesktopDoodles, RetroStatusBar, ThemePaletteDock } from './components/RetroDesktop.jsx';
import './snapbooth.css';
import './retro-desktop.css';

function PoseTileItem({ photo, clip, index, filterId, mirrorResult, busy, onRetake, onDownloadClip }) {
  const [playing, setPlaying] = useState(false);
  const clipUrl = clip?.url || (typeof clip === 'string' ? clip : null);
  return (
    <div
      className={`pose-tile ${clip ? 'has-live' : ''}`}
      onMouseEnter={() => clipUrl && setPlaying(true)}
      onMouseLeave={() => setPlaying(false)}
      onTouchStart={() => clipUrl && setPlaying(true)}
      onTouchEnd={() => setPlaying(false)}
    >
      {photo ? (
        <>
          {playing && clipUrl ? (
            <video
              src={clipUrl}
              autoPlay
              loop
              muted
              playsInline
              className="pose-live-video"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: mirrorResult ? 'scaleX(-1)' : undefined,
              }}
            />
          ) : (
            <img
              src={photo}
              alt={`Your pose ${index + 1}`}
              style={{
                filter: `url(#${filterId})`,
                transform: mirrorResult ? 'scaleX(-1)' : undefined,
              }}
            />
          )}
          {clip && (
            <span className="live-pill-badge" title="Tahan / arahkan kursor untuk memutar Live Photo">
              <span className="live-dot-pulse" /> LIVE
            </span>
          )}
          {clip && onDownloadClip && (
            <button
              className="pose-download-clip-btn"
              aria-label={`Download Live Video Pose ${index + 1}`}
              title={`Download Live Video Pose ${index + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                onDownloadClip(index);
              }}
            >
              <Video size={13} />
            </button>
          )}
          <button
            aria-label={`Retake Pose ${index + 1}`}
            title={`Retake Pose ${index + 1}`}
            disabled={busy}
            onClick={() => onRetake(index)}
          >
            <RotateCcw size={14} />
          </button>
          <span>{String(index + 1).padStart(2, '0')}</span>
        </>
      ) : (
        <span className="empty-pose">{String(index + 1).padStart(2, '0')}</span>
      )}
    </div>
  );
}

function App() {
  const [tab, setTab] = useState('studio');
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('cisspic-theme') === 'dark' || localStorage.getItem('snapbooth-theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [desktopTheme, setDesktopTheme] = useState(() => {
    try {
      return localStorage.getItem('cisspic-theme-preset') || 'sky';
    } catch {
      return 'sky';
    }
  });
  const [customBgColor, setCustomBgColor] = useState(() => {
    try {
      return localStorage.getItem('cisspic-custom-bg') || '#BFD7E8';
    } catch {
      return '#BFD7E8';
    }
  });
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
  const [printImageUrl, setPrintImageUrl] = useState(null);
  const [gallery, setGallery] = useState([]), [galleryLoading, setGalleryLoading] = useState(true);
  const [saving, setSaving] = useState(false), [copies, setCopies] = useState(1), [paper, setPaper] = useState('Glossy');
  const [renderingMotionPhoto, setRenderingMotionPhoto] = useState(false);
  const [waInput, setWaInput] = useState('');
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [stickerHistory, setStickerHistory] = useState(() => [style.userStickers || []]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [studioMobileView, setStudioMobileView] = useState('camera');
  const savedKey = useRef(''), savingRef = useRef(false);
  const filterId = `snap-filter-${useId().replaceAll(':', '')}`;

  const currentPoseCount = style.poseCount || 4;
  const camera = useCamera(tab === 'studio' && !paused);
  const livePhoto = useLivePhoto();
  const capture = useCapture(camera.videoRef, () => { setTab('customize'); setRetake(null); }, setNotice, camera.facing, 'normal', currentPoseCount, livePhoto);
  const activePoseCount = useMemo(() => capture.poseCount || currentPoseCount, [capture.poseCount, currentPoseCount]);
  const strip = useStrip(capture.photos, activeFilter, adjust, activeEffect, style, mirrorResult, capture.timestamp);
  const currentFilter = useMemo(() => FILTERS.find(f => f.id === activeFilter) || FILTERS[0], [activeFilter]);

  useEffect(() => {
    if (capture.photos.length > 0 && capture.photos.length >= activePoseCount) {
      setStudioMobileView('result');
    }
  }, [capture.photos.length, activePoseCount]);

  useEffect(() => {
    setPrintImageUrl(null);
    if (modal?.type !== 'print' || !strip.ready) return;
    let active = true, url;
    strip.result.getExport().then(async ({ blob }) => {
      if (!active) return;
      url = URL.createObjectURL(blob);
      const image = new Image(); image.src = url;
      await image.decode();
      if (active) setPrintImageUrl(url);
    }).catch(() => { if (active) setNotice('Could not prepare the HD print. Please try again.'); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [modal?.type, strip.ready, strip.result]);

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
    try {
      localStorage.setItem('cisspic-theme', dark ? 'dark' : 'light');
      localStorage.setItem('snapbooth-theme', dark ? 'dark' : 'light');
    } catch { /* Theme still works for this session. */ }
  }, [dark]);

  useEffect(() => {
    try {
      localStorage.setItem('cisspic-theme-preset', desktopTheme);
    } catch {}
  }, [desktopTheme]);

  useEffect(() => {
    try {
      localStorage.setItem('cisspic-custom-bg', customBgColor);
    } catch {}
  }, [customBgColor]);

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

  const navigate = useCallback((next) => {
    capture.cancel(); setRetake(null); setTab(next);
    if (next === 'studio') setPaused(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [capture]);

  const start = useCallback((mode = 'manual', targetRetake = null) => {
    const activeRetake = targetRetake !== null ? targetRetake : retake;

    if (activeRetake !== null) {
      capture.start('manual', activeRetake);
      setRetake(null);
      return;
    }

    if (capture.photos.length >= activePoseCount) {
      capture.finishManualSession();
      return;
    }

    capture.start('manual', null);
  }, [capture, retake, activePoseCount]);

  const beginRetake = useCallback((index) => {
    capture.cancel();
    setRetake(index);
    setPaused(false);
    setTab('studio');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [capture]);

  const resetEditing = useCallback(() => {
    setActiveFilter('korean');
    setActiveEffect({ ...DEFAULT_EFFECT });
    setAdjust({ ...DEFAULT_ADJUST });
    setStyle(cur => ({
      ...cur,
      customBg: '',
      userStickers: [],
      userTexts: [],
      borderStyle: 'default',
    }));
    setSelectedStickerId(null);
    setSelectedTextId(null);
    setStickerHistory([[]]);
    setHistoryIdx(0);
    setNotice('Filter, efek visual, stiker, teks, dan tone adjustments telah dikembalikan ke default.');
  }, []);

  const handleStickersChange = useCallback((nextStickers) => {
    setStyle(cur => ({ ...cur, userStickers: nextStickers }));
  }, []);

  const handleStickersCommit = useCallback((nextStickers) => {
    setStyle(cur => ({ ...cur, userStickers: nextStickers }));
    setStickerHistory(prev => {
      const sliced = prev.slice(0, historyIdx + 1);
      const nextList = [...sliced, nextStickers];
      if (nextList.length > 30) nextList.shift();
      return nextList;
    });
    setHistoryIdx(prev => Math.min(prev + 1, 29));
  }, [historyIdx]);

  const handleAddSticker = useCallback((stk) => {
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
  }, [style.userStickers, handleStickersCommit]);

  const handleUndoStickers = useCallback(() => {
    if (historyIdx > 0) {
      const nextIdx = historyIdx - 1;
      const restored = stickerHistory[nextIdx];
      setHistoryIdx(nextIdx);
      setStyle(cur => ({ ...cur, userStickers: restored }));
    }
  }, [historyIdx, stickerHistory]);

  const handleRedoStickers = useCallback(() => {
    if (historyIdx < stickerHistory.length - 1) {
      const nextIdx = historyIdx + 1;
      const restored = stickerHistory[nextIdx];
      setHistoryIdx(nextIdx);
      setStyle(cur => ({ ...cur, userStickers: restored }));
    }
  }, [historyIdx, stickerHistory]);

  const handleClearStickers = useCallback(() => {
    if (!style.userStickers?.length) return;
    if (window.confirm('Hapus semua stiker dari strip foto ini?')) {
      setSelectedStickerId(null);
      handleStickersCommit([]);
    }
  }, [style.userStickers, handleStickersCommit]);

  const handleTextsChange = useCallback((nextTexts) => {
    setStyle(cur => ({ ...cur, userTexts: nextTexts }));
  }, []);

  const handleTextsCommit = useCallback((nextTexts) => {
    setStyle(cur => ({ ...cur, userTexts: nextTexts }));
  }, []);

  const handleAddText = useCallback((txt) => {
    const currentTexts = style.userTexts || [];
    const next = [...currentTexts, txt];
    setSelectedTextId(txt.id);
    setSelectedStickerId(null);
    handleTextsCommit(next);
    setNotice('Teks berhasil ditambahkan! Geser teks ke posisi yang kamu inginkan di atas strip foto.');
  }, [style.userTexts, handleTextsCommit]);

  const handlePoseCountChange = useCallback((count) => {
    capture.setPoseCount(count);
    const layoutMap = { 1: '1-single', 2: '2-vertical', 3: '3-vertical', 4: '4-vertical', 6: '6-grid' };
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
  }, [capture]);

  const persist = useCallback(async () => {
    if (!strip.ready || savedKey.current === strip.result.key) return;
    const exported = await strip.result.getExport();
    const item = {
      id: crypto.randomUUID(),
      blob: exported.blob,
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
  }, [strip, capture, currentFilter]);

  const save = useCallback(async (download = false) => {
    if (!strip.ready || savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      if (download) {
        const { blob } = await strip.result.getExport();
        downloadBlob(blob, filename(capture.timestamp));
      }
      const stored = await persist();
      setNotice(stored === false ? 'Saved in this session only: browser storage is full or unavailable. Download a copy to keep it.' : download ? 'PNG download started. Your strip is also in Gallery.' : 'Your strip is saved in Gallery.');
    } catch (err) { setNotice(err.message || 'Could not save your strip. Please try again.'); }
    finally { savingRef.current = false; setSaving(false); }
  }, [strip, persist, capture]);

  const share = useCallback(async (item) => {
    try {
      const blob = item?.blob || (await strip.result.getExport()).blob;
      const outcome = await shareBlob(blob, item?.filename || filename(capture.timestamp));
      if (outcome === 'downloaded') setNotice('File sharing is unavailable here. Your PNG download started instead.');
    } catch { setNotice('Could not share this photo. Use Download to save a copy.'); }
  }, [strip, capture]);

  const remove = useCallback(async (item) => {
    setSaving(true);
    try { if (!item.sessionOnly) await deleteGalleryItem(item.id); }
    catch { setNotice('Could not remove the stored photo. Please try again.'); setSaving(false); return; }
    setGallery(items => items.filter(x => x.id !== item.id)); savedKey.current = ''; setModal(null); setSaving(false);
  }, []);

  const poseTiles = (
    <div className={`pose-tiles count-${activePoseCount}`}>
      {Array.from({ length: activePoseCount }, (_, i) => (
        <PoseTileItem
          key={i}
          index={i}
          photo={capture.photos[i]}
          clip={livePhoto.liveClips[i]}
          filterId={filterId}
          mirrorResult={mirrorResult}
          busy={capture.busy}
          onRetake={beginRetake}
          onDownloadClip={(idx) => {
            livePhoto.downloadLiveClip(idx, filename(capture.timestamp));
            setNotice(`Mengunduh Live Photo Pose ${idx + 1}...`);
          }}
        />
      ))}
    </div>
  );

  const preview = (
    <div className={`strip-stage ${style.layout?.includes('wide') || style.layout === 'grid' ? 'landscape' : ''}`} aria-busy={capture.photos.length > 0 && !strip.ready}>
      {strip.result ? (
        <div
          className="strip-canvas-wrapper"
          style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}
          onClick={(e) => {
            if (
              e.target.closest('.placed-sticker-wrapper') ||
              e.target.closest('.placed-text-wrapper') ||
              e.target.closest('.sticker-handle') ||
              e.target.closest('.text-handle') ||
              e.target.closest('.sticker-toolbar') ||
              e.target.closest('.text-toolbar') ||
              e.target.closest('.sticker-transform-box') ||
              e.target.closest('.text-transform-box')
            ) {
              return;
            }
            setSelectedStickerId(null);
            setSelectedTextId(null);
          }}
        >
          <img
            className="strip-image"
            src={tab === 'customize' ? (strip.result.baseUrl || strip.result.url) : strip.result.url}
            alt="Your finished CissPic photostrip"
          />
          {tab === 'customize' && (
            <>
              <StickerCanvasEditor
                userStickers={style.userStickers || []}
                onChange={handleStickersChange}
                onCommit={handleStickersCommit}
                selectedId={selectedStickerId}
                onSelect={id => {
                  setSelectedStickerId(id);
                  if (id) setSelectedTextId(null);
                }}
              />
              <TextCanvasEditor
                userTexts={style.userTexts || []}
                onChange={handleTextsChange}
                onCommit={handleTextsCommit}
                selectedId={selectedTextId}
                onSelect={id => {
                  setSelectedTextId(id);
                  if (id) setSelectedStickerId(null);
                }}
              />
            </>
          )}
        </div>
      ) : (
        <div className="empty-strip">
          <strong>★ CISSPIC ★</strong>
          <small>AESTHETIC SELF PHOTO STUDIO</small>
          {Array.from({ length: activePoseCount }, (_, i) => i + 1).map(n => (
            <div key={n}><span>{String(n).padStart(2, '0')}</span></div>
          ))}
          <p>A little moment.<br />A forever keepsake.</p>
          <small>MADE BY YOU</small>
        </div>
      )}
      {capture.photos.length > 0 && !strip.ready && !strip.error && <span className="render-label" role="status">Developing your strip…</span>}
      {strip.error && (
        <div className="render-error-box" role="alert">
          <p className="inline-error">{strip.error}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button className="text-button" type="button" onClick={strip.retry}>
              <RotateCcw size={13} /> Coba Lagi
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => setStyle(cur => ({ ...cur, template: 'clean-white', frame: 'clean-white' }))}
            >
              Ganti Template Bersih
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const liveClipsList = Object.keys(livePhoto.liveClips);

  const handleDownloadMotionPhoto = useCallback(async () => {
    if (!liveClipsList.length) {
      setNotice('Belum ada rekaman klip video gerak (Live Photo). Pastikan tombol LIVE aktif saat memotret.');
      return;
    }

    setRenderingMotionPhoto(true);
    try {
      setNotice('Menyiapkan compositing Motion Photo (Video Gerak)…');
      const result = await renderMotionPhotoVideo({
        photos: capture.photos,
        liveClips: livePhoto.liveClips,
        style,
        filter: activeFilter,
        adjust,
        effect: activeEffect,
        mirrorResult,
        filterId,
        timestamp: capture.timestamp,
        onProgress: ({ percent, stage }) => {
          setNotice(`Memproses Motion Photo: ${stage} (${percent}%)`);
        },
      });

      const videoName = filename(capture.timestamp).replace(/\.(png|jpe?g|webp)$/i, '') + `-Motion-Photo.${result.extension}`;
      downloadBlob(result.blob, videoName);
      setNotice('Motion Photo (Video Gerak) berhasil diunduh! Komposisi lengkap dengan bingkai, stiker, filter & teks.');
    } catch (err) {
      console.error('Motion Photo render error:', err);
      setNotice(`Gagal merender video utuh: ${err.message}. Mengunduh klip kamera individual sebagai gantinya…`);
      livePhoto.downloadAllLiveClips(filename(capture.timestamp));
    } finally {
      setRenderingMotionPhoto(false);
    }
  }, [liveClipsList.length, capture.photos, livePhoto, style, activeFilter, adjust, activeEffect, mirrorResult, filterId, capture.timestamp]);

  const actions = (
    <div className="result-actions">
      <button className="button primary" disabled={!strip.ready || saving || capture.busy} onClick={() => save(true)}>
        <Download size={17} />{saving ? 'Saving…' : 'Simpan Strip Foto (PNG)'}
      </button>

      {liveClipsList.length > 0 && (
        <button
          className="button live-action-primary"
          disabled={saving || capture.busy || renderingMotionPhoto}
          onClick={handleDownloadMotionPhoto}
          title="Download video gerak utuh dengan bingkai photostrip, stiker, teks dan filter"
        >
          <Video size={17} />
          {renderingMotionPhoto
            ? 'Merender Motion Photo…'
            : 'Download Motion Photo (Video Gerak)'}
        </button>
      )}

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
          {strip.ready && capture.photos.map((_, i) => (
            <button
              key={i}
              className="text-button"
              onClick={async () => {
                try {
                  const blob = await strip.result.getIndividual(i);
                  downloadBlob(blob, filename(capture.timestamp).replace('.png', `-Pose-${i + 1}.png`));
                } catch (err) {
                  setNotice(err.message);
                }
              }}
            >
              <Download size={14} />Download Pose {i + 1} (PNG)
            </button>
          ))}
          {liveClipsList.map(idx => (
            <button
              key={`live-dl-${idx}`}
              className="text-button live-dl-item"
              onClick={() => {
                livePhoto.downloadLiveClip(Number(idx), filename(capture.timestamp));
                setNotice(`Mengunduh klip video kamera Pose ${Number(idx) + 1}...`);
              }}
            >
              <Video size={14} /> Download Klip Kamera Pose {Number(idx) + 1} (Mentah)
            </button>
          ))}
        </div>
      </details>
      <p className="export-note">{strip.ready ? `${strip.result.width} × ${strip.result.height} px · PNG` : 'High-resolution PNG · Made on your device'}</p>
    </div>
  );

  return (
    <div
      className={`snapbooth theme-${desktopTheme} ${dark ? 'dark' : ''}`}
      style={desktopTheme === 'custom' ? { '--bg': customBgColor } : undefined}
    >
      <DesktopDoodles />
      <RetroStatusBar />
      <FilterDefinitions filter={activeFilter} adjust={adjust} id={filterId} />
      <a className="skip-link" href="#main">Skip to studio</a>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigate('studio')} aria-label="CissPic studio">
            <span className="brand-mark"><Camera size={21} /></span>
            <span><strong>CissPic<span className="brand-dot">®</span></strong><small>AESTHETIC SELF PHOTO STUDIO</small></span>
          </button>
          <nav className="desktop-nav" aria-label="Main navigation">
            {[['studio', 'Studio'], ['customize', 'Edit'], ['gallery', 'Gallery']].map(([id, label]) => (
              <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => navigate(id)}>{label}</button>
            ))}
          </nav>
          <div className="header-actions">
            <ThemePaletteDock
              currentTheme={desktopTheme}
              onSelectTheme={setDesktopTheme}
              customColor={customBgColor}
              onCustomColorChange={setCustomBgColor}
              className="header-theme-dock"
            />
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
            <div className="mobile-studio-switcher" role="tablist" aria-label="Tampilan Studio Mobile">
              <button
                type="button"
                className={`mobile-switch-btn ${studioMobileView === 'camera' ? 'active' : ''}`}
                onClick={() => setStudioMobileView('camera')}
                role="tab"
                aria-selected={studioMobileView === 'camera'}
              >
                <Camera size={14} />
                <span>Kamera Studio</span>
              </button>
              <button
                type="button"
                className={`mobile-switch-btn ${studioMobileView === 'result' ? 'active' : ''}`}
                onClick={() => setStudioMobileView('result')}
                role="tab"
                aria-selected={studioMobileView === 'result'}
              >
                <ImageIcon size={14} />
                <span>Hasil Strip ({capture.photos.length}/{activePoseCount})</span>
                {capture.photos.length > 0 && <span className="mobile-switch-indicator">●</span>}
              </button>
            </div>

            <DiaryCollage
              photos={capture.photos}
              filterId={filterId}
              mirrored={mirrorResult}
              theme={desktopTheme}
              onSelectTheme={setDesktopTheme}
              customColor={customBgColor}
              onCustomColorChange={setCustomBgColor}
            />

            <div className={`studio-camera-pane ${studioMobileView === 'result' ? 'mobile-hidden' : ''}`}>
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
                liveEnabled={livePhoto.liveEnabled}
                onToggleLive={() => livePhoto.setLiveEnabled(!livePhoto.liveEnabled)}
              />
              {capture.photos.length > 0 && (
                <button
                  type="button"
                  className="mobile-peek-result-btn"
                  onClick={() => setStudioMobileView('result')}
                >
                  <ImageIcon size={14} />
                  <span>Lihat Hasil Strip ({capture.photos.length}/{activePoseCount}) ➔</span>
                </button>
              )}
            </div>

            <section className={`result-card studio-result ${studioMobileView === 'camera' ? 'mobile-hidden' : ''}`}>
              <div className="retro-window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>keepsake.preview</span><ImageIcon size={13} /></div>
              <div className="section-heading">
                <div><p className="eyebrow">Made by you</p><h2>Your Photo Strip</h2></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="count-label">{capture.photos.length} / {activePoseCount}</span>
                  <button
                    type="button"
                    className="mobile-back-camera-btn"
                    onClick={() => setStudioMobileView('camera')}
                    title="Kembali ke kamera"
                  >
                    <Camera size={13} /> Kamera
                  </button>
                </div>
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
              <DiaryCollage
                photos={capture.photos}
                filterId={filterId}
                mirrored={mirrorResult}
                theme={desktopTheme}
                onSelectTheme={setDesktopTheme}
                customColor={customBgColor}
                onCustomColorChange={setCustomBgColor}
              />
              <section className="result-card edit-preview">
                <div className="retro-window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>your-photo-diary.png</span><ImageIcon size={13} /></div>
                <div className="section-heading">
                  <div><p className="eyebrow">Your photos</p><h2>A keepsake in the making.</h2></div>
                  <button className="text-button" onClick={() => navigate('studio')}>Back to studio</button>
                </div>
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
                  onSelectSticker={id => {
                    setSelectedStickerId(id);
                    if (id) setSelectedTextId(null);
                  }}
                  onAddSticker={handleAddSticker}
                  canUndoStickers={historyIdx > 0}
                  canRedoStickers={historyIdx < stickerHistory.length - 1}
                  onUndoStickers={handleUndoStickers}
                  onRedoStickers={handleRedoStickers}
                  onClearStickers={handleClearStickers}
                  selectedTextId={selectedTextId}
                  onSelectText={id => {
                    setSelectedTextId(id);
                    if (id) setSelectedStickerId(null);
                  }}
                  onAddText={handleAddText}
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
        <span>CissPic / a personal photo diary.</span>
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
              <button className="button primary" disabled={!printImageUrl} onClick={() => window.print()}><Printer size={16} />{printImageUrl ? 'Open print dialog' : 'Preparing HD print…'}</button>
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
                const { blob } = await strip.result.getExport();
                downloadBlob(blob, filename(capture.timestamp));
                setNotice('Salinan foto sedang disiapkan dan dikirim ke WhatsApp!');
                setModal(null);
                let digits = clean.replace(/[^0-9]/g, '');
                if (digits.startsWith('0')) digits = '62' + digits.slice(1);
                window.open(`https://wa.me/${digits}?text=${encodeURIComponent('Halo! Ini salinan strip foto CissPic kamu ✨')}`, '_blank', 'noopener,noreferrer');
              }}>
                <MessageCircle size={16} />Kirim Salinan Foto
              </button>
            </>
          )}
        </Modal>
      )}
      {modal?.type === 'print' && (
        <div className="print-sheet">
          {printImageUrl && Array.from({ length: copies }, (_, i) => <img src={printImageUrl} key={i} alt={`Print copy ${i + 1}`} />)}
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('CissPic caught render error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#121115',
          color: '#FFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 650, marginBottom: '8px' }}>Ada kendala saat memuat tampilan</h2>
          <p style={{ color: '#AAA', fontSize: '13px', maxWidth: '420px', marginBottom: '22px', lineHeight: 1.5 }}>
            {this.state.error?.message || 'Terjadi kesalahan sistem yang tidak terduga.'}
          </p>
          <button
            style={{
              background: '#7061A8',
              color: '#FFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '9px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
            onClick={() => window.location.reload()}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RootApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
