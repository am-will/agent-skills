#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
echo "$(date +%s.%N),$(ps -o %cpu= -p $$),$(ps -o rss= -p $$),$CLAUDE_TOOL_NAME,start" >> ~/.codex/performance.csv
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
