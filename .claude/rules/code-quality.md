# Code Quality Rules

## Naming

- Functions/variables describe what they DO, not what they ARE
- Boolean variables: use is/has/can/should prefix (isActive, hasPermission)
- Avoid abbreviations unless universally understood (id, url, api — ok; usr, mgr, btn — not ok)
- File names match the primary export they contain

## Patterns

- Prefer composition over inheritance
- Prefer pure functions — minimize side effects
- One module does one thing well
- Use early returns to reduce nesting depth
- Keep functions under 40 lines — split if longer
- Use dependency injection over hard-coded dependencies

## Error Handling

- Create domain-specific error types (UserNotFoundError, InsufficientBalanceError)
- Never swallow errors silently — no empty catch blocks
- Include context in error messages: what failed, why, and with what input
- Let errors bubble to the appropriate handler — don't catch too early

## Imports

- Group: stdlib → third-party → local
- Use absolute imports from project root, not deep relative paths
- Never use wildcard imports
