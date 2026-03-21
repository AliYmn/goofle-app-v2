---
trigger: always_on
---

# Project: Gooflo

AI-powered photo transformation mobile app where users create, share, and compete with AI-generated images.

## Tech Stack

- React Native 0.77 + Expo SDK 52 + TypeScript (strict)
- Expo Router (file-based routing, typed routes)
- NativeWind v4 (TailwindCSS) + Nunito font
- Zustand + MMKV (state + persistence)
- Supabase (auth, PostgreSQL, storage, Deno edge functions)
- RevenueCat (IAP), PostHog (analytics), Sentry (errors)
- i18n-js (Turkish + English)
- npm, EAS Build

## Commands

- `make install` -- install deps
- `make dev` -- start Expo dev server
- `make ios` / `make android` -- run on device
- `make supabase-start` -- local Supabase
- `make db-migrate` -- push migrations
- `make edge-deploy` -- deploy edge functions
- `npm run lint` -- lint

## Architecture

- `app/` -- Expo Router: (auth), (onboarding), (tabs), generation/[id], mod/[slug], collection/[id]
- `components/` -- ui/ (reusable), screens/ (empty/error states), navigation/ (TabBar)
- `stores/` -- Zustand: useAuthStore, useCreditStore, useFeedStore, useGenerationStore, useStreakStore, useSubscriptionStore, useThemeStore
- `lib/` -- supabase, auth, purchases, analytics, haptics, i18n, animations
- `supabase/functions/` -- 16 Deno edge functions
- `supabase/migrations/` -- PostgreSQL migrations

## Conventions

- Path alias: `@/*` from project root
- Client env vars: `EXPO_PUBLIC_` prefix required
- Stores: `use[Domain]Store` naming
- Brand: lime #BFFF00, dark bg #1A1A1A
- NativeWind dark mode via `class` strategy

## Important

- NEVER commit .env files
- NEVER modify applied migration files

## Behavior

- Plan before building for 3+ file changes
- If it fails twice, stop and re-plan
- After corrections: update tasks/lessons.md
- Never mark done without running tests
- Log completed work to tasks/changelog.md

## Task tracking

Read at session start:
- tasks/todo.md -- current plan
- tasks/changelog.md -- recent changes
- tasks/lessons.md -- patterns from past corrections
