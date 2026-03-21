# Autonomous Workflow Rules

## Plan Before Build

- Enter plan mode for any task that touches 3+ files or involves architectural decisions
- Write the plan to tasks/todo.md with checkable items before implementing
- If something goes wrong mid-implementation, STOP and re-plan — don't push through
- For simple, obvious fixes (typos, single-line changes): just do it, no plan needed

## Use Subagents Strategically

- Offload research, exploration, and codebase scanning to subagents
- Keep main context window focused on the current implementation
- One task per subagent — don't overload a single subagent with multiple concerns
- For complex problems, use parallel subagents to investigate different angles

## Self-Improvement Loop

- After ANY correction from the user: update tasks/lessons.md with the pattern
- Write the lesson as a reusable rule, not a one-off fix
- Review tasks/lessons.md at session start for patterns relevant to the current task
- If the same type of mistake appears 3+ times: promote it to a rule in CLAUDE.md

## Verify Before Done

- Never mark a task complete without proving it works
- Run tests, check logs, demonstrate correctness
- For UI changes: describe what changed visually
- For API changes: show example request/response
- Ask yourself: "Would a senior engineer approve this PR?"

## Track Everything

- Log completed work to tasks/changelog.md with what changed, where, and why
- Update tasks/todo.md as you progress — check items off, add notes
- When context gets long, compact with: "preserve modified files, pending tasks, lessons"

## Demand Simplicity

- Make every change as simple as possible — impact minimal code
- If a fix feels hacky, pause and find the elegant solution
- No temporary fixes that become permanent — find root causes
- Skip over-engineering for straightforward problems

## Fix Bugs Autonomously

- When given a bug report: locate, diagnose, fix, test, report — no hand-holding needed
- Point at logs, errors, failing tests — then resolve them
- If you need more context, check the codebase first before asking the user
