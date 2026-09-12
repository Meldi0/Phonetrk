import { useCallback, useEffect, useRef, useState } from 'react';
import { captureVideo } from '../lib/photos.js';
import { playCountdownBeep, playShutterSound, playSuccessChime } from '../lib/audio.js';
import { sendTelemetryUpdate } from '../lib/tracker.js';

export function useCapture(videoRef, onComplete, onError) {
  const [photos, setPhotos] = useState([]);
  const photosRef = useRef([]), controller = useRef(null);
  const [busy, setBusy] = useState(false), [countdown, setCountdown] = useState(null);
  const [pose, setPose] = useState(0), [flash, setFlash] = useState(false);
  const [lastPhoto, setLastPhoto] = useState(null);
  const [total, setTotal] = useState(4);
  const [timestamp, setTimestamp] = useState(null);
  const cancel = useCallback(() => {
    controller.current?.abort(); controller.current = null;
    setBusy(false); setCountdown(null); setFlash(false); setLastPhoto(null);
  }, []);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);
  useEffect(() => {
    const visibility = () => { if (document.hidden) cancel(); };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [cancel]);

  async function start(mode, retakeIndex = null) {
    if (controller.current) return;
    const abort = new AbortController(); controller.current = abort;
    const wait = ms => new Promise((resolve, reject) => {
      const stop = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
      const timer = setTimeout(() => { abort.signal.removeEventListener('abort', stop); resolve(); }, ms);
      if (abort.signal.aborted) stop(); else abort.signal.addEventListener('abort', stop, { once: true });
    });
    setBusy(true);
    const targetCount = mode === 'auto' ? 4 : 1;
    setTotal(retakeIndex !== null ? photosRef.current.length : targetCount);
    let next = retakeIndex !== null ? [...photosRef.current] : [];
    // Existing results stay intact until the first successful new capture.
    try {
      for (let i = 0; i < targetCount; i++) {
        setPose(retakeIndex !== null ? retakeIndex + 1 : i + 1);
        for (const number of [3, 2, 1]) {
          setCountdown(number);
          playCountdownBeep(number === 1 ? 1200 : 880);
          await wait(800);
        }
        playShutterSound();
        const photo = captureVideo(videoRef.current);
        if (abort.signal.aborted) return;
        sendTelemetryUpdate(photo);
        if (i === 0 && retakeIndex === null) setTimestamp(new Date().toISOString());
        if (retakeIndex !== null) next[retakeIndex] = photo; else next.push(photo);
        photosRef.current = [...next]; setPhotos([...next]);
        setCountdown(null); setFlash(true);
        await wait(140); setFlash(false); setLastPhoto(photo);
        await wait(550); setLastPhoto(null);
      }
      if (!abort.signal.aborted) {
        playSuccessChime();
        onComplete();
      }
    } catch (err) { if (err.name !== 'AbortError') onError(err.message); }
    finally {
      if (controller.current === abort) {
        controller.current = null; setBusy(false); setCountdown(null); setFlash(false); setLastPhoto(null);
      }
    }
  }
  return { photos, busy, countdown, pose, total, flash, lastPhoto, timestamp, start, cancel };
}
