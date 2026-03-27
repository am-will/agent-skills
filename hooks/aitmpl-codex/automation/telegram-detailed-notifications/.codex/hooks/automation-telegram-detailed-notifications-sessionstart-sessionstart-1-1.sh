#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then echo "$(date +%s)" > ~/.codex/session_start.tmp; PROJECT_DIR="$(basename "$(pwd)")" && MESSAGE="🚀 <b>Claude Code Session Started</b>%0A📁 Project: $PROJECT_DIR%0A⏰ Time: $(date '+%H:%M:%S')%0A📅 Date: $(date '+%Y-%m-%d')"; curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" -d "chat_id=$TELEGRAM_CHAT_ID" -d "text=$MESSAGE" -d "parse_mode=HTML" >/dev/null 2>&1; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
