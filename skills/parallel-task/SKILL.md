---
name: parallel-task
description: >
  Only to be triggered by explicit /parallel-task commands. 
---

# Parallel Task Executor

You are an Orchestrator for subagents. Use orchestration mode to parse plan files and delegate tasks to parallel subagents using task dependencies, in a loop, until all tasks are completed. Your role is to ensure that subagents are launched in the correct order (in waves), and that they complete their tasks correctly, as well as ensure the plan docs are updated with logs after each task is completed.

## Process

### Step 1: Parse Request

Extract from user request:
1. **Plan file**: The markdown plan to read
2. **Task subset** (optional): Specific task IDs to run

If no subset provided, run the full plan.

### Step 2: Read & Parse Plan

1. Find task subsections (e.g., `### T1:` or `### Task 1.1:`)
2. For each task, extract:
   - Task ID and name
   - **depends_on** list (from `- **depends_on**: [...]`)
   - Full content (description, location, acceptance criteria, validation)
3. Build task list
4. If a task subset was requested, filter the task list to only those IDs and their required dependencies.

### Step 3: Launch Subagents

For each **unblocked** task, launch subagent with:
- **description**: "Implement task [ID]: [name]"
- **prompt**: Use template below

Launch all unblocked tasks in parallel. A task is unblocked if all IDs in its depends_on list are complete.

### Task Prompt Template

```
You are implementing a specific task from a development plan.

## Context
- Plan: [filename]
- Goals: [relevant overview from plan]
- Dependencies: [prerequisites for this task]
- Related tasks: [tasks that depend on or are depended on by this task]
- Constraints: [risks from plan]

## Your Task
**Task [ID]: [Name]**

Location: [File paths]
Description: [Full description]

Acceptance Criteria:
[List from plan]

Validation:
[Tests or verification from plan]

## Instructions
1. Examine working plan and any relevant or dependent files
2. Implement changes for all acceptance criteria
3. Keep work **atomic and committable**
4. For each file: read first, edit carefully, preserve formatting
5. Run validation if feasible
6. **ALWAYS mark completed tasks IN THE *-plan.md file AS SOON AS YOU COMPLETE IT!** and update with:
    - Concise work log
    - Files modified/created
    - Errors or gotchas encountered
7. Commit your work
   - Note: There are other agents working in parallel to you, so only stage and commit the files you worked on. NEVER PUSH. ONLY COMMIT.
8. Double Check that you updated the *-plan.md file and committed your work before yielding
9. Return summary of:
   - Files modified/created
   - Changes made
   - How criteria are satisfied
   - Validation performed or deferred

## Important
- Be careful with paths
- Stop and describe blockers if encountered
- Focus on this specific task
```

Ensure that the agent marked its task complete before moving on to the next task or set of tasks.

### Step 4: Check and Validate.

After a wave of subagents complete their work:
1. Inspect their outputs for correctness and completeness.
2. Validate the results against the expected outcomes.
3. If the task is truly completed correctly, ENSURE THAT TASK WAS MARKED COMPLETE WITH LOGS.
4. If a task was not successful, have the agent retry or escalate the issue.
5. Ensure that that wave of work has been committed to github before moving on to the next wave of tasks.

### Step 5: Repeat

1. Review the plan again to see what new set of unblocked tasks are available.
2. Continue launching unblocked tasks in parallel until plan is done.
3. Repeat the process until *all** tasks are both complete, validated, and working without errors. 


## Error Handling

- Task subset not found: List available task IDs
- Parse failure: Show what was tried, ask for clarification

## Example Usage

```
/parallel-task plan.md
/parallel-task ./plans/auth-plan.md T1 T2 T4
/parallel-task user-profile-plan.md --tasks T3 T7
```

## Execution Summary Template

```markdown
# Execution Summary

## Tasks Assigned: [N]

### Completed
- Task [ID]: [Name] - [Brief summary]

### Issues
- Task [ID]: [Name]
  - Issue: [What went wrong]
  - Resolution: [How resolved or what's needed]

### Blocked
- Task [ID]: [Name]
  - Blocker: [What's preventing completion]
  - Next Steps: [What needs to happen]

## Overall Status
[Completion summary]

## Files Modified
[List of changed files]

## Next Steps
[Recommendations]
```
