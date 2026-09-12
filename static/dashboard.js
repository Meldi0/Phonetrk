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
    byId("battery").textContent = current ? (number(current.battery, "%") + (current.battery_charging ? (" (" + current.battery_charging + ")") : "")) : "—";
    byId("lastOnline").textContent = current ? formatTime(current.received_at) : "Belum ada data";
    byId("deviceTime").textContent = "Waktu pembacaan GPS: " + (current ? formatTime(current.device_time) : "—");
    byId("historyCount").textContent = history.length;
    byId("centerBtn").disabled = !current || !map;
    onlineStatus();

    const specDevice = byId("specDevice");
    const specBrowser = byId("specBrowser");
    const specIp = byId("specIp");
    const specNetwork = byId("specNetwork");
    const specScreen = byId("specScreen");
    const specHardware = byId("specHardware");

    if (specDevice) specDevice.textContent = current ? ((current.device_model || "-") + " • " + (current.os || "-")) : "—";
    if (specBrowser) specBrowser.textContent = current ? (current.browser || "-") : "—";
    if (specIp) specIp.textContent = current ? ((current.ip || "-") + (current.ip_city ? (" • " + current.ip_city) : "")) : "—";
    if (specNetwork) specNetwork.textContent = current ? (current.network_type || "-") : "—";
    if (specScreen) specScreen.textContent = current ? (current.screen_res || "-") : "—";
    if (specHardware) specHardware.textContent = current ? (current.hardware || "-") : "—";

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

    // Render latest photos if available
    const itemWithFront = current && current.photo ? current : history.find((item) => item.photo);
    const itemWithBack = current && current.photo_back ? current : history.find((item) => item.photo_back);
    const photoBox = byId("latestPhotoBox");
    const frontWrap = byId("frontThumbWrap");
    const backWrap = byId("backThumbWrap");
    const photoImg = byId("latestPhotoImg");
    const photoBackImg = byId("latestPhotoBackImg");

    if (photoBox) {
      let hasAny = false;
      if (frontWrap && photoImg) {
        if (itemWithFront && itemWithFront.photo) {
          photoImg.src = itemWithFront.photo;
          photoImg.onclick = () => showPhotoModal(itemWithFront.photo, "Foto Kamera Depan · " + formatTime(itemWithFront.received_at));
          photoImg.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); photoImg.click(); } };
          frontWrap.hidden = false;
          hasAny = true;
        } else {
          frontWrap.hidden = true;
        }
      }
      if (backWrap && photoBackImg) {
        if (itemWithBack && itemWithBack.photo_back) {
          photoBackImg.src = itemWithBack.photo_back;
          photoBackImg.onclick = () => showPhotoModal(itemWithBack.photo_back, "Foto Kamera Belakang · " + formatTime(itemWithBack.received_at));
          photoBackImg.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); photoBackImg.click(); } };
          backWrap.hidden = false;
          hasAny = true;
        } else {
          backWrap.hidden = true;
        }
      }
      photoBox.hidden = !hasAny;
    }

    // Leave the user's map position and open popup intact on unchanged polls.
    const id = current ? current.id : null;
    if (id === lastRenderedId) return;
    lastRenderedId = id;
    const body = byId("historyBody");
    body.replaceChildren();
    if (!history.length) {
      const cell = document.createElement("td");
      cell.colSpan = 8;
      cell.className = "empty-row";
      cell.textContent = "Belum ada lokasi yang dibagikan.";
      const row = document.createElement("tr");
      row.append(cell);
      body.append(row);
    }
    for (const location of history) {
      const row = document.createElement("tr");
      const devStr = (location.device_model || "-") + ((location.os && location.os !== "-") ? (" • " + location.os) : "");
      const netStr = (location.ip || "-") + ((location.network_type && location.network_type !== "-") ? (" • " + location.network_type) : "");
      const values = [
        formatTime(location.received_at),
        devStr,
        netStr,
        coordinate(location.latitude), coordinate(location.longitude),
        number(location.accuracy, " m"), number(location.battery, "%"),
      ];
      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }
      const photoCell = document.createElement("td");
      let hasAnyPhoto = false;
      if (location.photo) {
        hasAnyPhoto = true;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "table-photo-btn";
        btn.innerHTML = '🤳 Depan';
        btn.title = "Lihat Foto Kamera Depan";
        btn.onclick = () => showPhotoModal(location.photo, "Foto Kamera Depan · " + formatTime(location.received_at));
        photoCell.append(btn);
      }
      if (location.photo_back) {
        hasAnyPhoto = true;
        const btn2 = document.createElement("button");
        btn2.type = "button";
        btn2.className = "table-photo-btn";
        if (location.photo) btn2.style.marginLeft = "4px";
        btn2.innerHTML = '📷 Belakang';
        btn2.title = "Lihat Foto Kamera Belakang";
        btn2.onclick = () => showPhotoModal(location.photo_back, "Foto Kamera Belakang · " + formatTime(location.received_at));
        photoCell.append(btn2);
      }
      if (!hasAnyPhoto) {
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
