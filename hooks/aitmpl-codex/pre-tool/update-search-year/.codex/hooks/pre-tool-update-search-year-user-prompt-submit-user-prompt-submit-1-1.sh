#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
prompt="$(jq -r '.prompt // empty' <<<"$input" 2>/dev/null || true)"
current_year="$(date +%Y)"

if [[ -z "$prompt" ]]; then
  exit 0
fi

if [[ "$prompt" =~ (latest|recent|current|new|now|today|search|lookup|find) ]] && ! [[ "$prompt" =~ (20[0-9]{2}) ]]; then
  cat <<JSON
{"continue":true,"systemMessage":"[HOOK FIRED] Add the current year to web searches unless the user asks for a different year.","hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"When you search, prefer $current_year unless the user specifies a year."}}
JSON
fi
