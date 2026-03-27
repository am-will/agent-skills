#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then echo "$(date +%s)" > ~/.codex/session_start.tmp; PROJECT_DIR="$(basename "$(pwd)")"; MESSAGE='{"embeds":[{"title":"🚀 Claude Code Session Started","color":3447003,"fields":[{"name":"📁 Project","value":"'"$PROJECT_DIR"'","inline":true},{"name":"⏰ Time","value":"'"$(date '+%H:%M:%S')"'","inline":true},{"name":"📅 Date","value":"'"$(date '+%Y-%m-%d')"'","inline":true}],"timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"'"}]}'; curl -s -X POST "$DISCORD_WEBHOOK_URL" -H "Content-Type: application/json" -d "$MESSAGE" >/dev/null 2>&1; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
