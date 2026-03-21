import '../global.css';
import * as Sentry from '@sentry/react-native';
import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ToastProvider } from '@/components/ui/Toast';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { initPurchases, identifyCustomer, checkProStatus } from '@/lib/purchases';
import { analytics } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  enabled: !__DEV__,
});

initPurchases();
analytics.init();

SplashScreen.preventAutoHideAsync();

async function registerPushToken(userId: string) {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    });
    await supabase
      .from('users')
      .update({ push_token: tokenData.data })
      .eq('id', userId);
  } catch {
    // non-critical — silently ignore
  }
}

function RootLayoutNav() {
  const { session, isLoading, onboardingCompleted } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    if (!session) {
      if (!inAuth) router.replace('/(auth)/login');
    } else if (!onboardingCompleted) {
      if (!inOnboarding) router.replace('/(onboarding)/welcome');
    } else {
      if (inAuth || inOnboarding) router.replace('/(tabs)');
    }
  }, [session, isLoading, onboardingCompleted, segments]);

  return null;
}

export default Sentry.wrap(function RootLayout() {
  const { colorScheme } = useThemeStore();
  const { initialize, session } = useAuthStore();
  const { setIsPro } = useSubscriptionStore();

  useEffect(() => {
    if (!session?.user) return;
    identifyCustomer(session.user.id);
    analytics.identify(session.user.id);
    checkProStatus().then(({ isPro, expiresAt }) => setIsPro(isPro, expiresAt));
    registerPushToken(session.user.id);
  }, [session?.user?.id]);

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <ToastProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <RootLayoutNav />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="mod/[slug]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="generation/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="collection/[id]" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="prompt-library" />
              <Stack.Screen name="pro" options={{ presentation: 'modal' }} />
            </Stack>
          </ToastProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
