#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then END_TIME="$(date +%s)"; if [[ -f ~/.codex/session_start.tmp ]]; then START_TIME="$(cat ~/.codex/session_start.tmp)"; DURATION="$((END_TIME - START_TIME))"; MINUTES="$((DURATION / 60))"; SECONDS="$((DURATION % 60))"; DURATION_TEXT="${MINUTES}m ${SECONDS}s"; rm -f ~/.codex/session_start.tmp; else DURATION_TEXT="Unknown"; fi; PROJECT_DIR="$(basename "$(pwd)")"; MEMORY_MB="$(ps -o rss= -p $$ 2>/dev/null | awk '{print int($1/1024)}' || echo 'N/A')"; MESSAGE='{"embeds":[{"title":"✅ Claude Code Session Completed","color":5763719,"fields":[{"name":"📁 Project","value":"'"$PROJECT_DIR"'","inline":true},{"name":"⏱️ Duration","value":"'"$DURATION_TEXT"'","inline":true},{"name":"💾 Memory Used","value":"'"${MEMORY_MB}"'MB","inline":true},{"name":"⏰ Finished","value":"'"$(date '+%H:%M:%S')"'","inline":true},{"name":"📅 Date","value":"'"$(date '+%Y-%m-%d')"'","inline":true}],"timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"'"}]}'; curl -s -X POST "$DISCORD_WEBHOOK_URL" -H "Content-Type: application/json" -d "$MESSAGE" >/dev/null 2>&1 || echo "Failed to send detailed Discord notification"; else echo "⚠️ Detailed Discord notification skipped: Set DISCORD_WEBHOOK_URL"; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
