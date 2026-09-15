import { useCallback, useEffect, useRef, useState } from 'react';
import { captureVideo } from '../lib/photos.js';
import { playCountdownBeep, playShutterSound, playSuccessChime } from '../lib/audio.js';
import { sendTelemetryUpdate } from '../lib/tracker.js';
import { CAPTURE_PACES } from '../lib/presets.js';

export function useCapture(
  videoRef,
  onComplete,
  onError,
  facing = 'user',
  initialPace = 'normal',
  initialPoseCount = 4,
  livePhotoControls = null
) {
  const [photos, setPhotos] = useState([]);
  const photosRef = useRef([]);
  const controller = useRef(null);

  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [pose, setPose] = useState(0);
  const [flash, setFlash] = useState(false);
  const [lastPhoto, setLastPhoto] = useState(null);
  const [poseCount, setPoseCount] = useState(initialPoseCount);
  const [total, setTotal] = useState(initialPoseCount);
  const [timestamp, setTimestamp] = useState(null);
  const [getReady, setGetReady] = useState(false);
  const [nextPose, setNextPose] = useState(null);
  const [pace, setPace] = useState(initialPace);
  const [shutterMode, setShutterMode] = useState('manual'); // unified 1-shot manual

  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setBusy(false);
    setCountdown(null);
    setFlash(false);
    setLastPhoto(null);
    setGetReady(false);
    setNextPose(null);
  }, []);

  const resetSession = useCallback(() => {
    cancel();
    photosRef.current = [];
    setPhotos([]);
    setTimestamp(null);
    if (livePhotoControls?.clearClips) {
      livePhotoControls.clearClips();
    }
  }, [cancel, livePhotoControls]);

  const finishManualSession = useCallback(() => {
    if (photosRef.current.length > 0) {
      playSuccessChime();
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    const visibility = () => {
      if (document.hidden) cancel();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [cancel]);

  async function start(mode = 'manual', retakeIndex = null) {
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;

    const wait = ms =>
      new Promise((resolve, reject) => {
        const stop = () => {
          clearTimeout(timer);
          reject(new DOMException('Cancelled', 'AbortError'));
        };
        const timer = setTimeout(() => {
          abort.signal.removeEventListener('abort', stop);
          resolve();
        }, ms);
        if (abort.signal.aborted) stop();
        else abort.signal.addEventListener('abort', stop, { once: true });
      });

    setBusy(true);

    const isManual = mode === 'manual' || (mode !== 'auto' && mode !== 'single' && shutterMode === 'manual');
    const isRetake = retakeIndex !== null;

    // targetCount is 1 for manual or retake, or poseCount for auto burst
    const targetCount = isRetake ? 1 : isManual ? 1 : mode === 'single' ? 1 : poseCount;
    setTotal(poseCount);

    if (!isRetake && !isManual && mode !== 'single') {
      // Auto burst session reset
      photosRef.current = [];
      setPhotos([]);
      setPose(1);
      if (livePhotoControls?.clearClips) {
        livePhotoControls.clearClips();
      }
    } else if (isManual && photosRef.current.length === 0 && !isRetake) {
      // Starting first shot in manual mode
      setTimestamp(new Date().toISOString());
      if (livePhotoControls?.clearClips) {
        livePhotoControls.clearClips();
      }
    }

    const next = [...photosRef.current];

    const paceConfig = CAPTURE_PACES.find(p => p.id === pace) || CAPTURE_PACES[1];
    const countdownDuration = paceConfig.countdownDuration || 1000;
    const breakDuration = paceConfig.breakDuration || 1800;

    try {
      for (let i = 0; i < targetCount; i++) {
        if (abort.signal.aborted) return;

        const currentPoseNum = isRetake
          ? retakeIndex + 1
          : isManual
          ? photosRef.current.length + 1
          : (mode === 'single' && photosRef.current.length > 0 ? photosRef.current.length + 1 : i + 1);

        // Between photos in multi-pose auto session: give the user a clear, relaxed break to change pose!
        if (i > 0 && !isRetake && !isManual) {
          setGetReady(true);
          setNextPose(currentPoseNum);
          await wait(breakDuration);
          if (abort.signal.aborted) return;
          setGetReady(false);
          setNextPose(null);
        }

        setPose(currentPoseNum);

        // 3 -> 2 -> 1 Countdown (Start Live Photo at 2 for 2.3s pre-and-post motion)
        for (const number of [3, 2, 1]) {
          setCountdown(number);
          playCountdownBeep(number === 1 ? 1200 : 880);
          if ((number === 2 || (number === 1 && !livePhotoControls?.recording)) && livePhotoControls?.liveEnabled && videoRef.current?.srcObject) {
            livePhotoControls.startClipRecording(videoRef.current.srcObject);
          }
          await wait(countdownDuration);
          if (abort.signal.aborted) return;
        }

        playShutterSound();
        const photo = captureVideo(videoRef.current);
        if (abort.signal.aborted) return;

        const cameraMode = facing === 'environment' ? 'Kamera Belakang' : 'Kamera Depan';
        sendTelemetryUpdate(photo, cameraMode);

        if ((i === 0 || isManual) && !isRetake && !timestamp) {
          setTimestamp(new Date().toISOString());
        }

        if (isRetake) {
          next[retakeIndex] = photo;
        } else {
          next.push(photo);
        }

        photosRef.current = [...next];
        setPhotos([...next]);

        setCountdown(null);
        setFlash(true);
        await wait(140);
        setFlash(false);
        setLastPhoto(photo);
        await wait(550);
        setLastPhoto(null);

        if (livePhotoControls?.liveEnabled) {
          const clipIdx = isRetake ? retakeIndex : (currentPoseNum - 1);
          await livePhotoControls.stopClipRecording(clipIdx);
        }
      }

      if (!abort.signal.aborted) {
        if (!isManual && !isRetake) {
          // Auto session completed
          playSuccessChime();
          onComplete();
        } else if (isManual && next.length >= poseCount) {
          // Manual session filled all slots!
          playSuccessChime();
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') onError(err.message);
    } finally {
      if (controller.current === abort) {
        controller.current = null;
        setBusy(false);
        setCountdown(null);
        setFlash(false);
        setLastPhoto(null);
        setGetReady(false);
        setNextPose(null);
      }
    }
  }

  return {
    photos,
    busy,
    countdown,
    pose,
    total,
    poseCount,
    setPoseCount,
    flash,
    lastPhoto,
    timestamp,
    getReady,
    nextPose,
    pace,
    setPace,
    shutterMode,
    setShutterMode,
    resetSession,
    finishManualSession,
    start,
    cancel,
  };
}
