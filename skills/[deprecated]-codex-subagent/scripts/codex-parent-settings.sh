#!/usr/bin/env bash
# Prints: <model> then <model_reasoning_effort> (one per line)
set -euo pipefail

DEFAULT_MODEL="gpt-5.2-codex"
DEFAULT_REASONING="medium"

MODEL=""
REASONING=""

if command -v python3 >/dev/null 2>&1; then
  OUT="$(python3 - <<'PY' || true
from __future__ import annotations
import pathlib

try:
    import tomllib
except Exception as exc:  # Python < 3.11
    raise SystemExit(1) from exc

cfg_path = pathlib.Path("~/.codex/config.toml").expanduser()
cfg = tomllib.loads(cfg_path.read_text())
profile = cfg.get("profile")
profiles = cfg.get("profiles", {})
profile_cfg = profiles.get(profile, {}) if isinstance(profiles, dict) else {}

def get_setting(key: str) -> str:
    if isinstance(profile_cfg, dict) and key in profile_cfg:
        return str(profile_cfg[key])
    return str(cfg.get(key, ""))

print(get_setting("model"))
print(get_setting("model_reasoning_effort"))
PY
)"
  MODEL="$(printf '%s' "$OUT" | sed -n '1p')"
  REASONING="$(printf '%s' "$OUT" | sed -n '2p')"
fi

if [ -z "$MODEL" ] || [ -z "$REASONING" ]; then
  PROFILE="$(grep '^profile = ' ~/.codex/config.toml | head -n 1 | cut -d'\"' -f2 || true)"
  if [ -n "$PROFILE" ]; then
    if [ -z "$MODEL" ]; then
      MODEL="$(awk -v p="$PROFILE" '
        $0 ~ "^\\[profiles\\." p "\\]$" {in=1; next}
        $0 ~ "^\\[" {in=0}
        in && $1=="model" {gsub(/\"/, "", $3); print $3; exit}
      ' ~/.codex/config.toml)"
    fi
    if [ -z "$REASONING" ]; then
      REASONING="$(awk -v p="$PROFILE" '
        $0 ~ "^\\[profiles\\." p "\\]$" {in=1; next}
        $0 ~ "^\\[" {in=0}
        in && $1=="model_reasoning_effort" {gsub(/\"/, "", $3); print $3; exit}
      ' ~/.codex/config.toml)"
    fi
  fi
fi

if [ -z "$MODEL" ]; then
  MODEL="$(grep '^model = ' ~/.codex/config.toml | head -n 1 | cut -d'\"' -f2 || true)"
fi
if [ -z "$REASONING" ]; then
  REASONING="$(grep '^model_reasoning_effort' ~/.codex/config.toml | head -n 1 | cut -d'\"' -f2 || true)"
fi

if [ -z "$MODEL" ]; then
  MODEL="$DEFAULT_MODEL"
fi

case "$REASONING" in
  none|minimal|low|medium|high|xhigh) ;;
  *) REASONING="$DEFAULT_REASONING" ;;
esac

printf '%s\n%s\n' "$MODEL" "$REASONING"
