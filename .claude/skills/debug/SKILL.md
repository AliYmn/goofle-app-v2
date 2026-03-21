---
description: When the user reports a bug, error, failing test, or unexpected behavior
---

# Debug skill

Systematic debugging — find root cause, not just symptoms.

## Steps

1. **Reproduce** — Understand the exact steps, input, and expected vs actual behavior
2. **Isolate** — Narrow down the location:
   - Check error messages, stack traces, logs
   - Search codebase for relevant functions and error strings
   - Use git log to check recent changes in the affected area
3. **Diagnose** — Identify root cause:
   - Trace the execution path from entry point to failure
   - Check edge cases: null/undefined, empty collections, boundary values
   - Look for the same pattern elsewhere in the codebase
4. **Fix** — Apply the minimal change that resolves the root cause
5. **Test** — Write a regression test that would have caught this bug
6. **Verify** — Run full test suite, confirm no regressions
7. **Log** — Update tasks/changelog.md and tasks/lessons.md if the bug reveals a pattern

## Principles

- Never guess — trace the actual execution path
- Fix the cause, not the symptom
- One fix per bug — don't bundle unrelated changes
- If the fix feels hacky, there's a deeper issue — keep digging
