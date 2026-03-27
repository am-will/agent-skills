---
name: pluginstaller
description: Add a Codex plugin from a GitHub repo to a repo or personal marketplace using the current Codex plugin layout and marketplace metadata.
---

# Pluginstaller

Use when the user gives a GitHub repo for a Codex plugin and wants it available in Codex.

Follow the current Codex plugin docs. Do not invent alternate install flows.

## Inputs

- GitHub repo URL or `owner/repo`
- Install scope: `repo` or `personal`
- If the repo contains more than one plugin root, ask which plugin folder to install.

## Workflow

0. If the user does not specify whether the plugin should be repo-scoped or personal, stop and ask.
1. Fetch the repo and locate the plugin root by finding `.codex-plugin/plugin.json`.
2. Read `.codex-plugin/plugin.json` and validate the canonical structure:
   - `name`, `version`, and `description` should exist.
   - Bundled paths such as `skills`, `apps`, and `mcpServers` should be relative to the plugin root and start with `./`.
   - Only `plugin.json` should live inside `.codex-plugin/`.
3. Prefer the built-in `@plugin-creator` skill when the task is to scaffold a new local plugin or add an existing local plugin to a marketplace. Use the manual path below when you are wiring up a repo the user already provided.
4. Copy the entire plugin directory, not just `SKILL.md`, into a marketplace-visible location. Default to the documented standard locations unless the repo already uses a different valid marketplace-relative path:
   - `repo`: `$CWD/plugins/<plugin-name>` and `$CWD/.agents/plugins/marketplace.json`
   - `personal`: `~/.codex/plugins/<plugin-name>` and `~/.agents/plugins/marketplace.json`
5. Preserve the full bundle at the plugin root, including sibling `skills/`, `.app.json`, `.mcp.json`, `assets/`, and any other plugin files. Do not move those files under `.codex-plugin/`.
6. Create or update the marketplace file with the documented schema:
   - top-level marketplace `name`
   - optional `interface.displayName`
   - plugin entry `name`
   - `source.source = "local"`
   - `source.path` relative to the marketplace root:
     - `repo`: `./plugins/<plugin-name>`
     - `personal`: `./.codex/plugins/<plugin-name>`
   - `policy.installation`
   - `policy.authentication`
   - `category`
7. Use marketplace values that match the docs unless the user says otherwise:
   - `policy.installation = "AVAILABLE"`
   - `policy.authentication = "ON_INSTALL"`
   - `category` from `interface.category` when present, otherwise `Productivity`
8. Merge into any existing marketplace file instead of replacing it.
9. Restart Codex and verify the plugin appears in `/plugins`.
10. Report the runtime behavior accurately:
   - The marketplace entry points to the source plugin directory.
   - Codex installs the plugin into `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`.
   - For local plugins, the installed cache version is `local`.
   - Plugin enabled or disabled state is stored in `~/.codex/config.toml`.

## Rules

- Prefer the terms `repo marketplace` and `personal marketplace` over `workspace` and `global`.
- Do not present copying into `plugins/` as the complete install. The marketplace entry is what makes the plugin discoverable in Codex.
- Do not flatten or rename the plugin bundle.
- Keep the plugin `name` stable and consistent across folder, manifest, and marketplace entry.
- Keep manifest and marketplace paths relative and `./`-prefixed where the docs require it.
- Treat the documented repo and personal plugin directories as defaults, not absolute requirements, as long as the marketplace `source.path` remains valid and stays inside the marketplace root.
- If the repo already ships a marketplace file, prefer it as the source of truth for marketplace ordering and metadata, and only add or update the plugin entry that is needed.
- If the manifest is missing required basics or uses invalid root-relative paths, fix the plugin structure before claiming installation is complete.

## Scope guide

Use `repo` when the plugin should live with one repo or be shared through that repo's marketplace. Use `personal` when the plugin should be available from the user's own Codex setup across projects.
