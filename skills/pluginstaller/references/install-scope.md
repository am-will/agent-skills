# Install Scope Notes

- Prefer `repo marketplace` and `personal marketplace` terminology.
- `repo` marketplace:
  - Copy the plugin directory to `$CWD/plugins/<plugin-name>`.
  - Write or update `$CWD/.agents/plugins/marketplace.json`.
  - Use `source.path: "./plugins/<plugin-name>"`.
- `personal` marketplace:
  - Copy the plugin directory to `~/.codex/plugins/<plugin-name>`.
  - Write or update `~/.agents/plugins/marketplace.json`.
  - Use `source.path: "./.codex/plugins/<plugin-name>"`.
- Codex resolves `source.path` relative to the marketplace root, not relative to `.agents/plugins/`.
- Those plugin directories are the documented defaults, not hard requirements, if another marketplace-relative path is already in use.
- Marketplace entries should also include `policy.installation`, `policy.authentication`, and `category`.
- The marketplace makes the plugin discoverable; Codex installs the runnable copy into `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`.
- For local plugins, the installed cache version is `local`.
- After changing the plugin or marketplace files, restart Codex and verify the plugin in `/plugins`.
