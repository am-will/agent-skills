# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a collection of Codex/Claude Code skills that extend AI agent capabilities through modular, self-contained packages. Skills are organized in the `/skills/` directory with each skill containing a `SKILL.md` file (YAML frontmatter + markdown instructions) and optional bundled resources (scripts, references, assets).

## Architecture

### Skill Structure

Each skill follows this pattern:
```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name + description)
│   └── Markdown instructions
└── Optional: scripts/, references/, assets/
```

**Key principles:**
- Skills use progressive disclosure: metadata (always loaded) → SKILL.md body (when triggered) → bundled resources (as needed)
- The `description` field in YAML frontmatter is the primary triggering mechanism
- Skills should be concise - context window is a shared resource

### Skill Types in this Repo

1. **Agent orchestration skills** (`codex-subagent`, `llm-council`, `planner`, `parallel-task`)
   - Spawn and coordinate multiple AI agents
   - Handle complex multi-step workflows
   - Manage parallel task execution

2. **Documentation access skills** (`context7`, `openai-docs-skill`, `read-github`)
   - Fetch up-to-date library docs
   - Query documentation via APIs or MCP servers
   - Convert URLs to LLM-friendly formats

3. **Domain expertise skills** (`frontend-design`, `frontend-responsive-ui`, `vercel-react-best-practices`)
   - Provide specialized patterns and best practices
   - Imported from authoritative sources (Anthropic, Vercel)

4. **Tool integration skills** (`agent-browser`, `gemini-computer-use`)
   - Browser automation and computer control
   - Integrate external tools into agent workflows

## Working with Skills

### Creating New Skills

Use the skill-creator workflow (available via `/skill-creator` or from `~/.claude/skills/skill-creator`):

1. **Understand concrete examples** - How will users invoke this skill?
2. **Plan reusable contents** - What scripts/references/assets are needed?
3. **Initialize**: `python3 /path/to/skill-creator/scripts/init_skill.py <skill-name> --path ./skills`
4. **Edit SKILL.md**:
   - Write comprehensive `description` in YAML frontmatter (this triggers the skill)
   - Keep instructions concise and imperative
   - Move detailed content to `references/` files if SKILL.md approaches 500 lines
5. **Package**: `python3 /path/to/skill-creator/scripts/package_skill.py ./skills/<skill-name>`

**Important**: The `description` field must include both what the skill does AND when to use it. Only content in the description is available before the skill triggers.

### Modifying Existing Skills

1. Read the skill's SKILL.md to understand current structure
2. For prompts being converted to skills (like `/prompts/*.md`):
   - Optimize for conciseness (remove verbosity, keep essential workflow)
   - Extract the "when to use" triggers for the description field
   - Use imperative/infinitive form for instructions
3. Test the skill, then package it

### Installing Skills

**To Codex (`~/.codex/skills/`):**
```bash
cp -r ./skills/<skill-name> ~/.codex/skills/
```

**To Claude Code (`~/.claude/skills/`):**
```bash
cp -r ./skills/<skill-name> ~/.claude/skills/
```

**Via codexskills CLI:**
```bash
npx @am-will/codexskills --user am-will/codex-skills/skills/<skill-name>
```

## Key Patterns

### Agent Orchestration Pattern

Skills like `codex-subagent`, `llm-council`, `planner`, and `parallel-task` follow this pattern:
- Intake/clarification phase (ask questions to build context)
- Prompt generation (create detailed prompts for subagents)
- Parallel execution (launch multiple agents via background shells)
- Collection/synthesis (gather results, merge, validate)

**Important for llm-council**: Do NOT yield/finish the response until the full 30-minute timer completes and `final-plan.md` is saved. The session must stay open to prevent premature termination.

### Progressive Disclosure Pattern

When a skill supports multiple variations (frameworks, domains, etc.):
- Keep core workflow in SKILL.md
- Move variant-specific details to `references/<variant>.md`
- Reference these files clearly from SKILL.md with "when to read" guidance

Example: `llm-council` has `references/rubric.md` and `references/templates/` that are loaded as needed.

## Distribution

Skills are packaged as `.skill` files (zip archives with `.skill` extension) containing the skill directory structure. The packaging script validates before creating the archive.

**Publishing to npm**: This repo publishes `@am-will/codexskills` which includes a CLI installer that can fetch skills from GitHub repos and install them to user or project scope.
