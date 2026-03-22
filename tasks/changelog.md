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

## 2026-03-22 -- Onboarding icon consistency

**What changed:**
- Replaced emoji-based onboarding markers with `Ionicons` in `components/ui/OnboardingArtwork.tsx`
- Switched onboarding artwork and welcome screen to use the splash asset instead of the plain app icon
- Updated `app/(onboarding)/welcome.tsx` to visually match the lime splash treatment

**Why:** Some devices rendered the emoji placeholders as question-mark boxes, and the onboarding visuals did not match the splash screen's style.

## 2026-03-22 -- Feed redesign

**What changed:**
- Reworked the feed screen with a brand-aligned hero header using lime, off-white, coral accent, and Nunito-heavy typography
- Hydrated feed cards with user, mod, and like-count context so cards feel editorial instead of anonymous
- Redesigned image cards and loading skeletons to match the new feed layout and surface system
- Tightened the feed header spacing so the lime hero now sits flush with the screen instead of floating inside extra padding
- Redesigned `generation/[id]` to use the same feed visual language with creator/mod metadata, stronger action hierarchy, and cleaner public/private controls

**Why:** The old feed looked flat and generic, and it was not using the visual hierarchy or color balance defined in `brand/brand.md`.

## 2026-03-22 -- P1 core features implementation

**What changed:**
- Community mod creation screen (app/create-mod.tsx) with name, category, prompt, auto-thumbnail
- Prompt library (app/prompt-library.tsx) with voting, copy, share, create-mod-from-prompt
- Settings expanded with notification and privacy sections
- expo-clipboard installed for prompt copy feature
- TR/EN translations for all new features

**Why:** Implementing remaining P1 features from project spec to reach MVP completeness.

## 2026-03-22 -- P4 improvements: deep linking, NSFW, rate limiting, device fingerprint

**What changed:**
- Deep linking: iOS associatedDomains, Android intentFilters, Expo Router origin set
- NSFW filter: on-generation-complete checks has_nsfw_concepts, fails + refunds if detected
- Rate limiting: create-generation-job limits to 10 generations/hour per user
- Device fingerprint: expo-application installationId sent in signup metadata
- Pro screen checkmark emoji replaced with Ionicons

**Why:** Security hardening and platform compliance before production launch.

## 2026-03-22 -- UI/UX audit fixes: feed bug, icon confusion, Android crash

**What changed:**
- Fixed blank feed bug: `useAuthStore.initialize()` wrapped in try/catch so `isLoading` always resolves
- StreakBadge cold state (< 7 days): icon changed from `flash+lime` to `calendar-outline+blue` -- distinct from CreditPill
- verify-email: replaced `📬` emoji with `Ionicons mail-outline` (brand compliance)
- `Alert.prompt` (iOS-only crash on Android) replaced with cross-platform Modal + TextInput in profile.tsx and generation/[id].tsx
- explore.tsx: errors now show ErrorState instead of silent empty state; search placeholder uses i18n; clear button is adaptive to color scheme
- Design token cleanup: `bg-[#F5F5F5]` → `bg-off-white`, `bg-[#1C1C1C]` → `bg-dark`, `border-[#BFFF00]` → `border-lime`
- profile.tsx: collection `›` text → Ionicons `chevron-forward`; active tab token cleanup
- i18n: added `common.user`, `generation.saveFailed`, `profile.emptyCreations`, `streak.dayLabel`, `mods.searchPlaceholder` (en + tr)
- StreakBadge `gün` hardcode → `t('streak.dayLabel')`

**Why:** User reported feed not loading, streak/credit showing same icon, and general design quality issues. Root causes: auth initialization not fault-tolerant, semantically identical icon treatment for two different metrics, and emoji fallbacks in several brand-critical screens.

## 2026-03-22 -- Technical hardening and Create Screen redesign

**What changed:**
- **Create Screen Redesign:** Full overhaul of `app/(tabs)/create.tsx` using Gooflo brand guidelines. High-contrast layout, `bg-off-white`, visual mod selection with thumbnails, improved photo upload area with `Ionicons`, and polished custom prompt field.
- **Explore Screen Refresh:** Updated `app/(tabs)/explore.tsx` with brand tokens, `font-heading`, and improved spacing/layout for Gen Z feel.
- **Email Verification Flow:** Added active polling and functional "Resend Email" button to `verify-email.tsx`.
- **App Resilience:** Hardened `useAppGate` hook to prevent bypassing maintenance/force-update on fetch errors. Added `server-error` handling in root layout.
- **Error Handling:** Integrated explicit Supabase error handling and Toast notifications in `Profile` and `GenerationDetail` screens.
- **Race Condition Fix:** Implemented timestamp-based fetch tracking in `useAuthStore.fetchUser` to prevent stale data updates.
- **Asset Migration:** Converted all remaining image fallbacks to `expo-image` and swapped emojis for `Ionicons` in `ModCard` and `ImageCard`.
- **Dynamic Layout:** Refactored `ProfileScreen` to use `useWindowDimensions` for orientation-stable grid sizing.

**Why:** The Create screen was identified as visually poor and technically basic. The app also had several "silent failure" points and race condition risks that needed hardening for production readiness.

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
