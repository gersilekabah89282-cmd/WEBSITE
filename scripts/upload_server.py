#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
កម្មវិធី server សម្រាប់​ទទួល​វីដេអូ​ដែល​បាន​បង្ហោះ (Video Upload Server)
==========================================================
ប្រើ​តែ​បណ្ណាល័យ​ស្តង់ដារ​របស់ Python (មិន​តម្រូវ​ឱ្យ pip install)។

របៀប​ប្រើ:
    1. ដាក់​ឯកសារ​នេះ​នៅ​ក្នុង​ថត​ដូច​គ្នា​នឹង video-upload.html
    2. ដំណើរការ៖  python upload_server.py
    3. បើក​កម្មវិធី​រុករក៖  http://localhost:8000

មុខងារ:
    GET  /            → បម្រើ​ទំព័រ video-upload.html
    GET  /files       → បញ្ជី​វីដេអូ​ដែល​បាន​បង្ហោះ (JSON)
    GET  /uploads/... → បម្រើ​វីដេអូ​ដែល​បាន​បង្ហោះ​សម្រាប់​មើល
    POST /upload      → ទទួល​វីដេអូ (multipart/form-data) រួច​រក្សា​ទុក​ក្នុង​ថត uploads/
"""

import os
import re
import sys
import json
import time
import uuid
import shutil
import socket
import posixpath
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote, quote

# ---- ការ​កំណត់ (Configuration) ---------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
HTML_FILE = os.path.join(HERE, "video-upload.html")
UPLOAD_DIR = os.path.join(HERE, "uploads")
HOST = "0.0.0.0"
PORT = 8000
MAX_BODY = 4 * 1024 * 1024 * 1024   # ៤ GB អតិបរមា (byte)
ALLOWED_EXT = {
    ".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v", ".ogv",
    ".flv", ".wmv", ".3gp", ".ts", ".mpg", ".mpeg",
}

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---- ឧបករណ៍​ជំនួយ --------------------------------------------------------------
def secure_filename(name):
    """ធ្វើ​ឱ្យ​ឈ្មោះ​ឯកសារ​មាន​សុវត្ថិភាព៖ យក​តែ​ឈ្មោះ​ឯកសារ, ជំនួស​តួអក្សរ​មិន​ល្អ។"""
    base = os.path.basename(name or "")
    base = re.sub(r"[^\w.\-]+", "_", base).strip("._")
    if not base:
        base = "video_" + uuid.uuid4().hex[:8]
    return base


def unique_path(directory, filename):
    """បង្កើត​ផ្លូវ​ឯកសារ​ដែល​មិន​ទាំង​ស្រុង បើ​មាន​ហើយ​សូម​បន្ថែម​លេខ។"""
    candidate = os.path.join(directory, filename)
    if not os.path.exists(candidate):
        return candidate, filename
    root, ext = os.path.splitext(filename)
    i = 1
    while True:
        new_name = "%s_%d%s" % (root, i, ext)
        cand = os.path.join(directory, new_name)
        if not os.path.exists(cand):
            return cand, new_name
        i += 1


def file_size_fmt(n):
    for u in ("B", "KB", "MB", "GB", "TB"):
        if n < 1024 or u == "TB":
            return "%.1f %s" % (n, u) if u != "B" else "%d B" % n
        n /= 1024.0


def is_allowed(name):
    ext = os.path.splitext(name)[1].lower()
    return ext in ALLOWED_EXT


# ---- Streaming multipart parser (មិន​ផ្ទុក​ទាំង​អស់​ក្នុង​ memory) -------------------
def parse_multipart_stream(rfile, content_length, boundary, save_dir):
    """
    ញែក multipart/form-data ដោយ​ផ្ទុក​ទិន្នន័យ​វីដេអូ​ចេញ​ទៅ​កាន់​ថត​រក្សា​ទុក​ភាស់​មួយ​ផ្នែក​ម្នាក់។
    ត្រឡប់​បញ្ជី parts៖ [{'name','filename','type','saved_path','size','value'}...]
    """
    delim = b"--" + boundary
    end_delim = delim + b"--"
    crlf = b"\r\n"
    marker = crlf + delim  # សញ្ញា​បង្ហាញ​ព្រំ​ដែន​បន្ទាប់

    parts = []
    buf = b""
    bytes_read = 0
    current = None
    state = "boundary"

    def read_chunk(n=131072):
        nonlocal buf, bytes_read
        remaining = content_length - bytes_read
        if remaining <= 0:
            return b""
        chunk = rfile.read(min(n, remaining))
        bytes_read += len(chunk)
        return chunk

    def write_data(part, data):
        if part.get("fh"):
            part["fh"].write(data)
            part["size"] += len(data)
        else:
            part["body"] = part.get("body", b"") + data

    def finalize(part):
        if part is None:
            return
        if part.get("fh"):
            part["fh"].close()
            del part["fh"]
        if "filename" in part and part["filename"]:
            parts.append(part)
        elif "body" in part:
            part["value"] = part["body"].decode("utf-8", "replace")
            del part["body"]
            parts.append(part)

    while True:
        # បន្ថែម​ទិន្នន័យ​បើ​បារ​ដូច​គ្នា
        if not buf and bytes_read < content_length:
            buf = read_chunk()
            if not buf:
                break

        if state == "boundary":
            idx = buf.find(crlf)
            if idx < 0:
                if bytes_read < content_length:
                    buf += read_chunk()
                    continue
                else:
                    break
            line = buf[:idx]
            buf = buf[idx + len(crlf):]
            if line == end_delim or line.rstrip() == end_delim:
                break
            if line == delim or line.rstrip() == delim:
                state = "headers"
                current = {"headers": {}, "name": None, "filename": None, "type": None}
                continue
            # បន្ទាត់​ដែល​មិន​រំលឹក — ឈាន​ចូល (ឧ. leading bytes)
            continue

        if state == "headers":
            sep = crlf + crlf
            idx = buf.find(sep)
            if idx < 0:
                if bytes_read < content_length:
                    buf += read_chunk()
                    continue
                else:
                    break
            header_block = buf[:idx]
            buf = buf[idx + len(sep):]
            for hline in header_block.split(crlf):
                if not hline:
                    continue
                if b":" in hline:
                    k, v = hline.split(b":", 1)
                    k = k.strip().decode("latin-1").lower()
                    v = v.strip().decode("latin-1")
                    current["headers"][k] = v
                    if k == "content-disposition":
                        for token in v.split(";"):
                            token = token.strip()
                            if token.lower().startswith("name="):
                                current["name"] = token.split("=", 1)[1].strip('"')
                            elif token.lower().startswith("filename="):
                                fn = token.split("=", 1)[1].strip('"')
                                current["filename"] = fn
                    elif k == "content-type":
                        current["type"] = v
            state = "body"
            if current.get("filename"):
                if not is_allowed(current["filename"]):
                    # មិន​អនុញ្ញាត — បោះបង់​ផ្នែក​នេះ (ផ្ទុក​ទៅ /dev/null)
                    current["fh"] = open(os.devnull, "wb")
                    current["rejected"] = True
                    current["saved_path"] = None
                    current["size"] = 0
                else:
                    safe = secure_filename(current["filename"])
                    path, final_name = unique_path(save_dir, safe)
                    current["fh"] = open(path, "wb")
                    current["saved_path"] = path
                    current["filename"] = final_name
                    current["size"] = 0
            else:
                current["body"] = b""
            continue

        if state == "body":
            idx = buf.find(marker)
            if idx >= 0:
                data = buf[:idx]
                buf = buf[idx + len(crlf):]   # បន្ទាប់​ពី CRLF, គេ​សល់​ជា delim...
                write_data(current, data)
                finalize(current)
                current = None
                state = "boundary"
                continue
            # រក្សា​កន្លះ​បន្ទាប់​ពី​សុវត្ថិភាព (បង្ហាញ​សញ្ញា​អាច​ឆ្លង​កាត់​ការ​បំបែក)
            safe_len = len(buf) - (len(marker) - 1)
            if safe_len > 0:
                write_data(current, buf[:safe_len])
                buf = buf[safe_len:]
            if bytes_read < content_length:
                buf += read_chunk()
            elif buf:
                # ទិន្នន័យ​ចុងក្រោយ បើ​គ្មាន​សញ្ញា​បិទ
                write_data(current, buf)
                buf = b""
                finalize(current)
                break
            else:
                break

    return parts


# ---- HTTP handler ----------------------------------------------------------
class Handler(BaseHTTPRequestHandler):
    server_version = "VideoUpload/1.0"

    # ---- ការ​ផ្តល់​ឈ្មោះ​ប្រភេទ (mime) ----
    MIME = {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".avi": "video/x-msvideo",
        ".mkv": "video/x-matroska",
        ".m4v": "video/x-m4v",
        ".ogv": "video/ogg",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
    }

    def log_message(self, fmt, *args):
        sys.stdout.write("[server] %s - %s\n" % (self.address_string(), fmt % args))
        sys.stdout.flush()

    def _send(self, code, body=b"", ctype="text/plain; charset=utf-8", headers=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        if headers:
            for k, v in headers.items():
                self.send_header(k, v)
        self.end_headers()
        if body and self.command != "HEAD":
            self.wfile.write(body)

    def _json(self, code, obj, headers=None):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        extra = {"Access-Control-Allow-Origin": "*"}
        if headers:
            extra.update(headers)
        self._send(code, body, "application/json; charset=utf-8", extra)

    # ---- GET ----
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ("/", "/index.html"):
            return self._serve_html()

        if path == "/files":
            return self._list_files()

        if path.startswith("/uploads/"):
            return self._serve_upload(path[len("/uploads/"):])

        if path == "/favicon.ico":
            return self._send(204, b"")

        self._send(404, b"Not Found", "text/plain; charset=utf-8")

    def do_HEAD(self):
        self.do_GET()

    # ---- OPTIONS (CORS) ----
    def do_OPTIONS(self):
        self._send(204, b"", headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        })

    # ---- POST /upload ----
    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/upload":
            return self._json(404, {"ok": False, "error": "Not Found"})

        ctype = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ctype.lower():
            return self._json(400, {"ok": False, "error": "តម្រូវ​ឱ្យ​ប្រើ multipart/form-data"})

        # ស្វែងរក boundary
        m = re.search(r"boundary=(.+)", ctype)
        if not m:
            return self._json(400, {"ok": False, "error": "គ្មាន boundary"})
        boundary = m.group(1).strip().strip('"').encode("latin-1")

        length = int(self.headers.get("Content-Length", 0) or 0)
        if length <= 0:
            # អាច​ជា chunked — ក្នុង​សេណារីយ៉េ​នេះ​គាំទ្រ​តែ Content-Length
            return self._json(411, {"ok": False, "error": "តម្រូវ​ឱ្យ​មាន Content-Length"})
        if length > MAX_BODY:
            return self._json(413, {"ok": False, "error": "ឯកសារ​ធំ​ជាង %d បៃ" % MAX_BODY})

        try:
            parts = parse_multipart_stream(self.rfile, length, boundary, UPLOAD_DIR)
        except Exception as e:
            self._json(500, {"ok": False, "error": "កំហុស​ពេល​ញែក៖ %s" % e})
            return

        saved = []
        rejected = []
        for p in parts:
            if p.get("rejected"):
                rejected.append(p.get("filename") or p.get("name"))
                continue
            if p.get("saved_path"):
                saved.append({
                    "name": p["filename"],
                    "size": p.get("size", 0),
                    "size_h": file_size_fmt(p.get("size", 0)),
                    "type": p.get("type", ""),
                    "path": "/uploads/" + quote(p["filename"]),
                    "saved": os.path.basename(p["saved_path"]),
                })

        if saved:
            self._json(200, {"ok": True, "files": saved, "rejected": rejected})
        else:
            self._json(400, {"ok": False, "error": "គ្មាន​ឯកសារ​ត្រឹមត្រូវ", "rejected": rejected})

    # ---- helpers សម្រាប់ GET ----
    def _serve_html(self):
        if not os.path.isfile(HTML_FILE):
            body = ("<html><body><h1>កម្មវិធី​បង្ហោះ​វីដេអូ</h1>"
                    "<p>រក​មិន​ឃើញ​ឯកសារ <code>video-upload.html</code> ទេ។ "
                    "សូម​ដាក់​វា​ក្នុង​ថត​ដូច​គ្នា​នឹង <code>upload_server.py</code>។</p></body></html>"
                    ).encode("utf-8")
            return self._send(200, body, "text/html; charset=utf-8")
        with open(HTML_FILE, "rb") as f:
            body = f.read()
        self._send(200, body, "text/html; charset=utf-8")

    def _list_files(self):
        items = []
        try:
            for fn in sorted(os.listdir(UPLOAD_DIR)):
                fp = os.path.join(UPLOAD_DIR, fn)
                if os.path.isfile(fp):
                    st = os.stat(fp)
                    items.append({
                        "name": fn,
                        "size": st.st_size,
                        "size_h": file_size_fmt(st.st_size),
                        "url": "/uploads/" + quote(fn),
                        "mtime": int(st.st_mtime),
                    })
        except Exception as e:
            return self._json(500, {"ok": False, "error": str(e)})
        self._json(200, {"ok": True, "files": items})

    def _serve_upload(self, rel):
        rel = unquote(rel)
        # ទប់ស្កាត់ path traversal
        rel = posixpath.normpath(rel)
        if "/" in rel or rel in ("..", ".", ""):
            return self._send(400, b"Bad request", "text/plain; charset=utf-8")
        fp = os.path.join(UPLOAD_DIR, rel)
        if not os.path.isfile(fp):
            return self._send(404, b"Not Found", "text/plain; charset=utf-8")
        ext = os.path.splitext(rel)[1].lower()
        ctype = self.MIME.get(ext, "application/octet-stream")
        size = os.path.getsize(fp)
        # គាំទ្រ range request សាមញ្ញ (សម្រាប់​វីដេអូ​វែង)
        range_hdr = self.headers.get("Range")
        if range_hdr and ext in (".mp4", ".webm", ".m4v", ".ogv", ".mov", ".mkv"):
            return self._serve_range(fp, size, ctype, range_hdr)
        with open(fp, "rb") as f:
            body = f.read()
        self._send(200, body, ctype)

    def _serve_range(self, fp, size, ctype, range_hdr):
        m = re.match(r"bytes=(\d*)-(\d*)", range_hdr)
        if not m:
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(size))
            self.send_header("Accept-Ranges", "bytes")
            self.end_headers()
            with open(fp, "rb") as f:
                shutil.copyfileobj(f, self.wfile)
            return
        start = int(m.group(1)) if m.group(1) else 0
        end = int(m.group(2)) if m.group(2) else size - 1
        if start >= size or end >= size or start > end:
            self.send_response(416)
            self.send_header("Content-Range", "bytes */%d" % size)
            self.end_headers()
            return
        length = end - start + 1
        self.send_response(206)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        with open(fp, "rb") as f:
            f.seek(start)
            remaining = length
            while remaining > 0:
                chunk = f.read(min(131072, remaining))
                if not chunk:
                    break
                self.wfile.write(chunk)
                remaining -= len(chunk)


def find_free_port(preferred):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        s.bind((HOST, preferred))
        s.close()
        return preferred
    except OSError:
        pass
    finally:
        try:
            s.close()
        except Exception:
            pass
    # ស្វែងរក​ច្រក​សេរី
    s2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s2.bind((HOST, 0))
    port = s2.getsockname()[1]
    s2.close()
    return port


def main():
    port = find_free_port(PORT)
    httpd = ThreadingHTTPServer((HOST, port), Handler)
    print("=" * 60)
    print("  កម្មវិធី​បង្ហោះ​វីដេអូ — Video Upload Server")
    print("-" * 60)
    print("  ថត​រក្សា​ទុក​វីដេអូ ៖ " + UPLOAD_DIR)
    print("  ទំព័រ​កម្មវិធី      ៖ " + HTML_FILE)
    print("  ច្រក             ៖ %d" % port)
    print("-" * 60)
    print("  បើក​កម្មវិធី​រុករក​ទៅកាន់៖")
    print("    http://localhost:%d" % port)
    if HOST == "0.0.0.0":
        try:
            lan_ip = socket.gethostbyname(socket.gethostname())
            print("    http://%s:%d   (ពី​កុំព្យូទ័រ​ផ្សេង​ក្នុង​បណ្តាញ)" % (lan_ip, port))
        except Exception:
            pass
    print("-" * 60)
    print("  ចុច Ctrl+C ដើម្បី​បញ្ឈប់។")
    print("=" * 60)
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[server] កំពុង​បញ្ឈប់…")
        httpd.shutdown()
        httpd.server_close()


if __name__ == "__main__":
    main()
