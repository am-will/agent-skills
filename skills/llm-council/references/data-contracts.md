# Data Contracts

## Input: task_spec
- Required: `task` (string)
- Optional: `constraints` (array of strings), `repo_context`, `preferences`, `agents`
- Schema: `schemas/task_spec.schema.json`

## Planner Output: council_plan
- Required: summary, phases, risks, edge_cases, tests, assumptions
- Each phase includes tasks with steps, dependencies, and complexity
- Schema: `schemas/council_plan.schema.json`

## Judge Input
- task_spec + list of labeled plans (Plan 1/2/3) + rubric
- Schema: `schemas/judge_input.schema.json`

## Judge Output
- Scores, comparison notes, missing steps, contradictions, and merged plan draft
- Schema: `schemas/judge_output.schema.json`

## Final Output
- final_plan object + metadata (plans used, validation, warnings)
- Schema: `schemas/final_plan.schema.json`
