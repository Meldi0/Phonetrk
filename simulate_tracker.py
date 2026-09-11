"""
Skrip simulasi pergerakan HP untuk menguji dashboard secara real-time.
Jalankan di terminal:
    python simulate_tracker.py
"""
import base64
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
import urllib.request
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

TOKEN = os.getenv("TRACKER_TOKEN", "R-3sKN6rx2dNu5jFvU2Q4R8U76_x807r8YYVMqKYvJc")
PORT = os.getenv("PORT", "5001")
API_URL = f"http://127.0.0.1:{PORT}/api/location"

# Simulasi lintasan rute jalan kaki di sekitar Monas Jakarta
WAYPOINTS = [
    (-6.175392, 106.827153, 90.0),   # Monas Pusat
    (-6.175600, 106.827400, 120.0),  # Menuju tenggara
    (-6.176100, 106.827800, 135.0),  # Sudut tenggara Monas
    (-6.176800, 106.827500, 180.0),  # Menuju selatan
    (-6.177500, 106.827150, 200.0),  # Medan Merdeka Selatan
    (-6.178200, 106.826800, 220.0),  # Dekat patung kuda
    (-6.178900, 106.826500, 210.0),  # Arah Jalan Thamrin
]

# Contoh foto visual sederhana (1x1 pixel PNG)
DUMMY_PHOTO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

def send_location(lat, lon, heading, battery, speed, include_photo=False):
    payload = {
        "latitude": round(lat, 6),
        "longitude": round(lon, 6),
        "accuracy": 8.0,
        "altitude": 15.0,
        "speed": speed,
        "heading": heading,
        "battery": battery,
        "device_time": datetime.now(timezone.utc).isoformat(),
    }
    if include_photo:
        payload["photo"] = DUMMY_PHOTO

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TOKEN}"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            return True, res_body
    except Exception as e:
        return False, str(e)

def main():
    print(f"==================================================")
    print(f"  SIMULATOR PELACAK LOKASI HP (Web Phone Tracker)")
    print(f"==================================================")
    print(f"Target API : {API_URL}")
    print(f"Token      : {TOKEN[:8]}...{TOKEN[-6:]}")
    print(f"Buka Dashboard Anda di browser: http://127.0.0.1:{PORT}/dashboard")
    print(f"Mulai simulasi pengiriman data lintasan (interval 3 detik)...\n")

    battery = 92
    for i, (lat, lon, heading) in enumerate(WAYPOINTS, 1):
        speed = 1.4  # ~5 km/jam (jalan kaki)
        include_photo = (i == 1 or i == 4)  # Kirim foto di titik awal & tengah
        
        ok, res = send_location(lat, lon, heading, battery, speed, include_photo)
        if ok:
            photo_info = " [+Foto Verifikasi]" if include_photo else ""
            print(f"[{i}/{len(WAYPOINTS)}] Titik terkirim: Lat={lat:.6f}, Lon={lon:.6f}, Baterai={battery}%{photo_info}")
        else:
            print(f"[{i}/{len(WAYPOINTS)}] GAGAL mengirim: {res}")
        
        battery -= 1
        if i < len(WAYPOINTS):
            time.sleep(3)

    print("\nSimulasi selesai! Buka http://127.0.0.1:5001/dashboard untuk melihat rute lintasan penuh.")

if __name__ == "__main__":
    main()
