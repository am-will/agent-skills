#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
echo "$(date +%s.%N),$(ps -o %cpu= -p $$),$(ps -o rss= -p $$),$CLAUDE_TOOL_NAME,end" >> ~/.codex/performance.csv; if [[ $(wc -l < ~/.codex/performance.csv) -gt 1000 ]]; then tail -n 500 ~/.codex/performance.csv > ~/.codex/performance.csv.tmp && mv ~/.codex/performance.csv.tmp ~/.codex/performance.csv; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
