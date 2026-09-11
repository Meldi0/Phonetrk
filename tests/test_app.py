"""Run: python -m unittest discover -s tests -v (isolated temporary databases)."""

import base64
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path

from app import create_app


class TrackerApiTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.db_path = str(Path(self.temp.name) / "tracker.db")
        self.config = {
            "TESTING": True, "DATABASE": self.db_path,
            "TRACKER_TOKEN": "test-only-token-12345678901234567890",
            "DASHBOARD_USER": "test-admin", "DASHBOARD_PASS": "test-only-password-1234",
        }
        self.app = create_app(self.config)
        self.client = self.app.test_client()
        self.bearer = {"Authorization": "Bearer " + self.config["TRACKER_TOKEN"]}
        self.basic = self.basic_header(self.config["DASHBOARD_USER"], self.config["DASHBOARD_PASS"])
        self.location = {
            "latitude": -6.123456, "longitude": 107.123456, "accuracy": 10,
            "altitude": None, "speed": None, "heading": None, "battery": 80,
            "device_time": "2026-09-11T12:00:00Z",
        }

    @staticmethod
    def basic_header(user, password):
        value = base64.b64encode(f"{user}:{password}".encode()).decode()
        return {"Authorization": "Basic " + value}

    def post(self, data):
        return self.client.post("/api/location", json=data, headers=self.bearer)

    def test_initialization_and_empty_snapshot(self):
        with closing(sqlite3.connect(self.db_path)) as db:
            columns = {row[1] for row in db.execute("PRAGMA table_info(locations)")}
        self.assertTrue({"id", "received_at", *self.location}.issubset(columns))
        response = self.client.get("/api/latest", headers=self.basic)
        self.assertEqual(response.json, {"location": None, "history": []})
        self.assertEqual(self.client.get("/health").json, {"ok": True})

    def test_pages_and_assets(self):
        for path in ("/", "/track", "/static/app.css", "/static/track.js", "/static/dashboard.js", "/static/favicon.svg"):
            with self.subTest(path=path):
                with self.client.get(path) as response:
                    self.assertEqual(response.status_code, 200)
        html = self.client.get("/dashboard", headers=self.basic)
        self.assertEqual(html.status_code, 200)
        self.assertIn(b'id="map"', html.data)
        self.assertNotIn(self.config["TRACKER_TOKEN"].encode(), html.data)

    def test_token_is_required_before_parsing_body(self):
        for header in (None, "Bearer invalid", "Basic bad", "Bearer", "Bearer token extra"):
            headers = {} if header is None else {"Authorization": header}
            response = self.client.post("/api/location", data="not-json", headers=headers)
            self.assertEqual(response.status_code, 401)
        self.assertEqual(self.client.get("/api/latest", headers=self.basic).json["history"], [])

    def test_dashboard_and_latest_require_dashboard_credentials(self):
        for path in ("/dashboard", "/api/latest"):
            for headers in ({}, self.bearer, self.basic_header("wrong", "wrong")):
                response = self.client.get(path, headers=headers)
                self.assertEqual(response.status_code, 401)
                self.assertIn("Basic", response.headers["WWW-Authenticate"])
            self.assertEqual(self.client.get(path, headers=self.basic).status_code, 200)

    def test_unicode_credentials(self):
        self.app.config.update(DASHBOARD_USER="pemilik-é", DASHBOARD_PASS="sandi-é-123456789")
        self.assertEqual(self.client.get("/api/latest", headers=self.basic_header("pemilik-é", "sandi-é-123456789")).status_code, 200)

    def test_insert_and_server_timestamp(self):
        before = datetime.now(timezone.utc)
        response = self.post(self.location)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["ok"])
        received = datetime.fromisoformat(response.json["received_at"])
        self.assertGreaterEqual(received, before)
        self.assertLessEqual(received, datetime.now(timezone.utc))
        snapshot = self.client.get("/api/latest", headers=self.basic).json
        self.assertEqual(snapshot["location"], snapshot["history"][0])
        self.assertEqual(snapshot["location"]["latitude"], self.location["latitude"])
        self.assertEqual(snapshot["location"]["device_time"], "2026-09-11T12:00:00+00:00")
        self.assertEqual(snapshot["location"]["received_at"], response.json["received_at"])

    def test_zero_values_and_nullable_optionals(self):
        data = dict.fromkeys(self.location, 0)
        data["device_time"] = None
        self.assertEqual(self.post(data).status_code, 200)
        latest = self.client.get("/api/latest", headers=self.basic).json["location"]
        self.assertEqual(latest["battery"], 0)
        self.assertEqual(latest["accuracy"], 0)
        self.assertEqual(self.post({"latitude": 90, "longitude": -180}).status_code, 200)

    def test_invalid_coordinates_are_rejected_without_writes(self):
        for field, invalids in {
            "latitude": [None, True, "1.5", [], {}, 90.1, -90.1, float("nan"), float("inf"), 10**400],
            "longitude": [None, False, "100", [], {}, 180.1, -180.1, float("-inf")],
        }.items():
            for value in invalids:
                with self.subTest(field=field, value=str(value)):
                    self.assertEqual(self.post({**self.location, field: value}).status_code, 400)
        self.assertEqual(self.client.get("/api/latest", headers=self.basic).json["history"], [])

    def test_invalid_optional_fields(self):
        for field, values in {
            "accuracy": [-1, {}, True, float("nan")], "altitude": [[], "1"],
            "speed": [-1, "2"], "heading": [-1, 360, float("inf")],
            "battery": [-1, 101, {}, "80"],
            "device_time": [123, {}, "yesterday", "2026-09-11", "2026-09-11T12:00:00", "x" * 65],
        }.items():
            for value in values:
                with self.subTest(field=field, value=str(value)):
                    self.assertEqual(self.post({**self.location, field: value}).status_code, 400)

    def test_content_types_and_json_shape(self):
        for payload in ("null", "[]", "true", '"text"', "1", "{}", "{broken"):
            response = self.client.post("/api/location", data=payload, headers=self.bearer, content_type="application/json")
            self.assertEqual(response.status_code, 400)
        self.assertEqual(self.client.post("/api/location", data=json.dumps(self.location), headers=self.bearer).status_code, 415)

    def test_payload_size_and_methods(self):
        response = self.client.post("/api/location", json={**self.location, "extra": "x" * (2500 * 1024)}, headers=self.bearer)
        self.assertEqual(response.status_code, 413)
        self.assertFalse(response.json["ok"])
        self.assertEqual(self.client.get("/api/location").status_code, 405)
        self.assertFalse(self.client.get("/api/missing").json["ok"])

    def test_photo_upload_and_validation(self):
        dummy_photo = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
        response = self.post({**self.location, "photo": dummy_photo})
        self.assertEqual(response.status_code, 200)
        latest = self.client.get("/api/latest", headers=self.basic).json["location"]
        self.assertEqual(latest["photo"], dummy_photo)

        # Invalid photo format
        self.assertEqual(self.post({**self.location, "photo": "not-a-data-url"}).status_code, 400)
        self.assertEqual(self.post({**self.location, "photo": 12345}).status_code, 400)

    def test_track_page_prefills_token(self):
        response = self.client.get("/track?token=custom-query-token-12345678")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"custom-query-token-12345678", response.data)

    def test_missing_configuration_fails_closed(self):
        self.app.config["TRACKER_TOKEN"] = ""
        self.assertEqual(self.post(self.location).status_code, 503)
        self.assertEqual(self.client.get("/api/latest", headers=self.basic).status_code, 503)

    def test_history_is_bounded_and_newest_first(self):
        for index in range(105):
            self.assertEqual(self.post({**self.location, "longitude": index}).status_code, 200)
        data = self.client.get("/api/latest", headers=self.basic).json
        self.assertEqual(len(data["history"]), 100)
        self.assertEqual(data["location"]["longitude"], 104)
        self.assertEqual(data["history"][-1]["longitude"], 5)
        with closing(sqlite3.connect(self.db_path)) as db:
            self.assertEqual(db.execute("SELECT count(*) FROM locations").fetchone()[0], 105)

    def test_restart_preserves_data(self):
        self.post(self.location)
        reopened = create_app(self.config).test_client()
        self.assertEqual(len(reopened.get("/api/latest", headers=self.basic).json["history"]), 1)

    def test_security_headers_and_no_cors(self):
        response = self.client.get("/dashboard", headers=self.basic)
        self.assertEqual(response.headers["Cache-Control"], "no-store")
        self.assertEqual(response.headers["X-Frame-Options"], "DENY")
        self.assertIn("geolocation=(self)", response.headers["Permissions-Policy"])
        self.assertIn("camera=(self)", response.headers["Permissions-Policy"])
        self.assertNotIn("Access-Control-Allow-Origin", response.headers)


if __name__ == "__main__":
    unittest.main()
