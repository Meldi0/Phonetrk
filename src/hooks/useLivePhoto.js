import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Live Photo Hook: Records a 2-3 second motion clip around the shutter moment.
 * Stores video Blob + ObjectURL, supports instant MP4/WebM download,
 * hover/tap video playback with "LIVE" badge indicator, and strict memory cleanup.
 */
export function useLivePhoto() {
  const [liveEnabled, setLiveEnabled] = useState(() => {
    try {
      return localStorage.getItem('cisspic_live_photo') === 'true';
    } catch {
      return false;
    }
  });

  // Stores { [index]: { url, blob, mimeType, extension } }
  const [liveClips, setLiveClips] = useState({});
  const clipsRef = useRef({});
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    try {
      localStorage.setItem('cisspic_live_photo', String(liveEnabled));
    } catch {}
  }, [liveEnabled]);

  const clearClips = useCallback(() => {
    Object.values(clipsRef.current).forEach(item => {
      const url = item?.url || item;
      if (url && typeof url === 'string') {
        try { URL.revokeObjectURL(url); } catch {}
      }
    });
    clipsRef.current = {};
    setLiveClips({});
  }, []);

  useEffect(() => {
    return () => {
      Object.values(clipsRef.current).forEach(item => {
        const url = item?.url || item;
        if (url && typeof url === 'string') {
          try { URL.revokeObjectURL(url); } catch {}
        }
      });
    };
  }, []);

  const startClipRecording = useCallback((stream) => {
    if (!liveEnabled || !stream || typeof MediaRecorder === 'undefined') return;
    try {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try { recorderRef.current.stop(); } catch {}
      }
      chunksRef.current = [];

      // Determine best supported MIME type: MP4 is preferred for mobile/iOS compatibility, WebM for desktop
      const candidates = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      let mimeType = '';
      for (const cand of candidates) {
        if (MediaRecorder.isTypeSupported(cand)) {
          mimeType = cand;
          break;
        }
      }

      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorderRef.current = recorder;
      recorder.start(100);
    } catch (err) {
      console.warn('Live Photo recording failed to start:', err);
    }
  }, [liveEnabled]);

  const stopClipRecording = useCallback((index) => {
    return new Promise(resolve => {
      if (!liveEnabled || !recorderRef.current || recorderRef.current.state === 'inactive') {
        return resolve(null);
      }
      const recorder = recorderRef.current;
      recorder.onstop = () => {
        try {
          const type = recorder.mimeType || 'video/webm';
          const blob = new Blob(chunksRef.current, { type });
          chunksRef.current = [];
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            const isMp4 = type.includes('mp4');
            const extension = isMp4 ? 'mp4' : 'webm';
            const clipData = {
              url,
              blob,
              mimeType: type,
              extension,
              size: blob.size,
              timestamp: Date.now(),
            };
            clipsRef.current[index] = clipData;
            setLiveClips(prev => ({ ...prev, [index]: clipData }));
            resolve(clipData);
          } else {
            resolve(null);
          }
        } catch (err) {
          console.warn('Failed to finalize live clip blob:', err);
          resolve(null);
        }
      };
      try {
        recorder.stop();
      } catch (err) {
        console.warn('Error stopping MediaRecorder:', err);
        resolve(null);
      }
    });
  }, [liveEnabled]);

  /**
   * Download a specific live video clip (MP4 or WebM)
   */
  const downloadLiveClip = useCallback((index, baseName = 'CissPic-Live') => {
    const item = clipsRef.current[index];
    if (!item) {
      console.warn(`No live clip found for pose ${index + 1}`);
      return false;
    }
    const url = item.url || item;
    const ext = item.extension || (item.mimeType?.includes('mp4') ? 'mp4' : 'webm');
    const safeBase = (baseName || 'CissPic-Live').replace(/\.(png|jpe?g|webp)$/i, '');
    const filename = `${safeBase}-Live-Pose-${Number(index) + 1}.${ext}`;

    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch {}
      }, 150);
      return true;
    } catch (err) {
      console.error('Failed to trigger live clip download:', err);
      return false;
    }
  }, []);

  /**
   * Download all available live clips in succession
   */
  const downloadAllLiveClips = useCallback((baseName = 'CissPic-Live') => {
    const indices = Object.keys(clipsRef.current);
    if (indices.length === 0) return false;

    indices.forEach((idx, i) => {
      setTimeout(() => {
        downloadLiveClip(Number(idx), baseName);
      }, i * 300);
    });
    return true;
  }, [downloadLiveClip]);

  return {
    liveEnabled,
    setLiveEnabled,
    liveClips,
    clearClips,
    startClipRecording,
    stopClipRecording,
    downloadLiveClip,
    downloadAllLiveClips,
  };
}

