#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
python3 -c "import json, sys, os; agents_content = open('AGENTS.md', 'r').read() if os.path.exists('AGENTS.md') else ''; output = {'hookSpecificOutput': {'hookEventName': 'SessionStart', 'additionalContext': agents_content}}; print(json.dumps(output))"
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
