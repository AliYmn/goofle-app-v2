# Architecture

## Overview

Gooflo is a React Native mobile app built with Expo SDK 52. Users take selfies or pick photos, apply AI-powered mods (style transfers, transformations), share results, and compete on leaderboards.

## Client (React Native)

### Routing

Expo Router with file-based routing. Three main route groups:

- **(auth)** -- login/signup/verify-email flows. Apple, Google, and email auth via Supabase Auth.
- **(onboarding)** -- first-time user flow shown once after signup.
- **(tabs)** -- main app: explore feed, create generation, leaderboard, profile.

Standalone routes: generation detail, mod detail, collection detail, settings, pro paywall, prompt library.

### State Management

Zustand stores with MMKV persistence:

| Store | Purpose |
|---|---|
| useAuthStore | User session, profile data |
| useCreditStore | Credit balance, transactions |
| useFeedStore | Explore feed, content lists |
| useGenerationStore | AI generation state, queue |
| useStreakStore | Daily streaks, challenges |
| useSubscriptionStore | RevenueCat subscription state |
| useThemeStore | Dark/light mode |

### UI Layer

- NativeWind v4 (TailwindCSS) for styling
- Nunito font family (Regular through Black weights)
- Reanimated for animations
- Bottom sheets via @gorhom/bottom-sheet
- Haptic feedback via expo-haptics

### Shared Libraries (`lib/`)

| Module | Purpose |
|---|---|
| supabase.ts | Supabase client initialization |
| auth.ts | Auth helpers (sign in, sign out, session management) |
| purchases.ts | RevenueCat setup and purchase helpers |
| analytics.ts | PostHog event tracking |
| haptics.ts | Haptic feedback utilities |
| i18n.ts | i18n-js setup with Turkish + English |
| animations.ts | Reanimated animation presets |
| polyfills.ts | Platform polyfills |

## Backend (Supabase)

### Database

PostgreSQL via Supabase. 6 migrations covering:
1. Core schema (users, profiles)
2. Mods and generations
3. Social and gamification (likes, shares, leaderboard)
4. Storage buckets
5. Database functions
6. Reference ID for credit transactions

### Edge Functions (Deno)

16 functions handling server-side logic:

| Function | Purpose |
|---|---|
| create-generation-job | Queue AI generation with Fal AI |
| check-generation-status | Poll generation job status |
| on-generation-complete | Handle completed generation callback |
| generate-mod-thumbnail | Create mod preview thumbnails |
| process-purchase | Handle one-time credit purchases |
| process-subscription | Handle RevenueCat subscription webhooks |
| sync-leaderboard | Recalculate leaderboard rankings |
| check-streaks | Verify and update user streaks |
| claim-daily-challenge | Claim daily challenge reward |
| claim-daily-login | Claim daily login reward |
| claim-pro-daily-bonus | Claim pro subscriber daily bonus |
| claim-share-bonus | Claim share reward credits |
| delete-account | GDPR-compliant account deletion |
| report-content | Content moderation reports |
| send-email | Transactional emails via Resend |
| send-push-notification | Push notifications via Expo |

### Storage

Supabase Storage for user uploads and generated images. Max file size: 50MB.

### Auth

Supabase Auth with three providers:
- Apple Sign In (iOS native)
- Google Sign In (native)
- Email/password with email confirmation

## External Services

| Service | Purpose |
|---|---|
| Fal AI | AI image generation models |
| RevenueCat | In-app purchases and subscriptions |
| PostHog | Product analytics |
| Sentry | Error tracking and performance monitoring |
| Resend | Transactional email |
| Expo Push | Push notifications |

## Data Flow

1. User selects a mod and uploads a photo
2. Client calls `create-generation-job` edge function
3. Edge function sends job to Fal AI, saves job record
4. Client polls `check-generation-status` or Fal AI calls `on-generation-complete` webhook
5. Result image stored in Supabase Storage
6. Client displays result, user can share/save
