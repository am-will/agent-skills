#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$SLACK_WEBHOOK_URL" ]]; then MESSAGE='{"blocks":[{"type":"header","text":{"type":"plain_text","text":"🔔 Claude Code Notification"}},{"type":"section","fields":[{"type":"mrkdwn","text":"*📁 Project:*\n'"$(basename "$(pwd)")"'"},{"type":"mrkdwn","text":"*⏰ Time:*\n'"$(date '+%H:%M:%S')"'"},{"type":"mrkdwn","text":"*💬 Status:*\nWaiting for user input or permission"}]}]}'; curl -s -X POST "$SLACK_WEBHOOK_URL" -H "Content-type: application/json" -d "$MESSAGE" >/dev/null 2>&1; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
