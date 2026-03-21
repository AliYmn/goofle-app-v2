You are configuring this project to use the claude-structured template. Your goal is to understand the project and fill in all placeholder files with accurate, project-specific information.

Start by exploring the project silently — read config files, check directory structure, look at existing code. Then have a brief conversation with the user to confirm what you found and fill in gaps.

## What to detect on your own

Look at the project files to figure out:
- Language and framework (package.json, requirements.txt, go.mod, Cargo.toml, etc.)
- Package manager (which lock file exists)
- Available commands (scripts in package.json, Makefile targets, pyproject.toml scripts)
- Test framework (config files, test directories)
- Linter and formatter (config files)
- Directory layout (what's in src/, app/, lib/, etc.)
- Database (prisma/, alembic/, migrations/)
- Docker and CI/CD setup
- Environment variables (from .env.example or config files)

## What to ask the user

After detection, present what you found and ask only what you couldn't figure out:
- "What does this project do?" (one sentence for the project description)
- Confirm or correct the detected stack and commands
- "Any critical rules or gotchas I should know about?"
- "What environments do you deploy to?"

Keep it conversational. One or two questions, not an interrogation. If the project is simple and detection is clear, just confirm and move on.

## What to create and update

Based on what you learned, update these files:

**Fill in placeholders:**
- CLAUDE.md — project name, description, stack, commands, architecture, conventions
- AGENTS.md — same info for Codex/Zed users
- .cursor/rules/project-rules.mdc — stack, commands, conventions
- .windsurf/rules/project-rules.md — same

**Generate new files:**
- docs/architecture.md — based on actual project structure
- docs/api-guide.md — if the project has API endpoints (skip for CLI tools, libraries)
- docs/deployment.md — environments, env vars, deploy process
- src/CLAUDE.md — module map based on actual directories (skip if no src/)
- tests/CLAUDE.md — test layout based on actual test structure (skip if no tests/)
- .env.example — based on detected env vars

**Configure:**
- .claude/settings.json — set hooks to use the project's actual formatter and linter
- .claudeignore and .cursorignore — add framework-specific ignores

**Clean up:**
- Remove skills that don't apply (e.g., new-endpoint if this isn't an API)

**Suggest agents:**
- The template includes 3 default agents: @researcher (read-only exploration), @reviewer (code review), @test-writer (test generation). These work for any project.
- Based on what you detected, suggest 1-2 additional project-specific agents. Examples:
  - API project → suggest a `@api-tester` agent that tests endpoints against the running server
  - Frontend project → suggest a `@accessibility-checker` agent that audits components
  - Data project → suggest a `@schema-validator` agent that checks migrations and models
  - Monorepo → suggest a `@dependency-checker` agent that verifies cross-package imports
- Ask: "I think these additional agents would be useful for your project: [list]. Want me to create them?"
- If yes, create the agent files in `.claude/agents/` following the existing format

## After everything is done

Show the user a summary of what you created and changed. Ask if anything needs adjustment. Then log the setup to tasks/changelog.md and suggest running /project:catchup to verify.
