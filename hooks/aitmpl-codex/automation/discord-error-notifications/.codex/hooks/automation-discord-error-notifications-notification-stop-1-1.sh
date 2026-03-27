#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then MESSAGE='{"embeds":[{"title":"🔔 Claude Code Notification","color":3066993,"fields":[{"name":"📁 Project","value":"'"$(basename "$(pwd)")"'","inline":true},{"name":"⏰ Time","value":"'"$(date '+%H:%M:%S')"'","inline":true},{"name":"💬 Status","value":"Waiting for user input or permission","inline":false}],"timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"'"}]}'; curl -s -X POST "$DISCORD_WEBHOOK_URL" -H "Content-Type: application/json" -d "$MESSAGE" >/dev/null 2>&1; fi
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
