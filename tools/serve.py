#!/usr/bin/env python3
"""Local server for development: like `python -m http.server`, but tells the
browser not to cache anything, so an edited script is always the one that runs.
It answers only this computer; --lan opens it to the local network (a phone on
the same Wi-Fi), which also shows that network the whole project folder.

    python tools/serve.py          # http://localhost:8130/dev.html
    python tools/serve.py 8131
    python tools/serve.py --lan    # http://<this computer's IP>:8130/dev.html
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
    args = sys.argv[1:]
    lan = '--lan' in args
    nums = [a for a in args if a.isdigit()]
    port = int(nums[0]) if nums else 8130
    handler = functools.partial(NoCache, directory=ROOT)
    with http.server.ThreadingHTTPServer(('' if lan else '127.0.0.1', port), handler) as srv:
        print(f'PokeLeague: http://localhost:{port}/dev.html  (Ctrl+C to stop)'
              + ('  · open to the local network' if lan else ''))
        srv.serve_forever()


if __name__ == '__main__':
    main()
