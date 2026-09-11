"use strict";

(() => {
  const byId = (id) => document.getElementById(id);
  const formatTime = (value) => {
    const date = new Date(value);
    return value && Number.isFinite(date.getTime()) ? date.toLocaleString("id-ID") : "—";
  };
  const number = (value, suffix = "") => Number.isFinite(value) ? value + suffix : "—";
  const coordinate = (value) => Number.isFinite(value) ? value.toFixed(6) : "—";
  let current = null;
  let map = null;
  let points = null;
  let lastRenderedId;
  let initialView = true;
  let polling = null;
  let pending = null;
  let authFailed = false;
  let stopped = false;
  let tileFailed = false;

  function mapMessage(message) {
    byId("mapNotice").textContent = message;
    byId("mapNotice").hidden = !message;
  }

  function setupMap() {
    if (!window.L) {
      mapMessage("Peta gagal dimuat. Periksa koneksi ke unpkg.com, lalu muat ulang. Data lokasi tetap tersedia di bawah.");
      return;
    }
    map = L.map("map").setView([-2.5, 118], 4);
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    tiles.on("tileerror", () => {
      tileFailed = true;
      mapMessage("Sebagian peta belum termuat. Periksa internet Anda; koordinat dan riwayat tetap tersedia.");
    });
    tiles.on("tileload", () => {
      if (tileFailed) {
        tileFailed = false;
        mapMessage(current ? "" : "Belum ada lokasi. Buka halaman Tracking di HP, lalu mulai berbagi lokasi.");
      }
    });
    points = L.layerGroup().addTo(map);
  }

  function onlineStatus() {
    const badge = byId("onlineBadge");
    if (!current) {
      badge.dataset.state = "idle";
      byId("onlineLabel").textContent = "Menunggu lokasi";
      return;
    }
    const age = Math.max(0, Date.now() - new Date(current.received_at).getTime());
    const fresh = age <= 60000;
    badge.dataset.state = fresh ? "active" : "waiting";
    byId("onlineLabel").textContent = fresh ? "Baru mengirim lokasi" : "Belum ada kiriman baru";
  }

  function render(data) {
    current = data.location;
    const history = data.history;
    byId("latitude").textContent = current ? coordinate(current.latitude) : "—";
    byId("longitude").textContent = current ? coordinate(current.longitude) : "—";
    byId("accuracy").textContent = current && current.accuracy !== null ? "±" + Math.round(current.accuracy) + " m" : "—";
    byId("battery").textContent = current ? number(current.battery, "%") : "—";
    byId("lastOnline").textContent = current ? formatTime(current.received_at) : "Belum ada data";
    byId("deviceTime").textContent = "Waktu pembacaan GPS: " + (current ? formatTime(current.device_time) : "—");
    byId("historyCount").textContent = history.length;
    byId("centerBtn").disabled = !current || !map;
    onlineStatus();

    // Update Google Maps button and Location summary
    const gmapBtn = byId("googleMapsBtn");
    const locText = byId("locationSummaryText");
    if (current && Number.isFinite(current.latitude) && Number.isFinite(current.longitude)) {
      if (gmapBtn) {
        gmapBtn.href = "https://www.google.com/maps?q=" + current.latitude + "," + current.longitude;
        if (gmapBtn.style) gmapBtn.style.display = "inline-flex";
      }
      if (locText) {
        locText.textContent = `${current.latitude.toFixed(5)}, ${current.longitude.toFixed(5)} (±${Math.round(current.accuracy || 0)}m)`;
        // In real browser, reverse-geocode to get friendly town/city name
        if (typeof window !== "undefined" && window.location && window.location.protocol && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
          void (async () => {
            try {
              const res = await fetch(`/api/reverse-geocode?lat=${current.latitude}&lon=${current.longitude}`);
              const d = await res.json();
              if (d.ok && d.city && locText) {
                locText.textContent = `${d.city} (±${Math.round(current.accuracy || 0)}m)`;
                locText.title = d.address || d.city;
              }
            } catch (_) {}
          })();
        }
      }
    } else {
      if (gmapBtn && gmapBtn.style) gmapBtn.style.display = "none";
      if (locText) locText.textContent = "Belum ada titik koordinat lokasi.";
    }

    // Render latest photo if available
    const latestWithPhoto = current && current.photo ? current : history.find((item) => item.photo);
    const photoBox = byId("latestPhotoBox");
    const photoImg = byId("latestPhotoImg");
    if (photoBox && photoImg) {
      if (latestWithPhoto && latestWithPhoto.photo) {
        photoImg.src = latestWithPhoto.photo;
        photoImg.onclick = () => showPhotoModal(latestWithPhoto.photo, "Foto diterima: " + formatTime(latestWithPhoto.received_at));
        photoImg.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); photoImg.click(); } };
        photoBox.hidden = false;
      } else {
        photoBox.hidden = true;
      }
    }

    // Leave the user's map position and open popup intact on unchanged polls.
    const id = current ? current.id : null;
    if (id === lastRenderedId) return;
    lastRenderedId = id;
    const body = byId("historyBody");
    body.replaceChildren();
    if (!history.length) {
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.className = "empty-row";
      cell.textContent = "Belum ada lokasi yang dibagikan.";
      const row = document.createElement("tr");
      row.append(cell);
      body.append(row);
    }
    for (const location of history) {
      const row = document.createElement("tr");
      const values = [
        formatTime(location.received_at), coordinate(location.latitude), coordinate(location.longitude),
        number(location.accuracy, " m"), number(location.battery, "%"),
      ];
      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }
      const photoCell = document.createElement("td");
      if (location.photo) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.innerHTML = '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Lihat Foto';
        if (!btn.textContent) btn.textContent = "Lihat Foto";
        btn.onclick = () => showPhotoModal(location.photo, "Foto diterima: " + formatTime(location.received_at));
        photoCell.append(btn);
      } else {
        photoCell.textContent = "—";
      }
      row.append(photoCell);
      body.append(row);
    }
    if (!map) return;
    points.clearLayers();
    if (!tileFailed) mapMessage(current ? "" : "Belum ada lokasi. Buka halaman Tracking di HP, lalu mulai berbagi lokasi.");
    if (!current) { initialView = true; return; }
    for (const location of history.slice(1)) {
      const popup = document.createElement("span");
      popup.textContent = "Lokasi sebelumnya · " + formatTime(location.received_at);
      L.circleMarker([location.latitude, location.longitude], {
        radius: 5, color: "#244b32", fillColor: "#8aaa8c", fillOpacity: .9, weight: 2,
      }).bindPopup(popup).addTo(points);
    }
    const latlng = [current.latitude, current.longitude];
    if (Number.isFinite(current.accuracy)) {
      L.circle(latlng, {
        radius: current.accuracy, color: "#5b872e", fillColor: "#b8ef65", fillOpacity: .12, weight: 1,
      }).addTo(points);
    }
    const popup = document.createElement("span");
    popup.textContent = "Lokasi terakhir · " + formatTime(current.received_at);
    L.marker(latlng, {
      icon: L.divIcon({ className: "location-pin", iconSize: [22, 22], iconAnchor: [11, 11] }),
      title: "Lokasi terakhir", alt: "Lokasi terakhir HP",
    }).bindPopup(popup).addTo(points);
    if (initialView) {
      const bounds = L.latLngBounds(history.map((location) => [location.latitude, location.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      initialView = false;
    }
  }

  async function refresh() {
    if (stopped || authFailed || pending) return;
    const controller = new AbortController();
    pending = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch("/api/latest", {
        credentials: "same-origin", cache: "no-store", signal: controller.signal,
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
      });
      if (response.status === 401) {
        authFailed = true;
        byId("refreshStatus").textContent = "Login berakhir. Muat ulang halaman untuk login kembali.";
        return;
      }
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (!Array.isArray(data.history) || !Object.hasOwn(data, "location")) throw new Error("Respons tidak valid");
      if (stopped) return;
      render(data);
      byId("refreshStatus").textContent = "Diperbarui " + new Date().toLocaleTimeString("id-ID") + " · otomatis setiap 12 detik";
    } catch (_) {
      if (!stopped) byId("refreshStatus").textContent = "Pembaruan gagal. Data terakhir tetap ditampilkan; mencoba kembali otomatis.";
    } finally {
      clearTimeout(timeout);
      if (pending === controller) pending = null;
      onlineStatus();
      if (!stopped && !authFailed) polling = setTimeout(refresh, 12000);
    }
  }

  const photoDialog = byId("photoDialog");
  const modalImg = byId("modalImg");
  const modalCaption = byId("modalCaption");
  const closeModalBtn = byId("closeModalBtn");

  function showPhotoModal(photoSrc, caption) {
    if (!photoDialog || !modalImg) return;
    modalImg.src = photoSrc;
    if (modalCaption) modalCaption.textContent = caption || "";
    if (typeof photoDialog.showModal === "function") {
      photoDialog.showModal();
    } else {
      photoDialog.setAttribute("open", "");
    }
  }

  if (closeModalBtn && photoDialog) {
    closeModalBtn.addEventListener("click", () => {
      if (typeof photoDialog.close === "function") {
        photoDialog.close();
      } else {
        photoDialog.removeAttribute("open");
      }
    });
    photoDialog.addEventListener("click", (e) => {
      if (e.target === photoDialog) {
        if (typeof photoDialog.close === "function") photoDialog.close();
        else photoDialog.removeAttribute("open");
      }
    });
  }

  setupMap();
  render(JSON.parse(byId("initialData").textContent));
  byId("centerBtn").addEventListener("click", () => {
    if (map && current) map.setView([current.latitude, current.longitude], 17);
  });
  polling = setTimeout(refresh, 12000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !stopped) {
      clearTimeout(polling);
      void refresh();
    }
  });
  window.addEventListener("pagehide", () => {
    stopped = true;
    clearTimeout(polling);
    if (pending) pending.abort();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      stopped = false;
      void refresh();
    }
  });
})();
