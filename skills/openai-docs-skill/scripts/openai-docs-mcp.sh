#!/usr/bin/env bash
set -euo pipefail

MCP_URL="${MCP_URL:-https://developers.openai.com/mcp}"

usage() {
  cat <<'EOF'
OpenAI Docs MCP (CLI)

Usage:
  openai-docs-mcp.sh init
  openai-docs-mcp.sh tools
  openai-docs-mcp.sh search <query> [limit] [cursor]
  openai-docs-mcp.sh list [limit] [cursor]
  openai-docs-mcp.sh fetch <url> [anchor]
  openai-docs-mcp.sh endpoints
  openai-docs-mcp.sh openapi <endpoint-url> [lang1,lang2] [code-only]

Environment:
  MCP_URL  Override the MCP endpoint (default: https://developers.openai.com/mcp)
EOF
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

mcp_request() {
  local payload="$1"
  curl -s -N \
    -H 'Accept: application/json, text/event-stream' \
    -H 'Content-Type: application/json' \
    -X POST "$MCP_URL" \
    -d "$payload" \
    | sed -n 's/^data: //p' \
    | tail -n 1
}

mcp_call() {
  local method="$1"
  local params="${2:-null}"
  local payload
  if [[ "$params" == "null" ]]; then
    payload=$(jq -n --arg method "$method" '{jsonrpc:"2.0",id:1,method:$method}')
  else
    payload=$(jq -n --arg method "$method" --argjson params "$params" '{jsonrpc:"2.0",id:1,method:$method,params:$params}')
  fi
  mcp_request "$payload"
}

mcp_tool_call() {
  local name="$1"
  local args_json="$2"
  local payload
  payload=$(jq -n --arg name "$name" --argjson args "$args_json" '{jsonrpc:"2.0",id:1,method:"tools/call",params:{name:$name,arguments:$args}}')
  mcp_request "$payload"
}

ensure_ok() {
  local resp="$1"
  if echo "$resp" | jq -e '.error' >/dev/null; then
    echo "$resp" | jq -r '.error' >&2
    exit 1
  fi
}

is_int() {
  [[ "$1" =~ ^[0-9]+$ ]]
}

require_cmd curl
require_cmd jq

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

cmd="$1"
shift

case "$cmd" in
  init)
    resp="$(mcp_call "initialize" "$(jq -n '{protocolVersion:"2025-03-26",capabilities:{},clientInfo:{name:"openai-docs-mcp-cli",version:"1.0.0"}}')")"
    ensure_ok "$resp"
    echo "$resp" | jq
    ;;
  tools)
    resp="$(mcp_call "tools/list")"
    ensure_ok "$resp"
    echo "$resp" | jq
    ;;
  search)
    query="${1:-}"
    limit="${2:-}"
    cursor="${3:-}"
    if [[ -z "$query" ]]; then
      usage
      exit 1
    fi
    if [[ -n "$limit" ]] && ! is_int "$limit"; then
      echo "limit must be an integer" >&2
      exit 1
    fi
    args="$(jq -n --arg query "$query" --arg limit "${limit:-}" --arg cursor "${cursor:-}" \
      '{query:$query}
       + ( $limit | length > 0 ? {limit: ($limit|tonumber)} : {} )
       + ( $cursor | length > 0 ? {cursor: $cursor} : {} )')"
    resp="$(mcp_tool_call "search_openai_docs" "$args")"
    ensure_ok "$resp"
    echo "$resp" | jq -r '.result.content[0].text | fromjson'
    ;;
  list)
    limit="${1:-}"
    cursor="${2:-}"
    if [[ -n "$limit" ]] && ! is_int "$limit"; then
      echo "limit must be an integer" >&2
      exit 1
    fi
    args="$(jq -n --arg limit "${limit:-}" --arg cursor "${cursor:-}" \
      '( $limit | length > 0 ? {limit: ($limit|tonumber)} : {} )
       + ( $cursor | length > 0 ? {cursor: $cursor} : {} )')"
    resp="$(mcp_tool_call "list_openai_docs" "$args")"
    ensure_ok "$resp"
    echo "$resp" | jq -r '.result.content[0].text | fromjson'
    ;;
  fetch)
    url="${1:-}"
    anchor="${2:-}"
    if [[ -z "$url" ]]; then
      usage
      exit 1
    fi
    args="$(jq -n --arg url "$url" --arg anchor "${anchor:-}" \
      '{url:$url} + ( $anchor | length > 0 ? {anchor: $anchor} : {} )')"
    resp="$(mcp_tool_call "fetch_openai_doc" "$args")"
    ensure_ok "$resp"
    echo "$resp" | jq -r '.result.content[0].text'
    ;;
  endpoints)
    resp="$(mcp_tool_call "list_api_endpoints" "$(jq -n '{}')")"
    ensure_ok "$resp"
    echo "$resp" | jq -r '.result.content[0].text | fromjson'
    ;;
  openapi)
    url="${1:-}"
    langs="${2:-}"
    code_only="${3:-}"
    if [[ -z "$url" ]]; then
      usage
      exit 1
    fi
    lang_json="[]"
    if [[ -n "$langs" ]]; then
      lang_json="$(printf '%s\n' "$langs" | tr ',' '\n' | jq -R -s 'split("\n") | map(select(length>0))')"
    fi
    code_only_flag="false"
    if [[ "${code_only:-}" == "code-only" || "${code_only:-}" == "true" ]]; then
      code_only_flag="true"
    fi
    args="$(jq -n --arg url "$url" --argjson languages "$lang_json" --argjson codeOnly "$code_only_flag" \
      '{url:$url}
       + ( $languages | length > 0 ? {languages: $languages} : {} )
       + ( $codeOnly == true ? {codeExamplesOnly: true} : {} )')"
    resp="$(mcp_tool_call "get_openapi_spec" "$args")"
    ensure_ok "$resp"
    echo "$resp" | jq -r '.result.content[0].text | fromjson'
    ;;
  *)
    usage
    exit 1
    ;;
esac
