#!/usr/bin/env bash
set -euo pipefail

bundle_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
command=$(cat <<'__CODEx_HOOK_COMMAND__'
bash -c 'if [ -n "$VERCEL_TOKEN" ] && [ -n "$VERCEL_PROJECT_ID" ]; then echo "🏥 Deployment Health Monitor: Initial health check..."; DEPLOY_DATA=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&limit=1" 2>/dev/null); if [ -n "$DEPLOY_DATA" ] && [ "$DEPLOY_DATA" != "null" ]; then LATEST_STATE=$(echo "$DEPLOY_DATA" | jq -r ".deployments[0].state // empty"); LATEST_URL=$(echo "$DEPLOY_DATA" | jq -r ".deployments[0].url // empty"); LATEST_CREATED=$(echo "$DEPLOY_DATA" | jq -r ".deployments[0].created // empty"); if [ -n "$LATEST_CREATED" ] && [ "$LATEST_CREATED" != "null" ]; then MINUTES_AGO=$(( ($(date +%s) - $LATEST_CREATED/1000) / 60 )); case "$LATEST_STATE" in READY) echo "✅ Latest deployment: READY ($MINUTES_AGO minutes ago)"; if [ -n "$LATEST_URL" ]; then echo "🌐 Live at: https://$LATEST_URL"; fi;; ERROR) echo "❌ Latest deployment: FAILED ($MINUTES_AGO minutes ago)" >&2; echo "🔧 Check Vercel dashboard for details" >&2;; BUILDING) echo "🔄 Latest deployment: BUILDING ($MINUTES_AGO minutes ago)"; echo "⏳ Build in progress...";; QUEUED) echo "⏳ Latest deployment: QUEUED ($MINUTES_AGO minutes ago)";; *) echo "❓ Latest deployment: $LATEST_STATE ($MINUTES_AGO minutes ago)";; esac; echo "📊 Deployment monitoring active"; else echo "ℹ️ No recent deployments found"; fi; else echo "⚠️ Unable to connect to Vercel API"; fi; else echo "ℹ️ Deployment health monitoring disabled (VERCEL_TOKEN or VERCEL_PROJECT_ID not set)"; fi'
__CODEx_HOOK_COMMAND__
)

cd "$bundle_root"
exec "$bundle_root/.codex/hooks/_shared/run-with-hook-env.sh" -- bash -lc "$command"
