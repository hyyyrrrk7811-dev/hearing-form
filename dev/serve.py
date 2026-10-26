"""パソコン内での動作確認用サーバー（公開用ではありません）。

docs/ を配信し、さらに次を重ねる。
  /config.js             … 動作確認用の設定（保存・メール送信の通信を、ブラウザ内の擬似Apps Scriptに向ける）
  /__dev__/gas-mock.js   … Googleの部品（スプレッドシート・メール等）の擬似環境
  /__dev__/Code.gs       … 本番と同じ apps-script/Code.gs

使い方:
  python dev/serve.py 8741
      … 擬似のApps Scriptで動かす（Googleには何も送らない）
  python dev/serve.py 8741 https://script.google.com/macros/s/＜ID＞/exec
      … 本物のApps Script（ウェブアプリのURL）につないで確認する（実際にメールが送られる）
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

MOCK_CONFIG = b"""window.APP_CONFIG = { apiUrl: "api" };
document.write('<script src="/__dev__/gas-mock.js"><\\/script>');
"""

# 本物のApps Scriptにつなぐときは、そのURLだけを設定する（擬似環境は読み込まない）
REAL_API = sys.argv[2] if len(sys.argv) > 2 else ""
if REAL_API and not REAL_API.startswith("https://script.google.com/"):
    sys.exit("2番目の引数は https://script.google.com/ で始まるウェブアプリのURLにしてください")
DEV_CONFIG = ("window.APP_CONFIG = { apiUrl: %r };\n" % REAL_API).encode() if REAL_API else MOCK_CONFIG

SPECIAL = {
    "/config.js": ("application/javascript; charset=utf-8", lambda: DEV_CONFIG),
    "/__dev__/gas-mock.js": ("application/javascript; charset=utf-8", lambda: (ROOT / "dev" / "gas-mock.js").read_bytes()),
    "/__dev__/Code.gs": ("text/plain; charset=utf-8", lambda: (ROOT / "apps-script" / "Code.gs").read_bytes()),
}


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in SPECIAL:
            content_type, body = SPECIAL[path]
            payload = body()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            super().do_GET()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8741
ThreadingHTTPServer(("", port), partial(Handler, directory=str(ROOT / "docs"))).serve_forever()
