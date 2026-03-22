import '../global.css';
import '@/lib/polyfills';
import * as Sentry from '@sentry/react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
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
import { ToastProvider } from '@/components/ui/Toast';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { initPurchases, identifyCustomer, checkProStatus } from '@/lib/purchases';
import { analytics } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import { useAppGate } from '@/hooks/useAppGate';
import { ForceUpdate } from '@/components/screens/ForceUpdate';
import { MaintenanceMode } from '@/components/screens/MaintenanceMode';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  enabled: !__DEV__,
});

initPurchases();

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

export default Sentry.wrap(function RootLayout() {
  const { colorScheme } = useThemeStore();
  const { initialize, session, isLoading: authLoading } = useAuthStore();
  const { setIsPro } = useSubscriptionStore();
  const { status: gateStatus, recheck } = useAppGate();

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
    const bootstrapApp = async () => {
      if (Platform.OS === 'ios') {
        await requestTrackingPermissionsAsync().catch(() => {});
      }
      analytics.init();
      await initialize();
    };
    bootstrapApp();
  }, []);

  // Keep native splash visible until BOTH fonts and auth are ready — prevents the brief black flash
  useEffect(() => {
    if ((fontsLoaded || fontError) && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authLoading]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (gateStatus === 'force-update') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ForceUpdate />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (gateStatus === 'maintenance') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <MaintenanceMode onRetry={recheck} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" options={{ animation: 'fade', animationDuration: 250 }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="mod/[slug]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="generation/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="collection/[id]" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="prompt-library" />
            <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
            <Stack.Screen name="transaction-history" />
            <Stack.Screen name="daily-challenge" />
            <Stack.Screen name="create-mod" options={{ presentation: 'modal' }} />
            <Stack.Screen name="pro" options={{ presentation: 'modal' }} />
          </Stack>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
