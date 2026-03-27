#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if command -v osascript >/dev/null 2>&1; then osascript -e 'display notification "Response complete" with title "Claude Code"'; elif command -v notify-send >/dev/null 2>&1; then notify-send 'Claude Code' 'Response complete'; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
