#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print(
            "usage: install-bundle.py <bundle-dir> <target-root>",
            file=sys.stderr,
        )
        return 64

    bundle_dir = Path(sys.argv[1]).resolve()
    target_root = Path(sys.argv[2]).resolve()

    hooks_path = bundle_dir / "hooks.json"
    support_dir = bundle_dir / ".codex" / "hooks"
    if not hooks_path.is_file():
        raise SystemExit(f"missing bundle hooks.json: {hooks_path}")
    if not support_dir.exists():
        raise SystemExit(f"missing bundle support directory: {support_dir}")

    bundle_hooks = json.loads(hooks_path.read_text())
    target_codex_dir = target_root / ".codex"
    target_codex_dir.mkdir(parents=True, exist_ok=True)
    target_hooks_path = target_codex_dir / "hooks.json"
    installed_hooks = merge_hooks(target_hooks_path, bundle_hooks)
    target_hooks_path.write_text(json.dumps(installed_hooks, indent=2) + "\n")

    target_support_dir = target_codex_dir / "hooks"
    copy_tree(support_dir, target_support_dir)

    print(f"installed bundle: {bundle_dir}")
    print(f"target root: {target_root}")
    print(f"hooks written: {target_hooks_path}")
    return 0


def merge_hooks(target_hooks_path: Path, bundle_hooks: dict) -> dict:
    if target_hooks_path.exists():
        existing = json.loads(target_hooks_path.read_text())
    else:
        existing = {"hooks": {}}

    merged = existing.get("hooks", {})
    incoming = bundle_hooks.get("hooks", {})
    for event_name, groups in incoming.items():
        merged.setdefault(event_name, [])
        merged[event_name].extend(groups)

    existing["hooks"] = merged
    return existing


def copy_tree(source: Path, destination: Path) -> None:
    for path in source.rglob("*"):
        relative = path.relative_to(source)
        target = destination / relative
        if path.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)


if __name__ == "__main__":
    raise SystemExit(main())
