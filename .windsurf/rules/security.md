---
trigger: model_decision
description: Security rules for secrets, input validation, and data protection
---

# Security

- NEVER hardcode secrets, API keys, or tokens
- NEVER commit .env files — only .env.example
- ALL user input validated server-side
- Parameterized queries only — no string concatenation
- Passwords: bcrypt/argon2, NEVER plaintext
- Sensitive data never in logs or error responses
- Rate limit auth endpoints
- Audit dependencies regularly
