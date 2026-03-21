# Project: Gooflo

AI-powered photo transformation mobile app where users create, share, and compete with AI-generated images.

## Tech Stack

- **Runtime:** React Native 0.77 + Expo SDK 52
- **Language:** TypeScript (strict mode)
- **Routing:** Expo Router (file-based, typed routes)
- **Styling:** NativeWind v4 (TailwindCSS) + Nunito font family
- **State:** Zustand stores + MMKV for persistence
- **Backend:** Supabase (auth, PostgreSQL, storage, edge functions in Deno)
- **Payments:** RevenueCat (iOS + Android)
- **Analytics:** PostHog
- **Error tracking:** Sentry
- **i18n:** i18n-js (Turkish + English)
- **Auth:** Apple Sign In, Google Sign In, Email/Password
- **Animations:** react-native-reanimated
- **Package manager:** npm
- **Builds:** EAS Build (development, preview, production)

## Commands

| Command | Description |
|---|---|
| `make install` | Install dependencies and fix Expo versions |
| `make dev` | Start Expo dev server |
| `make ios` | Run on iOS simulator |
| `make android` | Run on Android emulator |
| `make supabase-start` | Start local Supabase |
| `make db-migrate` | Push migrations to Supabase |
| `make db-reset` | Reset local database |
| `make edge-deploy` | Deploy all edge functions |
| `make edge-deploy-one name=X` | Deploy single edge function |
| `make edge-serve` | Serve edge functions locally |
| `make build-ios` | Production iOS build |
| `make build-android` | Production Android build |
| `make build-preview-ios` | Preview iOS build |
| `make ota-update msg="..."` | OTA update via EAS |
| `npm run lint` | Run ESLint via Expo |

## Architecture

```
app/                    # Expo Router pages (file-based routing)
  (auth)/               # Auth flow: login, signup, verify-email
  (onboarding)/         # Onboarding: welcome, how-it-works, first-generate
  (tabs)/               # Main tab bar: explore, create, leaderboard, profile
  generation/[id].tsx   # Generation detail screen
  mod/[slug].tsx        # Mod detail screen
  collection/[id].tsx   # Collection detail screen
  settings.tsx          # Settings screen
  pro.tsx               # Pro subscription screen
  prompt-library.tsx    # Prompt library screen
components/
  ui/                   # Reusable UI: Button, Card, Input, Badge, Toast, etc.
  screens/              # Screen-level: EmptyState, ErrorState
  navigation/           # TabBar
stores/                 # Zustand stores (auth, credit, feed, generation, streak, subscription, theme)
lib/                    # Shared utilities (supabase client, auth, purchases, analytics, haptics, i18n, animations)
hooks/                  # Custom hooks (useGeneration)
locales/                # i18n translations (en.json, tr.json)
supabase/
  functions/            # 16 Deno edge functions
  migrations/           # 6 PostgreSQL migrations
assets/                 # Images, icons, splash
brand/                  # Brand assets
scripts/                # Build scripts (patch-expo-file-system)
tasks/                  # Task tracking (todo.md, changelog.md, lessons.md)
```

## Conventions

- Path alias: `@/*` maps to project root (use `@/lib/supabase`, not `../../lib/supabase`)
- Client env vars must be prefixed with `EXPO_PUBLIC_`
- Edge functions are Deno/TypeScript, separate from the React Native TypeScript config
- Brand color: lime `#BFFF00`, dark background: `#1A1A1A`
- Dark mode supported via NativeWind `class` strategy
- Stores follow `use[Domain]Store` naming (e.g., `useAuthStore`, `useCreditStore`)
- UI components live in `components/ui/`, screen-level components in `components/screens/`

## Important

- NEVER commit .env files
- NEVER modify applied migration files -- create new migrations instead
- Edge functions use Supabase service role key -- never expose in client code
- RevenueCat webhook secret must stay server-side only
- When compacting, ALWAYS preserve: modified file list, todo.md state, test results, decisions, lessons

## Behavior Rules

- Enter plan mode for any task touching 3+ files or making architectural decisions
- If an approach fails twice, STOP -- clear context and re-plan
- Use subagents for research and exploration to keep main context clean
- Use @researcher for codebase exploration before complex tasks
- Use @reviewer for code review -- keeps review context out of main thread
- Use @test-writer to generate comprehensive tests in parallel
- After any user correction: update tasks/lessons.md with the pattern
- Never mark a task done without running tests or demonstrating it works
- Log every completed feature to tasks/changelog.md with what changed and why

## Reference Documents

- [docs/architecture.md](docs/architecture.md) -- detailed architecture overview
- [docs/api-guide.md](docs/api-guide.md) -- edge functions API reference
- [docs/deployment.md](docs/deployment.md) -- build and deploy guide

### Lessons Learned -- @tasks/lessons.md
**Read when:** Starting a new session, before implementing patterns you've gotten wrong before
