#!/usr/bin/env python3
import json
import threading
from copy import deepcopy
from pathlib import Path
from typing import Any, Callable, Dict, Optional


class UIState:
    def __init__(
        self,
        initial: Optional[Dict[str, Any]] = None,
        snapshot_path: Optional[Path] = None,
        publish: Optional[Callable[[Dict[str, Any]], None]] = None,
    ) -> None:
        self._lock = threading.Lock()
        self._state: Dict[str, Any] = deepcopy(initial) if initial else {}
        self._snapshot_path = snapshot_path
        self._publish = publish
        if self._snapshot_path is not None:
            self._snapshot_path.parent.mkdir(parents=True, exist_ok=True)
            self._write_snapshot(self._state)

    def get(self) -> Dict[str, Any]:
        with self._lock:
            return deepcopy(self._state)

    def set(self, state: Dict[str, Any], *, snapshot: bool = True) -> None:
        with self._lock:
            self._state = deepcopy(state)
            snapshot_payload = deepcopy(self._state)
        if snapshot:
            self._write_snapshot(snapshot_payload)

    def update(self, patch: Dict[str, Any], *, snapshot: bool = True) -> None:
        with self._lock:
            for key, value in patch.items():
                self._state[key] = deepcopy(value)
            snapshot_payload = deepcopy(self._state)
        if snapshot:
            self._write_snapshot(snapshot_payload)

    def mutate(self, mutator: Callable[[Dict[str, Any]], None], *, snapshot: bool = True) -> None:
        with self._lock:
            mutator(self._state)
            snapshot_payload = deepcopy(self._state)
        if snapshot:
            self._write_snapshot(snapshot_payload)

    def publish(self, event_type: str, payload: Dict[str, Any]) -> None:
        if not self._publish:
            return
        event = {"type": event_type, "payload": payload}
        self._publish(event)

    def _write_snapshot(self, payload: Dict[str, Any]) -> None:
        if self._snapshot_path is None:
            return
        tmp_path = self._snapshot_path.with_suffix(self._snapshot_path.suffix + ".tmp")
        try:
            with open(tmp_path, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, indent=2, sort_keys=True, ensure_ascii=False)
            tmp_path.replace(self._snapshot_path)
        except OSError:
            try:
                if tmp_path.exists():
                    tmp_path.unlink()
            except OSError:
                pass
