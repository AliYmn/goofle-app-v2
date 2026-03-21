---
description: When the user asks to refactor code, extract a module, simplify logic, or reduce complexity
---

# Refactor skill

Refactor code safely with verification at every step.

## Steps

1. **Analyze** — Read the target code, identify the smell or complexity
2. **Plan** — Write refactor plan to tasks/todo.md:
   - What will change
   - What should NOT change (preserve behavior)
   - Which tests cover the affected code
3. **Baseline** — Run existing tests, record results
4. **Refactor** — Apply changes incrementally:
   - Extract → rename → simplify → clean up
   - One transformation at a time
5. **Verify** — Run tests after each transformation
   - If a test fails: revert the last change, investigate
6. **Compare** — Ensure test results match baseline
7. **Log** — Update tasks/changelog.md with what was refactored and why

## Principles

- Behavior must not change — refactoring is structure-only
- If no tests cover the code, write tests FIRST, then refactor
- Prefer many small safe steps over one big rewrite
- If the refactor touches 5+ files, pause and confirm the plan with the user
