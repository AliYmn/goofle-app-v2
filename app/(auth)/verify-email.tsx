import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';
import { signOut } from '@/lib/auth';
import { useAuthStore } from '@/stores/useAuthStore';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { session, onboardingCompleted } = useAuthStore();

  useEffect(() => {
    if (!session?.user?.email_confirmed_at) return;
    router.replace(onboardingCompleted ? '/(tabs)' : '/(onboarding)/welcome');
  }, [session?.user?.email_confirmed_at, onboardingCompleted]);

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
      <Button
        label={t('common.close')}
        variant="outline"
        onPress={handleClose}
      />
    </View>
  );
}
