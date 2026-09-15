import { useEffect, useMemo, useRef, useState } from 'react';
import { canvasBlob, composeStrip, processPhoto } from '../lib/photos.js';
import { preloadStickerAssets } from '../lib/stickers.js';
import { LatestRenderQueue, nextFrame, releaseCanvas } from '../lib/renderResources.js';
import { preloadTemplateAssets } from '../lib/themedTemplates.js';

export function useStrip(photos, filter, adjust, effect, style, mirrorResult = false, timestamp = null) {
  const [result, setResult] = useState(null), [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const queue = useRef(new LatestRenderQueue());
  const cache = useRef({ photos: null, processed: [] });
  const effectKey = JSON.stringify(effect), styleKey = JSON.stringify(style), adjustKey = JSON.stringify(adjust);
  const key = useMemo(() => ({}), [photos, filter, adjustKey, effectKey, styleKey, mirrorResult, timestamp, retryCount]);
  const output = useRef(null);
  useEffect(() => () => {
    queue.current.cancel(); output.current?.dispose();
    cache.current.processed.forEach(releaseCanvas); cache.current = { processed: [] };
  }, []);

  useEffect(() => {
    setError('');
    if (!photos.length) { queue.current.cancel(); output.current?.dispose(); output.current = null; setResult(null); return; }
    const snapshot = { ...style, userStickers: [...(style.userStickers || [])], userTexts: [...(style.userTexts || [])] };
    const check = signal => { if (signal.aborted) throw new DOMException('Cancelled', 'AbortError'); };
    queue.current.submit(async signal => {
      await nextFrame(signal);
      const processingKey = [filter, adjustKey, effectKey, mirrorResult].join('|');
      let processed = cache.current.photos === photos && cache.current.key === processingKey ? cache.current.processed : null;
      if (!processed) {
        processed = [];
        try {
          for (const photo of photos) {
            check(signal);
            processed.push(await processPhoto(photo, filter, adjust, effect, mirrorResult, 640));
            await nextFrame(signal);
          }
        } catch (err) { processed.forEach(releaseCanvas); throw err; }
        cache.current.processed.forEach(releaseCanvas);
        cache.current = { photos, key: processingKey, processed };
      }
      await Promise.all([preloadStickerAssets(snapshot.userStickers), preloadTemplateAssets(snapshot.template || snapshot.frame)]);
      check(signal);
      // The DOM editors draw user overlays; base preview omits both to avoid double rendering.
      const base = await composeStrip(processed, { ...snapshot, userStickers: [], userTexts: [] }, timestamp, { maxDimension: 2000, signal });
      let composite;
      const urls = [];
      try {
        const baseBlob = await canvasBlob(base); check(signal);
        composite = (snapshot.userStickers.length || snapshot.userTexts.length) ? await composeStrip(processed, snapshot, timestamp, { maxDimension: 2000, signal }) : base;
        const blob = composite === base ? baseBlob : await canvasBlob(composite); check(signal);
        const url = URL.createObjectURL(blob), baseUrl = composite === base ? url : URL.createObjectURL(baseBlob);
        urls.push(url); if (baseUrl !== url) urls.push(baseUrl);
        let exportPromise;
        const getExport = () => {
          if (exportPromise) return exportPromise;
          // Explicit export is a frozen snapshot, never the next selected template.
          exportPromise = (async () => {
            const hd = [];
            let canvas;
            try {
              for (const photo of photos) { hd.push(await processPhoto(photo, filter, adjust, effect, mirrorResult, 1600)); await nextFrame(); }
              await Promise.all([preloadStickerAssets(snapshot.userStickers), preloadTemplateAssets(snapshot.template || snapshot.frame)]);
              canvas = await composeStrip(hd, snapshot, timestamp, { maxDimension: 2400 });
              const outputBlob = await canvasBlob(canvas);
              return { blob: outputBlob, width: canvas.width, height: canvas.height };
            } finally { hd.forEach(releaseCanvas); releaseCanvas(canvas); }
          })().catch(err => { exportPromise = null; throw err; });
          return exportPromise;
        };
        const getIndividual = async index => {
          const canvas = await processPhoto(photos[index], filter, adjust, effect, mirrorResult, 1600);
          try { return await canvasBlob(canvas); } finally { releaseCanvas(canvas); }
        };
        return { key, url, baseUrl, blob, width: base.exportWidth || base.width, height: base.exportHeight || base.height, previewWidth: base.width, previewHeight: base.height,
          photoCount: photos.length, templateId: snapshot.template, getExport, getIndividual,
          dispose: () => { urls.forEach(u => URL.revokeObjectURL(u)); exportPromise = null; } };
      } catch (err) { urls.forEach(u => URL.revokeObjectURL(u)); throw err; }
      finally { if (composite !== base) releaseCanvas(composite); releaseCanvas(base); }
    }, next => { const previous = output.current; output.current = next; setResult(next); previous?.dispose(); }, err => setError(`Template gagal dimuat. ${err.message}${output.current ? ' Preview masih menampilkan hasil sebelumnya.' : ''}`));
    return () => queue.current.cancel();
  }, [key]);
  return { result, ready: !!result && result.key === key && !error, error, retry: () => setRetryCount(n => n + 1) };
}
