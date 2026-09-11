import sys
from pathlib import Path

# Add project root directory to sys.path so app can be imported
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from werkzeug.middleware.proxy_fix import ProxyFix
from app import app


class VercelPathMiddleware:
    """
    Ensures that rewritten URLs in Vercel preserve the original request path,
    and maps /api/index or /api/index.py back to / for root requests.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        # 1. Respect X-Forwarded-Uri from Vercel edge if present
        fwd_uri = environ.get("HTTP_X_FORWARDED_URI")
        if fwd_uri:
            environ["PATH_INFO"] = fwd_uri.split("?")[0]
        # 2. If Vercel rewrote directly to the function entry point
        elif environ.get("PATH_INFO") in ("/api/index", "/api/index.py"):
            environ["PATH_INFO"] = "/"
        elif environ.get("PATH_INFO", "").startswith("/api/index.py/"):
            environ["PATH_INFO"] = environ["PATH_INFO"][len("/api/index.py"):]
        elif environ.get("PATH_INFO", "").startswith("/api/index/"):
            environ["PATH_INFO"] = environ["PATH_INFO"][len("/api/index"):]

        return self.wsgi_app(environ, start_response)


# Apply ProxyFix for HTTPS and reverse-proxy headers
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
# Apply VercelPathMiddleware
app.wsgi_app = VercelPathMiddleware(app.wsgi_app)
