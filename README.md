# CodexSkills

A collection of Codex/agent skills.

## Logo

Plain text:

```text
█████ █████ █████ █████ █   █ █████ █   █ █████ █     █     █████
█     █   █ █   █ █      █ █  █     █  █    █   █     █     █
█     █   █ █   █ █████   █   █████ █ █     █   █     █     █████
█     █   █ █   █ █      █ █      █ ██      █   █     █         █
█     █   █ █   █ █     █   █     █ █ █     █   █     █         █
█████ █████ █████ █████ █   █ █████ █  █  █████ █████ █████ █████
```

Terminal gradient (ANSI):

```bash
printf '\033[38;5;203m█████ █████ █████ █████ █   █ █████ █   █ █████ █     █     █████\033[0m\n'\
'\033[38;5;209m█     █   █ █   █ █      █ █  █     █  █    █   █     █     █\033[0m\n'\
'\033[38;5;209m█     █   █ █   █ █████   █   █████ █ █     █   █     █     █████\033[0m\n'\
'\033[38;5;208m█     █   █ █   █ █      █ █      █ ██      █   █     █         █\033[0m\n'\
'\033[38;5;167m█     █   █ █   █ █     █   █     █ █ █     █   █     █         █\033[0m\n'\
'\033[38;5;167m█████ █████ █████ █████ █   █ █████ █  █  █████ █████ █████ █████\033[0m\n'
```

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

## Install with OpenSkills

1) Install OpenSkills (one time):

```bash
npm i -g openskills
```

2) Install skills from this repo:

```bash
openskills install am-will/codex-skills
```

3) Sync skills into your AGENTS.md:

```bash
openskills sync
```

Note: `openskills sync` expects an existing `AGENTS.md` file to update.

### Optional: universal install

If you use multiple agents and want a shared `.agent/skills/` location:

```bash
openskills install am-will/codex-skills --universal
```

NOTE: You must run that command from your base HOME folder ~/, otherwise, it will install /.skills to your current working directory.

OpenSkills is created and maintained by Numman Ali. See the OpenSkills repo for full documentation and updates:

https://github.com/numman-ali/openskills
