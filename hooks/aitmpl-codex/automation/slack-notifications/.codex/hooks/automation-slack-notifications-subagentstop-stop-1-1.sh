#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$SLACK_WEBHOOK_URL" ]]; then MESSAGE='{"text":"🎯 Claude Code subagent completed task at $(date '+%Y-%m-%d %H:%M:%S')"}'; curl -s -X POST "$SLACK_WEBHOOK_URL" -H "Content-type: application/json" -d "$MESSAGE" >/dev/null 2>&1 || echo "Failed to send Slack notification"; else echo "⚠️ Slack notification skipped: Set SLACK_WEBHOOK_URL environment variable"; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
