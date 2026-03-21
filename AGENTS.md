# Gooflo -- Agent Reference

AI-powered photo transformation mobile app where users create, share, and compete with AI-generated images.

## Tech Stack

React Native 0.77 + Expo SDK 52, TypeScript (strict), Expo Router, NativeWind v4, Zustand, MMKV, Supabase (auth + DB + storage + edge functions), RevenueCat, PostHog, Sentry, i18n-js (TR + EN).

## Commands

- `make install` -- install deps
- `make dev` -- start Expo dev server
- `make ios` / `make android` -- run on device/simulator
- `make supabase-start` -- local Supabase
- `make db-migrate` -- push migrations
- `make edge-deploy` -- deploy all edge functions
- `make edge-serve` -- serve edge functions locally
- `npm run lint` -- lint

## Architecture

- `app/` -- Expo Router pages: (auth), (onboarding), (tabs), generation/[id], mod/[slug], collection/[id]
- `components/` -- ui/ (reusable), screens/ (EmptyState, ErrorState), navigation/ (TabBar)
- `stores/` -- Zustand: useAuthStore, useCreditStore, useFeedStore, useGenerationStore, useStreakStore, useSubscriptionStore, useThemeStore
- `lib/` -- supabase client, auth, purchases, analytics, haptics, i18n, animations
- `hooks/` -- useGeneration
- `supabase/functions/` -- 16 Deno edge functions
- `supabase/migrations/` -- PostgreSQL migrations

## Conventions

- Path alias: `@/*` from project root
- Client env vars: `EXPO_PUBLIC_` prefix required
- Stores: `use[Domain]Store` naming
- Brand color: lime #BFFF00, dark bg: #1A1A1A
- NativeWind dark mode via `class` strategy

## Rules

- Never commit .env files
- Never modify applied migrations
- Never expose service role key in client code
- Plan before building for 3+ file changes
- Log work to tasks/changelog.md
