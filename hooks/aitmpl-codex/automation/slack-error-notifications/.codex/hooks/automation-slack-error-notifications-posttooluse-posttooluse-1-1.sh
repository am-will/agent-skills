#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$SLACK_WEBHOOK_URL" && -f ~/.codex/bash_start.tmp ]]; then END_TIME="$(date +%s)"; START_TIME="$(cat ~/.codex/bash_start.tmp)"; DURATION="$((END_TIME - START_TIME))"; rm -f ~/.codex/bash_start.tmp; if [[ $DURATION -gt 30 ]]; then MINUTES="$((DURATION / 60))"; SECONDS="$((DURATION % 60))"; MESSAGE='{"blocks":[{"type":"header","text":{"type":"plain_text","text":"⚠️ Long Bash Operation"}},{"type":"section","fields":[{"type":"mrkdwn","text":"*⏱️ Duration:*\n'"${MINUTES}"'m '"${SECONDS}"'s"},{"type":"mrkdwn","text":"*📁 Project:*\n'"$(basename "$(pwd)")"'"},{"type":"mrkdwn","text":"*⏰ Time:*\n'"$(date '+%H:%M:%S')"'"}]}]}'; curl -s -X POST "$SLACK_WEBHOOK_URL" -H "Content-type: application/json" -d "$MESSAGE" >/dev/null 2>&1; fi; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
