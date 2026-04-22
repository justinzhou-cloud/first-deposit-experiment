import http.server
import os

PORT = int(os.environ.get("PORT", 8000))
handler = http.server.SimpleHTTPRequestHandler
with http.server.HTTPServer(("0.0.0.0", PORT), handler) as httpd:
    print(f"Serving on port {PORT}")
    httpd.serve_forever()
