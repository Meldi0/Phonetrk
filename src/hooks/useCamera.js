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
  const videoRef = useRef(null), streamRef = useRef(null), requestRef = useRef(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [facing, setFacing] = useState('user');
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [restart, setRestart] = useState(0);
  const [mirror, setMirror] = useState(true);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.onended = null;
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (!enabled) {
      stop();
      setStatus('idle');
      return;
    }

    const requestId = ++requestRef.current;
    let disposed = false, readyTimer;
    const isCurrent = () => !disposed && requestRef.current === requestId;

    async function start() {
      console.log('useCamera start() called, requestId:', requestId);
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
          setStatus('ready');
          return;
        }
      }

      setStatus('loading');
      setError('');

      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        setError('Camera access needs HTTPS or localhost and a supported browser.');
        return;
      }

      try {
        const constraints = {
          width: { ideal: 1920 },
          height: { ideal: 1440 },
          facingMode: { ideal: facing },
          ...(deviceId ? { deviceId: { exact: deviceId } } : {})
        };

        console.log('Calling getUserMedia with constraints:', constraints);
        let localStream;
        try {
          localStream = await navigator.mediaDevices.getUserMedia({ video: constraints, audio: false });
          console.log('getUserMedia returned stream with tracks:', localStream.getTracks().map(t => ({ id: t.id, readyState: t.readyState })));
        } catch (err) {
          console.warn('getUserMedia initial failed:', err.name, err.message);
          if (err.name !== 'OverconstrainedError' && !(err.name === 'NotFoundError' && deviceId)) throw err;
          if (!isCurrent()) return;
          localStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false });
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
        if (!video) { stop(); return; }

        const track = localStream.getVideoTracks()[0];
        const settings = track.getSettings();
        setMirror(settings.facingMode ? settings.facingMode === 'user' : facing === 'user');

        track.onended = (e) => {
          console.warn('track.onended fired! disposed:', disposed, 'isCurrent:', isCurrent(), e);
          if (!disposed && isCurrent()) {
            setStatus('error');
            setError('The camera disconnected. Reconnect it and try again.');
            stop();
          }
        };

        video.muted = true;
        video.playsInline = true;
        video.srcObject = localStream;

        readyTimer = setTimeout(() => {
          console.warn('readyTimer timeout! isCurrent:', isCurrent());
          if (isCurrent()) {
            setStatus('error');
            setError('The camera took too long to start. Please try again.');
            stop();
          }
        }, 15000);

        const markReady = (evtName) => {
          console.log('markReady triggered by:', evtName, 'videoWidth:', video.videoWidth, 'readyState:', video.readyState);
          if (isCurrent()) {
            clearTimeout(readyTimer);
            setStatus('ready');
          }
        };

        video.onloadedmetadata = () => markReady('loadedmetadata');
        video.onloadeddata = () => markReady('loadeddata');
        video.oncanplay = () => markReady('canplay');
        video.onplaying = () => markReady('playing');

        try {
          await video.play();
          console.log('video.play() resolved successfully');
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
          markReady('immediateCheck');
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
          setStatus('error');
          setError(cameraMessage(err));
        }
      }
    }

    start();

    return () => {
      disposed = true;
      clearTimeout(readyTimer);
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onloadeddata = null;
        videoRef.current.oncanplay = null;
        videoRef.current.onplaying = null;
      }
    };
  }, [enabled, facing, deviceId, restart, stop]);

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
