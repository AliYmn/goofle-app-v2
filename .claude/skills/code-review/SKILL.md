---
description: When the user asks for a code review, PR review, or quality check on changed files
---

# Code review skill

Review code changes with a structured, severity-based approach.

## Steps

1. Identify changed files via `git diff main...HEAD --name-only`
2. For each file, analyze:
   - Type safety and correct annotations
   - Error handling completeness
   - Security concerns (hardcoded secrets, injection, unvalidated input)
   - Test coverage for new logic
   - Naming clarity and consistency with project conventions
3. Check for unused imports, dead code, and leftover debug statements
4. Present findings grouped by severity:
   - **Critical** — Must fix before merge (security, data loss, crashes)
   - **Warning** — Should fix, not blocking (missing tests, unclear names)
   - **Suggestion** — Nice to have improvements

## Output format

```
## Review: [branch name]

### Critical
- [file:line] Description of issue

### Warnings
- [file:line] Description of issue

### Suggestions
- [file:line] Description of improvement

### Summary
X files reviewed. Y issues found (Z critical).
```
