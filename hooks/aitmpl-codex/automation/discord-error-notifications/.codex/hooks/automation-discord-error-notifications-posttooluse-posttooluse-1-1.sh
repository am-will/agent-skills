#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$DISCORD_WEBHOOK_URL" && -f ~/.codex/bash_start.tmp ]]; then END_TIME="$(date +%s)"; START_TIME="$(cat ~/.codex/bash_start.tmp)"; DURATION="$((END_TIME - START_TIME))"; rm -f ~/.codex/bash_start.tmp; if [[ $DURATION -gt 30 ]]; then MINUTES="$((DURATION / 60))"; SECONDS="$((DURATION % 60))"; MESSAGE='{"embeds":[{"title":"⚠️ Long Bash Operation","color":16776960,"fields":[{"name":"⏱️ Duration","value":"'"${MINUTES}"'m '"${SECONDS}"'s","inline":true},{"name":"📁 Project","value":"'"$(basename "$(pwd)")"'","inline":true},{"name":"⏰ Time","value":"'"$(date '+%H:%M:%S')"'","inline":true}],"timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"'"}]}'; curl -s -X POST "$DISCORD_WEBHOOK_URL" -H "Content-Type: application/json" -d "$MESSAGE" >/dev/null 2>&1; fi; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
