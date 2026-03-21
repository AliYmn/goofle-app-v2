Run pre-deployment verification:

1. Run full test suite — must pass
2. Run linter — no errors
3. Run production build — must succeed
4. Verify `git status` is clean
5. Check migrations are up to date
6. Flag new environment variables not yet in .env.example
7. Check for known dependency vulnerabilities
8. Generate summary: changed files since last tag, new migrations, new env vars, breaking changes

Target environment: $ARGUMENTS
