#!/usr/bin/env python3
"""Local server for development: like `python -m http.server`, but tells the
browser not to cache anything, so an edited script is always the one that runs.

    python tools/serve.py          # http://localhost:8130/dev.html
    python tools/serve.py 8131
"""
import functools
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8130
    handler = functools.partial(NoCache, directory=ROOT)
    with http.server.ThreadingHTTPServer(('', port), handler) as srv:
        print(f'PokeLeague: http://localhost:{port}/dev.html  (Ctrl+C to stop)')
        srv.serve_forever()


if __name__ == '__main__':
    main()
