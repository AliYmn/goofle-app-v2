---
trigger: always_on
---

# Testing rules

## Structure

- Unit tests: no DB, no network — test logic in isolation
- Integration tests: with real services — verify system behavior
- Test names describe behavior: "should return 404 when user does not exist"
- Each test tests ONE behavior — follow Arrange → Act → Assert

## Writing tests

- Use factories for test data, not raw objects
- Mock at boundaries: mock the database client, not internal functions
- Prefer dependency injection over monkey-patching
- If you need 3+ mocks, the code under test probably does too much — refactor

## Coverage

- 80%+ on business logic (services, domain)
- Don't chase 100% — diminishing returns on config, types, trivial code
- Uncovered lines in critical paths are bugs waiting to happen
