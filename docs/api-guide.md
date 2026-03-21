# Edge Functions API Guide

All edge functions are deployed to Supabase and invoked via the Supabase client or webhooks.

## Client Invocation

```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: 'value' }
})
```

## Functions

### Generation

**create-generation-job** -- Start an AI generation
- Body: `{ modSlug: string, imageUri: string, prompt?: string }`
- Returns: `{ jobId: string, status: 'queued' }`
- Deducts credits from user balance

**check-generation-status** -- Poll job status
- Body: `{ jobId: string }`
- Returns: `{ status: 'queued' | 'processing' | 'completed' | 'failed', resultUrl?: string }`

**on-generation-complete** -- Webhook callback from Fal AI
- Called by Fal AI when generation finishes
- Updates job record, stores result image

**generate-mod-thumbnail** -- Create mod preview image
- Body: `{ modSlug: string }`
- Returns: `{ thumbnailUrl: string }`

### Purchases

**process-purchase** -- Handle one-time credit purchase
- Body: `{ transactionId: string, productId: string }`
- Validates receipt, adds credits

**process-subscription** -- RevenueCat webhook
- Called by RevenueCat on subscription events
- Updates user subscription status and entitlements

### Gamification

**check-streaks** -- Verify user streak status
- Body: `{ userId: string }`
- Returns: `{ currentStreak: number, isActive: boolean }`

**claim-daily-challenge** -- Claim daily challenge reward
- Body: `{ challengeId: string }`
- Returns: `{ creditsAwarded: number }`

**claim-daily-login** -- Claim daily login bonus
- Returns: `{ creditsAwarded: number, streak: number }`

**claim-pro-daily-bonus** -- Pro subscriber daily bonus
- Returns: `{ creditsAwarded: number }`

**claim-share-bonus** -- Credit for sharing a generation
- Body: `{ generationId: string }`
- Returns: `{ creditsAwarded: number }`

**sync-leaderboard** -- Recalculate rankings
- Typically called on a schedule
- Updates leaderboard table

### Account

**delete-account** -- Delete user account and data
- Removes user data, generations, and profile
- GDPR-compliant

**report-content** -- Report inappropriate content
- Body: `{ contentId: string, contentType: string, reason: string }`

### Communication

**send-email** -- Send transactional email via Resend
- Body: `{ to: string, subject: string, template: string, data: object }`

**send-push-notification** -- Send push notification via Expo
- Body: `{ userId: string, title: string, body: string, data?: object }`

## Authentication

All client-invoked functions require a valid Supabase JWT. The Supabase client automatically includes the auth header. Webhook endpoints (on-generation-complete, process-subscription) validate via shared secrets.

## Environment Variables (Edge Functions)

| Variable | Used By |
|---|---|
| FAL_API_KEY | create-generation-job, generate-mod-thumbnail |
| RESEND_API_KEY | send-email |
| REVENUECAT_WEBHOOK_SECRET | process-subscription |
| SUPABASE_SERVICE_ROLE_KEY | All functions (admin access) |
