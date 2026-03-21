import PostHog from 'posthog-react-native';

let posthog: PostHog | null = null;

export function initAnalytics(): void {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  if (!apiKey) return;

  posthog = new PostHog(apiKey, {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    disabled: __DEV__,
  });
}

export function identify(userId: string, properties?: Record<string, any>): void {
  posthog?.identify(userId, properties);
}

export function track(event: string, properties?: Record<string, any>): void {
  posthog?.capture(event, properties);
}

export function reset(): void {
  posthog?.reset();
}

export const analytics = {
  init: initAnalytics,
  identify,
  track,
  reset,

  // named events
  signUp: (method: string) => track('sign_up', { method }),
  signIn: (method: string) => track('sign_in', { method }),
  generationStarted: (modSlug: string) => track('generation_started', { mod_slug: modSlug }),
  generationCompleted: (modSlug: string, durationMs: number) =>
    track('generation_completed', { mod_slug: modSlug, duration_ms: durationMs }),
  generationFailed: (modSlug: string, reason: string) =>
    track('generation_failed', { mod_slug: modSlug, reason }),
  modViewed: (slug: string) => track('mod_viewed', { slug }),
  proUpgradeStarted: () => track('pro_upgrade_started'),
  proUpgradeCompleted: (productId: string) =>
    track('pro_upgrade_completed', { product_id: productId }),
  sharePressed: (context: string) => track('share_pressed', { context }),
  streakUpdated: (streak: number) => track('streak_updated', { streak }),
  dailyChallengeCompleted: (challengeId: string) =>
    track('daily_challenge_completed', { challenge_id: challengeId }),
};
