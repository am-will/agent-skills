#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  validate_role.sh --role-name NAME --config PATH --role-config PATH --schema PATH
USAGE
}

role_name=""
config_path=""
role_config_path=""
schema_path=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --role-name)
      role_name="$2"; shift 2 ;;
    --config)
      config_path="$2"; shift 2 ;;
    --role-config)
      role_config_path="$2"; shift 2 ;;
    --schema)
      schema_path="$2"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1 ;;
  esac
done

if [[ -z "$role_name" || -z "$config_path" || -z "$role_config_path" || -z "$schema_path" ]]; then
  echo "Missing required arguments." >&2
  usage
  exit 1
fi

for path in "$config_path" "$role_config_path" "$schema_path"; do
  if [[ ! -f "$path" ]]; then
    echo "Missing file: $path" >&2
    exit 1
  fi
done

allowed_decl='["description","config_file"]'
decl_keys="$(tomlq --arg role_name "$role_name" '.agents[$role_name] // {} | keys' "$config_path")"
unsupported_decl="$(jq -n --argjson have "$decl_keys" --argjson allowed "$allowed_decl" '$have - $allowed')"
if [[ "$unsupported_decl" != "[]" ]]; then
  echo "Unsupported keys under [agents.$role_name]: $unsupported_decl" >&2
  exit 1
fi

required_decl_present="$(tomlq -r --arg role_name "$role_name" '.agents[$role_name].description != null and .agents[$role_name].config_file != null' "$config_path")"
if [[ "$required_decl_present" != "true" ]]; then
  echo "Role declaration must include description and config_file under [agents.$role_name]" >&2
  exit 1
fi

allowed_top_keys="$(jq -c '.properties | keys' "$schema_path")"
role_top_keys="$(tomlq 'keys' "$role_config_path")"
unsupported_top="$(jq -n --argjson have "$role_top_keys" --argjson allowed "$allowed_top_keys" '$have - $allowed')"
if [[ "$unsupported_top" != "[]" ]]; then
  echo "Unsupported top-level keys in role config: $unsupported_top" >&2
  exit 1
fi

for required_key in model model_reasoning_effort developer_instructions; do
  present="$(tomlq -r --arg required_key "$required_key" '.[$required_key] != null and .[$required_key] != ""' "$role_config_path")"
  if [[ "$present" != "true" ]]; then
    echo "Missing required role config key: $required_key" >&2
    exit 1
  fi
done

echo "Role validation passed for '$role_name'."
