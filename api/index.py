import sys
from pathlib import Path
from urllib.parse import parse_qs, urlencode

# Add project root directory to sys.path so app can be imported
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from werkzeug.middleware.proxy_fix import ProxyFix
from app import app


class VercelPathMiddleware:
    """
    Ensures that rewritten URLs in Vercel preserve the original request path,
    by inspecting __path__ passed via rewrite query parameters.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        query_string = environ.get("QUERY_STRING", "")
        if "__path__" in query_string:
            params = parse_qs(query_string, keep_blank_values=True)
            if "__path__" in params:
                raw_path = params.pop("__path__")[0]
                environ["QUERY_STRING"] = urlencode(params, doseq=True)
                if not raw_path.startswith("/"):
                    raw_path = "/" + raw_path
                environ["PATH_INFO"] = raw_path
        elif environ.get("HTTP_X_FORWARDED_URI"):
            environ["PATH_INFO"] = environ["HTTP_X_FORWARDED_URI"].split("?")[0]
        elif environ.get("PATH_INFO") in ("/api/index", "/api/index.py"):
            environ["PATH_INFO"] = "/"

        return self.wsgi_app(environ, start_response)


# Apply ProxyFix for HTTPS and reverse-proxy headers
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
# Apply VercelPathMiddleware
app.wsgi_app = VercelPathMiddleware(app.wsgi_app)
