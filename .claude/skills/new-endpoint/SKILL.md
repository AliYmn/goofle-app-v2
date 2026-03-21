---
description: When the user asks to create a new API endpoint, route, or handler
---

# New endpoint skill

Create a complete API endpoint following the project's layered architecture.

## Steps

1. **Spec** — Clarify with the user if not obvious:
   - HTTP method and path
   - Request body / query params
   - Response shape (follow project's standard format)
   - Auth requirements
2. **Schema** — Create request/response validation schemas
3. **Repository** — Add data access functions if new queries are needed
4. **Service** — Implement business logic
5. **Handler** — Create the route handler (thin — delegates to service)
6. **Register** — Wire the route into the application router
7. **Test** — Write tests:
   - Unit test for the service logic
   - Integration test for the full HTTP request/response cycle
   - Test error cases (400, 401, 404, 409)
8. **Verify** — Run tests, show example request/response
9. **Log** — Update tasks/changelog.md

## Checklist

- Input validation on all user-provided data
- Proper error responses with meaningful error codes
- Auth middleware applied if endpoint requires authentication
- Rate limiting on sensitive endpoints
- Response follows project's standard shape
