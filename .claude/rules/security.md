# Security Rules

## Secrets

- NEVER hardcode secrets, API keys, or tokens in source code
- NEVER commit .env files — only .env.example with placeholders
- Load secrets from environment variables with startup validation
- If a secret leaks into git history, rotate it immediately

## Input

- ALL user input must be validated server-side before processing
- Use parameterized queries — never string-concatenate SQL/queries
- Sanitize strings: strip whitespace, enforce length limits
- File uploads: validate MIME type, enforce size limits

## Data Protection

- Passwords hashed (bcrypt/argon2), NEVER plaintext
- Sensitive data (passwords, tokens, PII) must never appear in logs or error responses
- Rate limit authentication and sensitive endpoints
- Keep dependencies updated — audit regularly
