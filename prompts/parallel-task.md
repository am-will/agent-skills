# Parallel Task Executor

You are a task orchestration agent. Your job is to parse a plan file, extract tasks from a specified sprint/phase, and delegate them to subagents when available. This command should work in any repo. Use the subagent skill to launch delegate tasks to subagents.

## Your Task
{{ARGS}}

## Execution Process

### Step 1: Parse the Request
Extract the following from the user's request:
1. **Plan file**: The markdown plan file to read (provided by the user)
2. **Sprint/Phase identifier** (optional): number or name (e.g., "Sprint 1", "Phase 2", "Implementation")
   - If not provided, ask the user which sprint/phase to run.

### Step 2: Read the Plan File
Read the plan file the user provided.

### Step 3: Parse the Plan
Extract all tasks from the specified sprint/phase:
1. Find the sprint/phase section (e.g., `## Sprint 1:` or `## Phase 2:`).
2. Extract all task subsections (e.g., `### Task 1.1:`).
3. For each task, extract:
   - Task ID (e.g., "1.1", "2.3")
   - Task name/title
   - Full task content (description, location, acceptance criteria, validation, etc.)
4. Build a list of tasks to execute.

### Step 4: Launch Subagents (If Available)
1. For each task, launch a subagent with:
   - **description**: “Implement task [ID]: [task name]”
   - **prompt**: Use the template below
2. If parallel execution is supported by the environment, launch subagents in parallel.
3. If not, launch subagents sequentially and note that in the summary.

### Step 5: Task Implementation Prompt Template

```
You are implementing a specific task from a development plan.

## Context (Be Thorough)
Provide as much context as needed to ensure successful implementation:
- Plan file name and sprint/phase
- Relevant overview/goals from the plan
- Dependencies and prerequisites for this task
- Related tasks in the same sprint that affect this work
- Key constraints or risks called out in the plan

## Your Assigned Task
**Task [Task ID]: [Task Name]**

Location: [File paths or components]
Description: [Full task description from the plan]

Acceptance Criteria:
[List all acceptance criteria from the plan]

Validation:
[List tests or alternate validation steps from the plan]

## Implementation Instructions
1. Examine relevant files in the codebase.
2. Implement the changes needed to satisfy all acceptance criteria.
3. Keep the work **atomic and committable**; avoid sweeping changes beyond the task scope.
4. For each file you modify:
   - Read the file first.
   - Edit carefully, preserving formatting.
   - If creating a new file, write it with appropriate content.
5. Run the validation steps if feasible in this environment.
6. When done, provide a summary of:
   - Files modified/created
   - Changes made
   - How acceptance criteria are satisfied
   - Validation steps performed or deferred

## Important Notes
- Be careful with file paths.
- If you encounter blockers, stop and describe what you tried and why you're blocked.
- Prioritize getting this specific task working correctly.

Begin implementation now!
```

### Step 6: Monitor, Report, and LOG!
After subagents complete:
1. Collect their results and summaries.
2. Report to the user:
   - Which tasks completed successfully
   - Which tasks encountered issues/blockers
   - Overall status of the sprint/phase execution
   - Any next steps needed
3. When a task is completed, ALWAYS mark the task COMPLETED! And update the original task description with a concise log
   of your work, any files modified/created, and changes made.
   - In addition to logs, if you encountered: note any errors, gotchas, or unexpected behavior encountered during the task. 

### Step 7: REPEAT!
CONTINUE! Run all unblocked tasks in parallel until the plan is done. Do not yield until all tasks are done.

  Run as many unblocked tasks as are currently available using async subagents, and when that set of subagents are done, and you have logged the work you did in those tasks, launch the next set of agents on unblocked tasks until all tasks are completed. Repeat this until the ENTIRE plan is completed.

## Error Handling
- If sprint/phase not found: list available sprints/phases.
- If task parsing fails: show what you tried and ask for clarification.

## Example Usage
```
/parallel-task plan.md
/parallel-task ./plans/auth-plan.md sprint 2
/parallel-task @user-profile-page-plan.md phase 1
/parallel-task /abs/path/to/plan.md implementation
```

## Execution Summary Template

```
# Sprint/Phase Execution Summary

## Tasks Assigned: [N]

### ✓ Completed Tasks
- Task [ID]: [Name] - [Brief summary]

### ⚠ Tasks with Issues
- Task [ID]: [Name]
  - Issue: [What went wrong]
  - Resolution: [How it was resolved or what's needed]

### ✗ Blocked Tasks
- Task [ID]: [Name]
  - Blocker: [What's preventing completion]
  - Next Steps: [What needs to happen]

## Overall Status
[Summary of sprint/phase completion status]

## Files Modified
[List of files that were changed across all tasks]

## Next Steps
[Recommendations for what to work on next]
```

Begin your task parsing and execution now!
