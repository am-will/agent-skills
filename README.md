# CodexSkills

A collection of Codex/agent skills.

## Install with codexskills (recommended)

Install a single skill into your user scope:

```bash
npx codexskills --user am-will/codex-skills/skills/openai-docs-skill
```

Install all skills (or pick from the list):

```bash
npx codexskills --user am-will/codex-skills/skills
```

Install into a project:

```bash
npx codexskills --project am-will/codex-skills/skills /path/to/your/project
```

Notes:
- You can pass GitHub URLs (e.g. `https://github.com/am-will/codex-skills/skills`).
- When multiple skills are found, codexskills prompts you to choose (space to toggle, enter to confirm).
