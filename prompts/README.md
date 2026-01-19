# Prompts

This folder contains reusable prompt templates that pair with the skills and planning workflow in this repo. Use them as standalone instructions for coding agents, or copy them into your own tooling.

## Files

- `prompts/planner.md`
  - General-purpose planning agent prompt.
  - Produces phased/sprint-based plans with atomic, committable tasks and clear validation steps.
  - Best used before implementation work begins.

- `prompts/parallel-task.md`
  - Task orchestration prompt that reads a plan and delegates tasks to subagents (when available).
  - Emphasizes thorough context transfer and atomic scope per task.

- `prompts/codex-plan.md`
  - Planning prompt intended for other coding agents to run **Codex xhigh** for planning.
  - Use this to generate a high-quality plan in one agent, then hand that plan to another agent for implementation.

## Suggested Workflow
1. Use `prompts/planner.md` (or `prompts/codex-plan.md` if you want Codex xhigh planning).
2. Review and refine the plan.
3. Use `prompts/parallel-task.md` to dispatch tasks for implementation.

## Notes
- These prompts are designed to be repo-agnostic.
- Customize wording or output templates to match your internal standards.
