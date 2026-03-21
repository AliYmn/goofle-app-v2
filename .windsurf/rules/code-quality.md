---
trigger: model_decision
description: Code quality, naming, patterns, and error handling
---

# Code quality

- Functions/variables describe what they DO, not what they ARE
- Booleans: is/has/can/should prefix
- Composition over inheritance
- Pure functions, minimize side effects
- Early returns to reduce nesting
- Functions under 40 lines
- Domain-specific error types, no silent catches
- Group imports: stdlib → third-party → local
- No wildcard imports
