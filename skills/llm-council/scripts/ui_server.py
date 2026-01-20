#!/usr/bin/env python3
import json
import queue
import secrets
import threading
import time
from dataclasses import dataclass
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.parse import parse_qs, urlparse

from ui_state import UIState


DEFAULT_KEEPALIVE_SEC = 15


@dataclass
class UIAction:
    path: str
    payload: Dict[str, Any]
    timestamp: float


class _SSEClient:
    def __init__(self) -> None:
        self.queue: "queue.Queue[Optional[str]]" = queue.Queue()
        self.closed = threading.Event()

    def close(self) -> None:
        self.closed.set()
        try:
            self.queue.put_nowait(None)
        except queue.Full:
            pass


class UIServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, ui_dir: Path, state: Optional[UIState] = None) -> None:
        self.state = state or UIState()
        self.ui_dir = ui_dir
        self.clients: "list[_SSEClient]" = []
        self.clients_lock = threading.Lock()
        self.actions: "queue.Queue[UIAction]" = queue.Queue()
        self.token = secrets.token_urlsafe(18)
        super().__init__(("127.0.0.1", 0), _UIRequestHandler)

    def broadcast(self, payload: Dict[str, Any]) -> None:
        message = json.dumps(payload, ensure_ascii=False)
        with self.clients_lock:
            clients = list(self.clients)
        for client in clients:
            try:
                client.queue.put_nowait(message)
            except queue.Full:
                client.close()

    def register_client(self, client: _SSEClient) -> None:
        with self.clients_lock:
            self.clients.append(client)

    def unregister_client(self, client: _SSEClient) -> None:
        with self.clients_lock:
            if client in self.clients:
                self.clients.remove(client)

    def enqueue_action(self, path: str, payload: Dict[str, Any]) -> None:
        self.actions.put(UIAction(path=path, payload=payload, timestamp=time.time()))

    @property
    def ui_url(self) -> str:
        return f"http://127.0.0.1:{self.server_address[1]}/?token={self.token}"


class _UIRequestHandler(SimpleHTTPRequestHandler):
    server: UIServer

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
            "script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; "
            "frame-ancestors 'none'",
        )
        super().end_headers()

    def log_message(self, format: str, *args: Any) -> None:
        return

    def list_directory(self, path: str) -> Optional[Any]:
        self.send_error(HTTPStatus.NOT_FOUND)
        return None

    def translate_path(self, path: str) -> str:
        ui_root = self.server.ui_dir
        parsed = urlparse(path)
        rel = parsed.path.lstrip("/") or "index.html"
        resolved = (ui_root / rel).resolve()
        if resolved != ui_root and ui_root not in resolved.parents:
            return str(ui_root / "__not_found__")
        return str(resolved)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/state":
            self._handle_state()
            return
        if parsed.path == "/events":
            self._handle_events(parsed)
            return
        if parsed.path == "/ui/state":
            self._handle_state()
            return
        if parsed.path == "/ui/events":
            self._handle_events(parsed)
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if not self._validate_token(parsed):
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length else b""
        payload: Dict[str, Any]
        if raw_body:
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except json.JSONDecodeError:
                payload = {"raw": raw_body.decode("utf-8", errors="replace")}
        else:
            payload = {}
        self.server.enqueue_action(parsed.path, payload)
        self._send_json({"ok": True})

    def _handle_state(self) -> None:
        state = self.server.state.get()
        self._send_json(state)

    def _handle_events(self, parsed: Any) -> None:
        if not self._validate_token(parsed):
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        client = _SSEClient()
        self.server.register_client(client)
        try:
            self._write_sse_comment("connected")
            while not client.closed.is_set():
                try:
                    message = client.queue.get(timeout=DEFAULT_KEEPALIVE_SEC)
                except queue.Empty:
                    self._write_sse_comment("keep-alive")
                    continue
                if message is None:
                    break
                self._write_sse_data(message)
        except (ConnectionError, BrokenPipeError):
            pass
        finally:
            self.server.unregister_client(client)
            client.close()

    def _validate_token(self, parsed: Any) -> bool:
        query = parse_qs(parsed.query or "")
        token = None
        if "token" in query and query["token"]:
            token = query["token"][0]
        header_token = self.headers.get("X-UI-Token")
        if header_token:
            token = header_token
        return token == self.server.token

    def _send_json(self, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _write_sse_comment(self, comment: str) -> None:
        data = f": {comment}\n\n".encode("utf-8")
        self.wfile.write(data)
        self.wfile.flush()

    def _write_sse_data(self, data: str) -> None:
        payload = f"data: {data}\n\n".encode("utf-8")
        self.wfile.write(payload)
        self.wfile.flush()


def start_server(ui_dir: Optional[Path] = None, state: Optional[UIState] = None) -> UIServer:
    ui_path = ui_dir or (Path(__file__).resolve().parent / "ui")
    server = UIServer(ui_path, state=state)
    thread = threading.Thread(target=server.serve_forever, name="ui-server", daemon=True)
    thread.start()
    return server


def main() -> int:
    server = start_server()
    print(f"UI server running at {server.ui_url}")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        server.shutdown()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
