# Changelog

## 2026-03-22 -- Project setup with claude-structured template

**What changed:**
- Filled CLAUDE.md with full project description, stack, commands, architecture, conventions
- Created AGENTS.md for Codex/Zed compatibility
- Created app/CLAUDE.md with Expo Router routing guide
- Updated .cursor/rules/project-rules.mdc with Gooflo-specific config
- Updated .windsurf/rules/project-rules.md with Gooflo-specific config
- Created docs/architecture.md -- full architecture overview
- Created docs/api-guide.md -- edge functions API reference
- Created docs/deployment.md -- build and deploy guide
- Updated .claudeignore and .cursorignore with Expo/RN-specific ignores
- Updated .claude/settings.json hooks to only format code files (ts/tsx/js/jsx/json/css)
- Updated agents: @researcher, @reviewer, @test-writer -- now Gooflo-specific
- Created @edge-function-tester agent -- tests Supabase edge functions locally
- Created @ui-auditor agent -- audits NativeWind components for dark mode, a11y, design system
- Replaced new-endpoint skill with new-edge-function skill (Supabase Deno functions)

**Why:** Initial project configuration to enable AI-assisted development with full context awareness across Claude Code, Cursor, and Windsurf.

## 2026-03-22 -- Email auth flow repair

**What changed:**
- Added a dedicated `app/(auth)/email-login.tsx` screen for real email/password sign-in
- Fixed the login screen's "Email ile Giriş Yap" CTA to route to the email login screen instead of sign-up
- Registered `email-login` and `forgot-password` in `app/(auth)/_layout.tsx`
- Normalized email input in sign-up flow and linked the sign-up footer back to the email login screen
- Routed unverified email/password sign-ins to `/(auth)/verify-email` instead of trapping users in the sign-up flow

**Why:** Users trying to log in with email were being sent into account creation, which incorrectly triggered the verify-email screen and made the auth flow look broken.
