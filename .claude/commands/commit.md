---
description: Creates well-formatted conventional commits by analyzing staged changes
allowed-tools:
  - Bash(git add:*)
  - Bash(git status:*)
  - Bash(git commit:*)
  - Bash(git diff:*)
  - Bash(git log:*)
---

Create a git commit for the current changes.

## Process

1. Run `git status` to check staged files
2. If nothing is staged, run `git diff --name-only` and ask which files to stage
3. Run `git diff --cached` to analyze what's being committed
4. Check `git log --oneline -5` to match existing commit style
5. Determine if changes should be one commit or split into multiple atomic commits
6. Generate commit message following conventional format
7. Show the message and ask for confirmation before committing

## Commit format

```
type(scope): short description

Longer explanation if the change is non-obvious.
```

Types: feat, fix, refactor, docs, test, chore, perf, ci, build, style

## Rules

- One logical change per commit — if the diff has unrelated changes, suggest splitting
- Subject line max 72 characters, imperative mood ("add" not "added")
- No emoji in commit messages
- Scope is optional but recommended for larger codebases
- Body explains WHY, not WHAT (the diff shows what)
- Reference issue numbers when applicable: "fixes #42"

If $ARGUMENTS contains "push": also push to the current branch after committing.
If $ARGUMENTS contains "all": stage all modified files before committing.
