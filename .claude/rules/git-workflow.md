# Git workflow rules

## Branches

- Never commit directly to main/master
- Feature branches: feature/short-description or feature/TICKET-123
- Fix branches: fix/short-description
- Always branch from latest main

## Commits

- Atomic commits — one logical change per commit
- Run tests before committing — don't commit broken code
- If a diff contains unrelated changes, split into separate commits
- Use /project:commit for consistent conventional commit messages

## Pull requests

- Keep PRs focused — one feature or fix per PR
- PR title follows the same conventional commit format
- PR description should explain what and why, not how
- Link related issues

## Safety

- Never force push to shared branches
- Never rebase commits that others have pulled
- Always pull before pushing
- Use git stash if you need to switch context
