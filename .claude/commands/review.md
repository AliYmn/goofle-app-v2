Review code changes in the current branch against main:

1. Run `git diff main...HEAD --name-only` to identify changed files
2. For each file check: type safety, error handling, security, test coverage, naming, consistency with CLAUDE.md
3. Check for unused imports and dead code
4. Present findings:
   - 🔴 CRITICAL — Must fix (security, data loss, crashes)
   - 🟡 WARNING — Should fix (missing tests, unclear names)
   - 🟢 SUGGESTION — Nice to have

Focus area (if specified): $ARGUMENTS
