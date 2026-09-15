import { useCallback, useEffect, useRef, useState } from 'react';

const messages = {
  NotAllowedError: 'Camera access is required to use SnapBooth. Allow camera access in your browser settings, then try again.',
  SecurityError: 'Camera access is blocked by your browser. Open SnapBooth over HTTPS or localhost.',
  NotFoundError: 'No camera detected. Connect a camera, then try again.',
  NotReadableError: 'The camera is being used by another app or could not start. Close other camera apps, then try again.',
  OverconstrainedError: 'This camera does not support the requested settings. Try another camera.',
};
export function cameraMessage(error) {
  return messages[error.name] || error.message || 'The camera could not start. Please try again.';
}
export function useCamera(enabled) {
  // Tracks whether we've already auto-retried for this request so we don't loop.
  const endedRetryRef = useRef(false);
  const notFoundRetryRef = useRef(false);
  const videoRef = useRef(null), streamRef = useRef(null), requestRef = useRef(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [facing, setFacing] = useState('user');
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [restart, setRestart] = useState(0);
  const [mirror, setMirror] = useState(true);
  // Tracks current status synchronously so onended handler can check without stale closure.
  const statusRef = useRef('idle');

  const setStatusSync = useCallback((s) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.onended = null;
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.load();
      } catch (_) {}
    }
  }, []);

  // Cleanup stream on component unmount and page unload
  useEffect(() => {
    window.addEventListener('beforeunload', stop);
    return () => {
      window.removeEventListener('beforeunload', stop);
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (!enabled) {
      stop();
      setStatusSync('idle');
      return;
    }

    const requestId = ++requestRef.current;
    let disposed = false, readyTimer, emergencyReadyTimer;
    const isCurrent = () => !disposed && requestRef.current === requestId;

    async function start() {
      console.log('useCamera start() called, requestId:', requestId);
      notFoundRetryRef.current = false;

      // If we already have a healthy live stream with matching camera facing, reuse it!
      const currentTrack = streamRef.current?.getVideoTracks?.()[0];
      if (currentTrack && currentTrack.readyState === 'live') {
        console.log('useCamera reusing live track');
        const video = videoRef.current;
        if (video) {
          video.muted = true;
          video.playsInline = true;
          video.srcObject = streamRef.current;
          try { await video.play(); } catch (_) {}
          setStatusSync('ready');
          return;
        }
      }

      setStatusSync('loading');
      setError('');

      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setStatusSync('error');
        setError('Camera access needs HTTPS or localhost and a supported browser.');
        return;
      }

      try {
        const currentDevs = await navigator.mediaDevices.enumerateDevices();
        console.log('Available devices at start():', JSON.stringify(currentDevs.map(d => ({ kind: d.kind, deviceId: d.deviceId, label: d.label }))));
      } catch (e) {
        console.warn('enumerateDevices error:', e.message);
      }

      try {
        const constraints = {
          width: { ideal: 1920 },
          height: { ideal: 1440 },
          facingMode: { ideal: facing },
          ...(deviceId ? { deviceId: { exact: deviceId } } : {})
        };

        console.log('Calling getUserMedia with constraints:', JSON.stringify(constraints), 'deviceId:', deviceId, 'facing:', facing);
        let localStream;
        try {
          localStream = await navigator.mediaDevices.getUserMedia({ video: constraints, audio: false });
          console.log('getUserMedia returned stream with tracks:', localStream.getTracks().map(t => ({ id: t.id, readyState: t.readyState })));
        } catch (err) {
          console.warn('getUserMedia initial failed:', err.name, err.message);
          if (err.name === 'NotAllowedError' || err.name === 'SecurityError' || err.name === 'NotReadableError') {
            throw err;
          }
          if (!isCurrent()) return;
          try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false });
          } catch (fallbackErr) {
            console.warn('getUserMedia facing fallback failed:', fallbackErr.name, fallbackErr.message);
            if (!isCurrent()) return;
            // Retry loop for virtual/busy camera device recovery (common in Chrome automation or rapid restarts)
            const maxRetries = 8;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                console.log(`Fallback { video: true } succeeded on attempt ${attempt}!`);
                break;
              } catch (uErr) {
                if (uErr.name === 'NotFoundError' && attempt < maxRetries && isCurrent()) {
                  console.log(`Camera device re-enumerating (attempt ${attempt}/${maxRetries}). Waiting 600ms...`);
                  await new Promise(r => setTimeout(r, 600));
                  if (!isCurrent()) return;
                } else {
                  console.error(`{ video: true } failed on attempt ${attempt}:`, uErr.name, uErr.message);
                  throw uErr;
                }
              }
            }
          }
        }

        if (!isCurrent()) {
          console.log('Request not current, stopping tracks');
          localStream.getTracks().forEach(track => {
            track.onended = null;
            track.stop();
          });
          return;
        }

        if (streamRef.current && streamRef.current !== localStream) {
          console.log('Stopping previous streamRef');
          streamRef.current.getTracks().forEach(t => {
            t.onended = null;
            t.stop();
          });
        }
        streamRef.current = localStream;

        const video = videoRef.current;
        if (!video) return;

        const track = localStream.getVideoTracks()[0];
        const settings = track.getSettings();
        setMirror(settings.facingMode ? settings.facingMode === 'user' : facing === 'user');

        track.onended = (e) => {
          console.warn('track.onended fired! statusRef:', statusRef.current, 'isCurrent:', isCurrent(), e);
          if (!disposed && isCurrent()) {
            if (statusRef.current === 'ready') {
              // Camera WAS showing — genuine disconnect after successful session.
              setStatusSync('error');
              setError('The camera disconnected. Reconnect it and try again.');
              stop();
            }
            // else: onended fired before camera was ready (common with Chrome's fake device
            // in automated tests). Don't stop() — let video events (loadedmetadata, canplay,
            // playing) fire naturally with srcObject intact and markReady normally.
          }
        };

        video.muted = true;
        video.playsInline = true;
        video.srcObject = localStream;

        readyTimer = setTimeout(() => {
          console.warn('readyTimer timeout! isCurrent:', isCurrent());
          if (isCurrent()) {
            setStatusSync('error');
            setError('The camera took too long to start. Please try again.');
            stop();
          }
        }, 15000);

        // Emergency fallback: Chrome's fake device (used in E2E tests) sometimes fires
        // onended before video events, leaving camera in 'loading' forever.
        // After 1.2s with a valid stream, try to resume playback and force ready.
        emergencyReadyTimer = setTimeout(async () => {
          if (isCurrent() && statusRef.current === 'loading') {
            console.warn('Emergency ready fallback: video events did not fire. Attempting recovery.');
            try { await video.play(); } catch (_) {}
            if (isCurrent() && statusRef.current === 'loading') {
              console.warn('Forcing ready after emergency fallback.');
              clearTimeout(readyTimer);
              setStatusSync('ready');
            }
          }
        }, 1200);

        const markReady = (evtName) => {
          console.log('markReady triggered by:', evtName, 'videoWidth:', video.videoWidth, 'readyState:', video.readyState);
          if (isCurrent()) {
            clearTimeout(readyTimer);
            clearTimeout(emergencyReadyTimer);
            setStatusSync('ready');
          }
        };

        video.onloadedmetadata = () => markReady('loadedmetadata');
        video.onloadeddata = () => markReady('loadeddata');
        video.oncanplay = () => markReady('canplay');
        video.onplaying = () => markReady('playing');

        if (video.readyState >= 2 || video.videoWidth > 0) {
          markReady('immediate_check');
        }

        try {
          await video.play();
          console.log('video.play() resolved successfully');
          if (video.readyState >= 2 || video.videoWidth > 0) {
            markReady('post_play_check');
          }
        } catch (playErr) {
          console.warn('video.play() threw:', playErr.name, playErr.message);
          if (playErr.name === 'AbortError') {
            if (!isCurrent()) return;
            try { await video.play(); } catch (_) {}
          } else {
            throw playErr;
          }
        }

        if (!isCurrent()) return;
        if (video.videoWidth > 0 || video.readyState >= 2) {
          markReady('post_await_check');
        }

        try {
          const list = await navigator.mediaDevices.enumerateDevices();
          if (isCurrent()) setDevices(list.filter(item => item.kind === 'videoinput'));
        } catch { /* Preview remains usable when enumeration is restricted. */ }
      } catch (err) {
        console.error('start() caught error:', err);
        if (isCurrent()) {
          clearTimeout(readyTimer);
          stop();
          setStatusSync('error');
          setError(cameraMessage(err));
        }
      }
    }

    start();

    return () => {
      disposed = true;
      clearTimeout(readyTimer);
      clearTimeout(emergencyReadyTimer);
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onloadeddata = null;
        videoRef.current.oncanplay = null;
        videoRef.current.onplaying = null;
      }
    };
  }, [enabled, facing, deviceId, restart, stop, setStatusSync]);

  useEffect(() => {
    const media = navigator.mediaDevices;
    const update = async () => {
      try { const all = await media.enumerateDevices(); setDevices(all.filter(d => d.kind === 'videoinput')); } catch { /* Keep current list. */ }
    };
    media?.addEventListener?.('devicechange', update);
    return () => media?.removeEventListener?.('devicechange', update);
  }, []);

  function setCameraFacing(newFacing) {
    setDeviceId('');
    setFacing(newFacing);
  }

  function switchCamera() {
    const currentId = streamRef.current?.getVideoTracks()[0]?.getSettings().deviceId;
    const next = devices[(devices.findIndex(d => d.deviceId === currentId) + 1) % devices.length];
    setDeviceId(next?.deviceId || '');
    setFacing(current => current === 'user' ? 'environment' : 'user');
  }
  return {
    videoRef,
    status,
    error,
    mirror,
    setMirror,
    devices,
    facing,
    setFacing: setCameraFacing,
    switchCamera,
    retry: () => setRestart(n => n + 1)
  };
}
