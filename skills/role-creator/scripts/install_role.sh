#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  install_role.sh --role-name NAME --description TEXT --role-config-file PATH [options]

Options:
  --config PATH          Target config.toml (default: ~/.codex/config.toml)
  --update-existing      Allow updating an existing [agents.<role>] definition
  --no-backup            Skip writing a .bak backup file
  --disable-multi-agent  Do not force features.multi_agent=true
  -h, --help             Show this help
USAGE
}

config_path="${HOME}/.codex/config.toml"
role_name=""
role_description=""
role_config_file=""
set_multi_agent="true"
update_existing="false"
write_backup="true"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --config)
      config_path="$2"; shift 2 ;;
    --role-name)
      role_name="$2"; shift 2 ;;
    --description)
      role_description="$2"; shift 2 ;;
    --role-config-file)
      role_config_file="$2"; shift 2 ;;
    --update-existing)
      update_existing="true"; shift ;;
    --no-backup)
      write_backup="false"; shift ;;
    --disable-multi-agent)
      set_multi_agent="false"; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1 ;;
  esac
done

if [[ -z "$role_name" || -z "$role_description" || -z "$role_config_file" ]]; then
  echo "Missing required arguments." >&2
  usage
  exit 1
fi

mkdir -p "$(dirname "$config_path")"
if [[ ! -f "$config_path" ]]; then
  : > "$config_path"
fi

role_exists="$(tomlq -r --arg role_name "$role_name" '.agents[$role_name] != null' "$config_path" 2>/dev/null || printf 'false')"
if [[ "$role_exists" == "true" && "$update_existing" != "true" ]]; then
  echo "Role '$role_name' already exists in $config_path. Re-run with --update-existing to modify it." >&2
  exit 1
fi

expr='.agents[$role_name].description = $role_description |
      .agents[$role_name].config_file = $role_config_file'

if [[ "$set_multi_agent" == "true" ]]; then
  expr+=' | .features.multi_agent = true'
fi

if [[ "$write_backup" == "true" ]]; then
  cp "$config_path" "${config_path}.bak"
fi

tmp_file="$(mktemp)"
tomlq -t \
  --arg role_name "$role_name" \
  --arg role_description "$role_description" \
  --arg role_config_file "$role_config_file" \
  "$expr" \
  "$config_path" > "$tmp_file"

mv "$tmp_file" "$config_path"

echo "Installed role '$role_name' in $config_path"
echo "Role config file: $role_config_file"
