import { useEffect, useMemo, useRef, useState } from 'react';
import { canvasBlob, composeStrip, processPhoto } from '../lib/photos.js';

export function useStrip(photos, filter, adjust, effect, style, mirrorResult = false, timestamp = null) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const cache = useRef({ processed: [] });
  const activeUrlRef = useRef(null);

  // Serialize effect to avoid reference inequality triggers if object is recreated
  const effectKey = effect ? `${effect.id}-${effect.intensity}-${JSON.stringify(effect.privacyBox || {})}` : 'none';
  const styleKey = JSON.stringify(style);

  const key = useMemo(
    () => ({}),
    [photos, filter, adjust, effectKey, styleKey, mirrorResult, timestamp]
  );

  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!photos.length) {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
      setResult(null);
      return;
    }
    setError('');

    const timer = setTimeout(async () => {
      try {
        const canReuse =
          cache.current.photos === photos &&
          cache.current.filter === filter &&
          cache.current.adjust === adjust &&
          cache.current.effectKey === effectKey &&
          cache.current.mirrorResult === mirrorResult;

        let processed = canReuse ? cache.current.processed : null;

        if (!processed) {
          processed = [];
          for (const photo of photos) {
            processed.push(await processPhoto(photo, filter, adjust, effect, mirrorResult));
            if (cancelled) return;
            // Yield between photos so UI stays snappy
            await new Promise(resolve => requestAnimationFrame(resolve));
          }
          cache.current = { photos, filter, adjust, effectKey, mirrorResult, processed };
        }

        const canvas = composeStrip(processed, style, timestamp);
        const blob = await canvasBlob(canvas);
        if (cancelled) return;

        const url = canvas.toDataURL ? canvas.toDataURL('image/png') : URL.createObjectURL(blob);
        setResult({ key, url, blob, width: canvas.width, height: canvas.height, processed });
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }, 60);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key]);

  return { result, ready: !!result && result.key === key && !error, error };
}
