#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then END_TIME="$(date +%s)"; if [[ -f ~/.codex/session_start.tmp ]]; then START_TIME="$(cat ~/.codex/session_start.tmp)"; DURATION="$((END_TIME - START_TIME))"; MINUTES="$((DURATION / 60))"; SECONDS="$((DURATION % 60))"; DURATION_TEXT="${MINUTES}m ${SECONDS}s"; rm -f ~/.codex/session_start.tmp; else DURATION_TEXT="Unknown"; fi; PROJECT_DIR="$(basename "$(pwd)")"; MEMORY_MB="$(ps -o rss= -p $$ 2>/dev/null | awk '{print int($1/1024)}' || echo 'N/A')"; MESSAGE="✅ <b>Claude Code Session Completed</b>%0A📁 Project: $PROJECT_DIR%0A⏱️ Duration: $DURATION_TEXT%0A💾 Memory Used: ${MEMORY_MB}MB%0A⏰ Finished: $(date '+%H:%M:%S')%0A📅 Date: $(date '+%Y-%m-%d')"; curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" -d "chat_id=$TELEGRAM_CHAT_ID" -d "text=$MESSAGE" -d "parse_mode=HTML" >/dev/null 2>&1 || echo "Failed to send detailed Telegram notification"; else echo "⚠️ Detailed Telegram notification skipped: Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID"; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
