import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { t } from '@/lib/i18n';
import { signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { session, onboardingCompleted } = useAuthStore();
  const { show } = useToast();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (session?.user?.email_confirmed_at) {
      router.replace(onboardingCompleted ? '/(tabs)' : '/(onboarding)/welcome');
    }
  }, [session?.user?.email_confirmed_at, onboardingCompleted]);

  // Poll for verification status
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.refreshSession();
      if (data?.user?.email_confirmed_at) {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    setIsResending(false);

    if (error) {
      show({ message: error.message, type: 'error' });
    } else {
      show({ message: t('auth.resendSuccess'), type: 'success' });
    }
  };

  const handleClose = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black px-6 items-center justify-center gap-6"
    >
      <Ionicons name="mail-outline" size={64} color="#BFFF00" />
      <View className="gap-2 items-center">
        <Text className="text-white font-bold text-2xl text-center">{t('auth.verifyEmail')}</Text>
        <Text className="text-white/50 text-sm text-center leading-6">
          {t('auth.verifyEmailMessage', { email: email ?? 'email adresine' })}
        </Text>
      </View>
      
      <View className="w-full gap-3 mt-4">
        <Button
          label={t('auth.resendEmail')}
          variant="primary"
          onPress={handleResend}
          disabled={isResending}
          icon={isResending ? <ActivityIndicator size="small" color="#000" /> : undefined}
        />
        <Button
          label={t('common.close')}
          variant="outline"
          onPress={handleClose}
        />
      </View>
    </View>
  );
}
