<img width="721" height="321" alt="image" src="https://github.com/user-attachments/assets/28bb993b-4c49-4107-9e65-d6bfa6bf21a4" />

# CodexSkills

A collection of Codex/agent skills. Check the /skills/ folder for a library of skills (like the OpenAI Developer Documenation Skill)

## Install with codexskills (recommended)

Install a single skill into your user scope (installs globally for all projects):

```bash
npx codexskills --user am-will/codex-skills/skills/openai-docs-skill
```

Install all skills (or pick from the list):

```bash
npx codexskills --user am-will/codex-skills/skills
```

Install into a project (install to just one specific project):

```bash
npx codexskills --project am-will/codex-skills/skills /path/to/your/project
```

Install skills from other Github repositories:

All of the above commands work for any Github Skill repository:

```bash
npx codexskills --project https://github.com/numman-ali/n-skills/tree/main/skills /path/to/your/project
```

Notes:
- When multiple skills are found, codexskills prompts you to choose (space to toggle, enter to confirm).
- When you post a path to just one skill, it will not prompt you "are you sure?"
