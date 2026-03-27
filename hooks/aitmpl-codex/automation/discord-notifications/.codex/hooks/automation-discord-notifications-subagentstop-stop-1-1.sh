#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then MESSAGE='{"content":"🎯 Claude Code subagent completed task at $(date '+%Y-%m-%d %H:%M:%S')"}'; curl -s -X POST "$DISCORD_WEBHOOK_URL" -H "Content-Type: application/json" -d "$MESSAGE" >/dev/null 2>&1 || echo "Failed to send Discord notification"; else echo "⚠️ Discord notification skipped: Set DISCORD_WEBHOOK_URL environment variable"; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
