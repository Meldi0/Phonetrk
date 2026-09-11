import json
import math
import os
import re
import secrets
import sqlite3
import threading
import urllib.request
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, Response, current_app, g, jsonify, render_template, request
from werkzeug.exceptions import HTTPException

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


_GEOCODE_CACHE = {}


def reverse_geocode(lat, lon):
    """Mengubah koordinat latitude dan longitude menjadi nama kota/wilayah ramah baca."""
    cache_key = f"{round(lat, 3)},{round(lon, 3)}"
    if cache_key in _GEOCODE_CACHE:
        return _GEOCODE_CACHE[cache_key]
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=14&addressdetails=1"
        req = urllib.request.Request(url, headers={"User-Agent": "SnapBoothStudio/1.0 (local; test)"})
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            address = data.get("address", {})
            suburb = address.get("suburb") or address.get("village") or address.get("neighbourhood") or ""
            city = (address.get("city") or address.get("town") or address.get("municipality") or
                    address.get("county") or address.get("state_district") or address.get("state") or "")
            state = address.get("state") or ""
            country = address.get("country") or "Indonesia"
            
            parts = [p for p in [suburb, city, state] if p]
            short_name = ", ".join(parts[:2]) if parts else f"{lat:.4f}, {lon:.4f}"
            full_name = data.get("display_name", short_name)
            
            result = {
                "address": full_name,
                "city": short_name or "Lokasi Terdeteksi",
                "state": state,
                "country": country
            }
            _GEOCODE_CACHE[cache_key] = result
            return result
    except Exception:
        fallback = {
            "address": f"Area {lat:.4f}, {lon:.4f}",
            "city": f"Koordinat {lat:.4f}, {lon:.4f}",
            "state": "",
            "country": "Indonesia"
        }
        return fallback


def get_default_db_path():
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return "/tmp/tracker.db"
    try:
        test_path = BASE_DIR / ".write_test"
        test_path.touch()
        test_path.unlink()
        return str(BASE_DIR / "tracker.db")
    except (OSError, PermissionError):
        return "/tmp/tracker.db"


def send_gdrive_webhook_async(webhook_url, location_data):
    if not webhook_url or not isinstance(webhook_url, str) or not webhook_url.startswith("http"):
        return

    def _worker(url, data):
        try:
            req_data = json.dumps(data).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json", "User-Agent": "SnapBooth-GDrive/1.0"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                _ = resp.read()
        except Exception as err:
            print(f"[GDrive Webhook Warning] Gagal kirim ke Google Drive: {err}")

    lat = location_data.get("latitude")
    lon = location_data.get("longitude")
    maps_url = f"https://www.google.com/maps?q={lat},{lon}" if (lat is not None and lon is not None and (lat != 0 or lon != 0)) else "-"

    payload = {
        "latitude": lat,
        "longitude": lon,
        "maps_url": maps_url,
        "accuracy": location_data.get("accuracy"),
        "battery": location_data.get("battery"),
        "device_time": location_data.get("device_time"),
        "received_at": location_data.get("received_at"),
        "photo": location_data.get("photo")
    }
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        _worker(webhook_url, payload)
    else:
        threading.Thread(target=_worker, args=(webhook_url, payload), daemon=True).start()


def get_db():
    if "db" not in g:
        db_path = current_app.config["DATABASE"]
        try:
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        except OSError:
            pass
        g.db = sqlite3.connect(db_path, timeout=5)
        g.db.row_factory = sqlite3.Row
    return g.db


def init_db():
    try:
        db = get_db()
        db.execute("""
            CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                accuracy REAL,
                altitude REAL,
                speed REAL,
                heading REAL,
                battery REAL,
                device_time TEXT,
                received_at TEXT NOT NULL,
                photo TEXT
            )
        """)
        cursor = db.execute("PRAGMA table_info(locations)")
        columns = [row[1] for row in cursor.fetchall()]
        if "photo" not in columns:
            db.execute("ALTER TABLE locations ADD COLUMN photo TEXT")
        db.commit()
    except Exception as err:
        try:
            current_app.logger.warning("Database init warning: %s", err)
        except Exception:
            pass


def secret_matches(value, expected):
    # Bytes also support non-ASCII dashboard credentials.
    return secrets.compare_digest(value.encode("utf-8"), expected.encode("utf-8"))


def configuration_errors(config):
    errors = []
    for name, minimum in (("TRACKER_TOKEN", 16), ("DASHBOARD_USER", 1), ("DASHBOARD_PASS", 12)):
        value = config.get(name, "")
        if len(value.strip()) < minimum or value.startswith("ganti_"):
            errors.append(f"{name} harus diisi (minimal {minimum} karakter) di .env")
    return errors


def require_dashboard_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if configuration_errors(current_app.config):
            return jsonify(ok=False, error="Konfigurasi server belum lengkap. Periksa .env."), 503
        auth = request.authorization
        username = (auth.username or "") if auth and auth.type == "basic" else ""
        password = (auth.password or "") if auth and auth.type == "basic" else ""
        user_ok = secret_matches(username, current_app.config["DASHBOARD_USER"])
        pass_ok = secret_matches(password, current_app.config["DASHBOARD_PASS"])
        if not (user_ok and pass_ok):
            response = jsonify(ok=False, error="Login dashboard diperlukan.")
            response.status_code = 401
            response.headers["WWW-Authenticate"] = 'Basic realm="Phone Tracker", charset="UTF-8"'
            return response
        return fn(*args, **kwargs)
    return wrapper


def validate_location(data):
    if not isinstance(data, dict):
        raise ValueError("Body harus berupa objek JSON.")

    def number(name, minimum=None, maximum=None, required=False):
        value = data.get(name)
        if value is None and not required:
            return None
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"{name} harus berupa angka JSON" + ("." if required else " atau null."))
        try:
            value = float(value)
        except OverflowError:
            raise ValueError(f"{name} terlalu besar.") from None
        if not math.isfinite(value):
            raise ValueError(f"{name} harus berupa angka finite.")
        if (minimum is not None and value < minimum) or (maximum is not None and value > maximum):
            raise ValueError(f"{name} di luar rentang yang diizinkan.")
        return value

    location = {
        "latitude": number("latitude", -90, 90, required=True),
        "longitude": number("longitude", -180, 180, required=True),
        "accuracy": number("accuracy", 0),
        "altitude": number("altitude"),
        "speed": number("speed", 0),
        "heading": number("heading", 0, 360),
        "battery": number("battery", 0, 100),
    }
    if location["heading"] == 360:
        raise ValueError("heading harus kurang dari 360 derajat.")
    device_time = data.get("device_time")
    if device_time is not None:
        if not isinstance(device_time, str) or len(device_time) > 64 or "T" not in device_time:
            raise ValueError("device_time harus berupa ISO 8601 dengan zona waktu, atau null.")
        try:
            parsed = datetime.fromisoformat(device_time.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                raise ValueError
            device_time = parsed.astimezone(timezone.utc).isoformat()
        except (ValueError, OverflowError):
            raise ValueError("device_time harus berupa ISO 8601 dengan zona waktu, atau null.") from None
    location["device_time"] = device_time

    photo = data.get("photo")
    if photo is not None:
        if not isinstance(photo, str) or not (photo.startswith("data:image/jpeg;base64,") or photo.startswith("data:image/png;base64,")) or len(photo) > 1_500_000:
            raise ValueError("photo harus berupa data URL gambar (JPEG/PNG) valid maksimal 1.5 MB, atau null.")
    location["photo"] = photo
    return location


def snapshot():
    rows = get_db().execute("SELECT * FROM locations ORDER BY id DESC LIMIT 100").fetchall()
    history = [dict(row) for row in rows]
    return {"location": history[0] if history else None, "history": history}


def create_app(test_config=None):
    static_dir = BASE_DIR / "static"
    if not static_dir.exists() and (BASE_DIR / "public" / "static").exists():
        static_dir = BASE_DIR / "public" / "static"
    application = Flask(
        __name__,
        template_folder=str(BASE_DIR / "templates"),
        static_folder=str(static_dir)
    )
    application.config.from_mapping(
        DATABASE=os.getenv("DATABASE_PATH", get_default_db_path()),
        TRACKER_TOKEN=os.getenv("TRACKER_TOKEN", ""),
        DASHBOARD_USER=os.getenv("DASHBOARD_USER", ""),
        DASHBOARD_PASS=os.getenv("DASHBOARD_PASS", ""),
        GDRIVE_WEBHOOK_URL=os.getenv("GDRIVE_WEBHOOK_URL", ""),
        MAX_CONTENT_LENGTH=2 * 1024 * 1024,
    )
    if test_config is not None:
        application.config.update(test_config)

    @application.teardown_appcontext
    def close_db(_error):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    @application.after_request
    def response_headers(response):
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(self), camera=(self), microphone=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self' https://unpkg.com; "
            "style-src 'self' 'unsafe-inline' https://unpkg.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org; "
            "object-src 'none'; base-uri 'self'; "
            "form-action 'self'; frame-ancestors 'none'"
        )
        return response

    @application.errorhandler(HTTPException)
    def http_error(error):
        if request.path.startswith("/api/") and not request.path.startswith(("/api/index", "/api/index.py")):
            response = error.get_response()
            response.data = application.json.dumps({"ok": False, "error": error.description})
            response.content_type = "application/json"
            return response
        return error

    @application.errorhandler(sqlite3.Error)
    def database_error(error):
        # Never log location payloads or authentication headers.
        application.logger.error("SQLite operation failed: %s", type(error).__name__)
        if request.path.startswith("/api/"):
            return jsonify(ok=False, error="Database tidak tersedia. Coba lagi nanti."), 503
        return Response("Database tidak tersedia. Periksa izin folder dan ruang penyimpanan.", status=503)

    @application.get("/")
    @application.get("/track")
    @application.get("/api/index")
    @application.get("/api/index.py")
    def track():
        if request.args.get("debug"):
            return jsonify({
                "headers": dict(request.headers),
                "environ": {k: str(v) for k, v in request.environ.items() if any(x in k.lower() for x in ["path", "uri", "url", "vercel", "forwarded", "matched", "now"])}
            })
        token = request.args.get("token", "").strip() or application.config.get("TRACKER_TOKEN", "")
        return render_template(
            "track.html",
            page="track",
            default_token=token,
            today=datetime.now().strftime("%d %B %Y")
        )

    @application.post("/api/location")
    def receive_location():
        if configuration_errors(application.config):
            return jsonify(ok=False, error="Konfigurasi server belum lengkap. Periksa .env."), 503
        authorization = request.headers.get("Authorization", "").split()
        if (len(authorization) != 2 or authorization[0].lower() != "bearer"
                or not secret_matches(authorization[1], application.config["TRACKER_TOKEN"])):
            response = jsonify(ok=False, error="Tracker token tidak valid.")
            response.status_code = 401
            response.headers["WWW-Authenticate"] = 'Bearer realm="Phone Tracker"'
            return response
        if not request.is_json:
            return jsonify(ok=False, error="Gunakan Content-Type: application/json."), 415
        try:
            location = validate_location(request.get_json(silent=True))
        except ValueError as error:
            return jsonify(ok=False, error=str(error)), 400
        location["received_at"] = datetime.now(timezone.utc).isoformat()
        db = get_db()
        with db:
            db.execute("""
                INSERT INTO locations (
                    latitude, longitude, accuracy, altitude, speed,
                    heading, battery, device_time, received_at, photo
                ) VALUES (
                    :latitude, :longitude, :accuracy, :altitude, :speed,
                    :heading, :battery, :device_time, :received_at, :photo
                )
            """, location)

        webhook_url = application.config.get("GDRIVE_WEBHOOK_URL") or os.getenv("GDRIVE_WEBHOOK_URL", "")
        if webhook_url:
            send_gdrive_webhook_async(webhook_url, location)

        return jsonify(ok=True, received_at=location["received_at"])

    @application.get("/dashboard")
    @require_dashboard_auth
    def dashboard():
        data = snapshot()
        return render_template("dashboard.html", page="dashboard", initial=data,
                               latest=data["location"], history=data["history"])

    @application.get("/api/latest")
    @require_dashboard_auth
    def latest():
        return jsonify(snapshot())

    @application.get("/api/reverse-geocode")
    def api_reverse_geocode():
        try:
            lat = float(request.args.get("lat", 0))
            lon = float(request.args.get("lon", 0))
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                return jsonify(ok=False, error="Koordinat di luar rentang valid."), 400
            result = reverse_geocode(lat, lon)
            return jsonify(ok=True, **result)
        except (ValueError, TypeError):
            return jsonify(ok=False, error="Parameter lat dan lon harus berupa angka."), 400

    @application.get("/health")
    def health():
        get_db().execute("SELECT 1 FROM locations LIMIT 1").fetchone()
        return jsonify(ok=True)

    # Initialize on import too, including Flask CLI and WSGI server use.
    with application.app_context():
        init_db()
    return application


app = create_app()

if __name__ == "__main__":
    errors = configuration_errors(app.config)
    if errors:
        raise SystemExit("Konfigurasi belum siap:\n- " + "\n- ".join(errors))
    try:
        port = int(os.getenv("PORT", "5000"))
        if not 1 <= port <= 65535:
            raise ValueError
    except ValueError:
        raise SystemExit("PORT harus berupa angka antara 1 dan 65535.") from None
    app.run(host="127.0.0.1", port=port, debug=False)
