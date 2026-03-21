# Deployment

## Environments

| Environment | Purpose | Build Profile |
|---|---|---|
| Development | Local dev with simulator | `development` |
| Preview | Internal testing on real devices | `preview` |
| Production | App Store / Play Store | `production` |

## Prerequisites

- Node.js + npm
- Expo CLI (`npx expo`)
- EAS CLI (`npx eas-cli`)
- Supabase CLI (`supabase`)
- Apple Developer account (iOS)
- Google Play Console (Android)

## Local Development

```bash
make install          # Install dependencies
make supabase-start   # Start local Supabase (Docker required)
make dev              # Start Expo dev server
make ios              # Run on iOS simulator
```

## Database

```bash
make db-create-migration name=description   # Create new migration
make db-migrate                              # Push to remote Supabase
make db-reset                                # Reset local database
```

Never modify existing migration files. Always create new migrations for schema changes.

## Edge Functions

```bash
make edge-serve                    # Serve locally for testing
make edge-deploy                   # Deploy all functions
make edge-deploy-one name=func     # Deploy single function
make env-push                      # Push secrets to Supabase
```

## App Builds

```bash
make build-ios              # Production iOS build
make build-android          # Production Android build
make build-preview-ios      # Preview build for testing
make build-preview-android  # Preview build for testing
```

Build configuration is in `eas.json`. Production builds auto-increment version numbers.

## OTA Updates

```bash
make ota-update msg="description of change"
```

Pushes a JS bundle update to the `production` branch without requiring a new app store submission.

## Environment Variables

### Client-side (in .env, prefixed with EXPO_PUBLIC_)

| Variable | Description |
|---|---|
| EXPO_PUBLIC_SUPABASE_URL | Supabase project URL |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key |
| EXPO_PUBLIC_REVENUECAT_API_KEY | RevenueCat public API key |
| EXPO_PUBLIC_POSTHOG_API_KEY | PostHog project API key |
| EXPO_PUBLIC_POSTHOG_HOST | PostHog instance URL |
| EXPO_PUBLIC_SENTRY_DSN | Sentry DSN |
| EXPO_PUBLIC_EAS_PROJECT_ID | Expo project ID |

### Server-side (Supabase secrets)

| Variable | Description |
|---|---|
| FAL_API_KEY | Fal AI API key |
| RESEND_API_KEY | Resend email API key |
| REVENUECAT_WEBHOOK_SECRET | RevenueCat webhook validation |
| SUPABASE_SERVICE_ROLE_KEY | Supabase admin key |

### Build-only

| Variable | Description |
|---|---|
| SENTRY_AUTH_TOKEN | Sentry sourcemap upload |
| SENTRY_ORG | Sentry organization slug |
| SENTRY_PROJECT | Sentry project slug |

## Supabase Project

- Project ID: `gooflo`
- Project ref: `ltiuesiyblhkihdypqbv`
- Site URL: `https://gooflo.yamapps.com`
- Deep link scheme: `gooflo://`
