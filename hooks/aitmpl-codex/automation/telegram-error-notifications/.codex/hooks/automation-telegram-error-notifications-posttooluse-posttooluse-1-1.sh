#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" && -f ~/.codex/bash_start.tmp ]]; then END_TIME="$(date +%s)"; START_TIME="$(cat ~/.codex/bash_start.tmp)"; DURATION="$((END_TIME - START_TIME))"; rm -f ~/.codex/bash_start.tmp; if [[ $DURATION -gt 30 ]]; then MINUTES="$((DURATION / 60))"; SECONDS="$((DURATION % 60))"; MESSAGE="⚠️ <b>Long Bash Operation</b>%0A⏱️ Duration: ${MINUTES}m ${SECONDS}s%0A📁 Project: $(basename "$(pwd)")%0A⏰ Time: $(date '+%H:%M:%S')"; curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" -d "chat_id=$TELEGRAM_CHAT_ID" -d "text=$MESSAGE" -d "parse_mode=HTML" >/dev/null 2>&1; fi; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
