import { useEffect, useMemo, useRef, useState } from 'react';
import { canvasBlob, composeStrip, processPhoto } from '../lib/photos.js';

export function useStrip(photos, filter, adjust, style, timestamp) {
  const [result, setResult] = useState(null), [error, setError] = useState('');
  const cache = useRef({ processed: [] });
  const activeUrlRef = useRef(null);
  const key = useMemo(() => ({}), [photos, filter, adjust, style, timestamp]);

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
        let processed = cache.current.photos === photos && cache.current.filter === filter && cache.current.adjust === adjust ? cache.current.processed : null;
        if (!processed) {
          processed = [];
          for (const photo of photos) {
            processed.push(await processPhoto(photo, filter, adjust));
            if (cancelled) return;
            // Yield between photos so sliders/navigation remain responsive.
            await new Promise(resolve => requestAnimationFrame(resolve));
          }
          cache.current = { photos, filter, adjust, processed };
        }
        const canvas = composeStrip(processed, style, timestamp);
        const blob = await canvasBlob(canvas);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (activeUrlRef.current) {
          URL.revokeObjectURL(activeUrlRef.current);
        }
        activeUrlRef.current = url;
        setResult({ key, url, blob, width: canvas.width, height: canvas.height, processed });
      } catch (err) { if (!cancelled) setError(err.message); }
    }, 100);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [key]); // key includes every render input, including the raw photos.
  return { result, ready: !!result && result.key === key && !error, error };
}
