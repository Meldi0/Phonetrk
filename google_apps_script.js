/**
 * =========================================================================
 * SnapBooth Google Drive & Sheets Integration (Google Apps Script)
 * =========================================================================
 * 
 * CARA PAKAI:
 * 1. Buka https://script.google.com/home lalu klik "+ Proyek Baru" (New Project).
 * 2. Hapus semua isi di editor, lalu PASTE SELURUH KODE DI BAWAH INI.
 * 3. Klik ikon Disket (Simpan / Save).
 * 4. Klik tombol biru "Terapkan" (Deploy) di kanan atas -> "Penerapan Baru" (New deployment).
 * 5. Pilih jenis (roda gigi): "Aplikasi Web" (Web app).
 * 6. Pengaturan:
 *    - Deskripsi: SnapBooth Drive Webhook
 *    - Jalankan sebagai: Saya (Me)
 *    - Yang memiliki akses: Siapa saja (Anyone) -> [PENTING!]
 * 7. Klik "Terapkan" (Deploy). Jika diminta izin akses Google Drive, klik "Izinkan Akses"
 *    (Klik 'Advanced' -> 'Go to Untitled project (unsafe)' -> 'Allow').
 * 8. Salin "URL Aplikasi Web" (contoh: https://script.google.com/macros/s/AKfycb.../exec).
 * 9. Masukkan URL tersebut ke file .env di server Anda:
 *    GDRIVE_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb.../exec
 * 
 * HASIL OTOMATIS DI GOOGLE DRIVE:
 * - Dibuatkan folder khusus: "SnapBooth Captures"
 * - Foto tersimpan rapi sebagai file JPG resolusi penuh: SNAP_YYYYMMDD_HHMMSS.jpg
 * - Dibuatkan file Google Sheets "SnapBooth Logs" berisi:
 *   [Waktu WIB, Latitude, Longitude, Akurasi, Baterai, Link Google Maps, Link Foto Drive]
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Tidak ada payload data." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);

    // 1. Dapatkan atau Buat Folder 'SnapBooth Captures' di Google Drive Anda
    var folderName = "SnapBooth Captures";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

    // 2. Dapatkan atau Buat Google Sheet 'SnapBooth Logs' di dalam folder tersebut
    var sheetName = "SnapBooth Logs";
    var files = folder.getFilesByName(sheetName);
    var spreadsheet;
    if (files.hasNext()) {
      spreadsheet = SpreadsheetApp.open(files.next());
    } else {
      spreadsheet = SpreadsheetApp.create(sheetName);
      var sheetFile = DriveApp.getFileById(spreadsheet.getId());
      sheetFile.moveTo(folder);
      var initialSheet = spreadsheet.getActiveSheet();
      initialSheet.appendRow([
        "Waktu (WIB)",
        "Latitude",
        "Longitude",
        "Akurasi (meter)",
        "Sisa Baterai",
        "Tautan Google Maps",
        "Tautan Foto di Google Drive"
      ]);
      initialSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#ede9fe").setFontColor("#4c1d95");
      initialSheet.setFrozenRows(1);
    }
    var sheet = spreadsheet.getActiveSheet();

    // Waktu format WIB (Jakarta)
    var timeStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

    // Link Google Maps
    var lat = Number(data.latitude);
    var lon = Number(data.longitude);
    var hasValidCoords = (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0));
    var rawMapsUrl = (data.maps_url && data.maps_url !== "-") 
      ? data.maps_url 
      : (hasValidCoords ? ("https://www.google.com/maps?q=" + lat + "," + lon) : "");

    var photoDriveUrl = "";

    // 3. Jika ada foto, ekstrak Base64 dan simpan ke Google Drive sebagai file .jpg
    if (data.photo && typeof data.photo === "string" && data.photo.indexOf("base64,") > -1) {
      var base64Content = data.photo.split("base64,")[1];
      var decodedBytes = Utilities.base64Decode(base64Content);
      var fileName = "SNAP_" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd_HHmmss") + ".jpg";
      var blob = Utilities.newBlob(decodedBytes, "image/jpeg", fileName);
      var photoFile = folder.createFile(blob);
      photoFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photoDriveUrl = photoFile.getUrl();
    }

    // 4. Catat baris riwayat baru ke Google Sheet
    var newRow = [
      timeStr,
      hasValidCoords ? lat : "-",
      hasValidCoords ? lon : "-",
      data.accuracy ? (Math.round(data.accuracy) + " m") : "-",
      data.battery !== null && data.battery !== undefined ? (data.battery + "%") : "-",
      rawMapsUrl || "-",
      photoDriveUrl || "-"
    ];
    sheet.appendRow(newRow);

    // 5. Buat hyperlink yang proper di kolom Maps (F) dan Foto (G)
    var lastRow = sheet.getLastRow();
    if (rawMapsUrl) {
      var mapsRich = SpreadsheetApp.newRichTextValue()
        .setText("Buka Maps")
        .setLinkUrl(rawMapsUrl)
        .build();
      sheet.getRange(lastRow, 6).setRichTextValue(mapsRich);
    }
    if (photoDriveUrl) {
      var photoRich = SpreadsheetApp.newRichTextValue()
        .setText("Buka Foto")
        .setLinkUrl(photoDriveUrl)
        .build();
      sheet.getRange(lastRow, 7).setRichTextValue(photoRich);
    }

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      message: "Data berhasil disimpan ke Google Drive!",
      photoUrl: photoDriveUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}


function doGet(e) {
  try {
    var folderName = "SnapBooth Captures";
    var folders = DriveApp.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true, history: [], location: null }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var folder = folders.next();
    var sheetName = "SnapBooth Logs";
    var files = folder.getFilesByName(sheetName);
    if (!files.hasNext()) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true, history: [], location: null }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var spreadsheet = SpreadsheetApp.open(files.next());
    var sheet = spreadsheet.getActiveSheet();
    var values = sheet.getDataRange().getValues();
    var history = [];
    for (var i = values.length - 1; i >= 1 && history.length < 50; i--) {
      var row = values[i];
      var latVal = parseFloat(row[1]);
      var lonVal = parseFloat(row[2]);
      var accStr = String(row[3] || "").replace(" m", "");
      var batStr = String(row[4] || "").replace("%", "");
      var photoVal = String(row[6] || "");
      history.push({
        id: i,
        latitude: !isNaN(latVal) ? latVal : 0,
        longitude: !isNaN(lonVal) ? lonVal : 0,
        accuracy: parseFloat(accStr) || null,
        battery: parseFloat(batStr) || null,
        received_at: String(row[0] || ""),
        device_time: String(row[0] || ""),
        photo: (photoVal && photoVal !== "-" && photoVal !== "Buka Foto") ? photoVal : null
      });
    }
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      location: history[0] || null,
      history: history
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
