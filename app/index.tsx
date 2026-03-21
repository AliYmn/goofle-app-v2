import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Index() {
  const { session, onboardingCompleted } = useAuthStore();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
