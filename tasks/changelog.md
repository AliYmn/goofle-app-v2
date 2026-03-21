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

## 2026-03-22 -- Onboarding artwork fix

**What changed:**
- Added `components/ui/OnboardingArtwork.tsx` for deterministic local onboarding visuals
- Updated `app/(onboarding)/how-it-works.tsx` to use a real local artwork block above the step list
- Updated `app/(onboarding)/first-generate.tsx` to replace the emoji placeholder with a local launch artwork

**Why:** The post-splash onboarding screens did not actually render image assets, only emoji placeholders, which made the UI look like visuals were failing to load.

## 2026-03-22 -- P1 core features implementation

**What changed:**
- Community mod creation screen (app/create-mod.tsx) with name, category, prompt, auto-thumbnail
- Prompt library (app/prompt-library.tsx) with voting, copy, share, create-mod-from-prompt
- Settings expanded with notification and privacy sections
- expo-clipboard installed for prompt copy feature
- TR/EN translations for all new features

**Why:** Implementing remaining P1 features from project spec to reach MVP completeness.

## 2026-03-22 -- P2 UX states and P3 App Store readiness

**What changed:**
- PrePermission component (camera, gallery, notifications) with denied state redirect
- ForceUpdate screen + MaintenanceMode screen with auto-retry countdown
- useAppGate hook checking app_config for minimum_version and maintenance_mode
- Root layout gate: blocks app if force-update or maintenance needed
- ErrorState upgraded with i18n keys and rate-limit countdown timer
- ATT dialog (expo-tracking-transparency) moved before analytics.init() in root layout
- New routes registered in Stack: edit-profile, transaction-history, daily-challenge, create-mod

**Why:** UX polish for edge cases (permissions, maintenance, force update, rate limiting) and Apple App Store compliance (ATT before analytics).
