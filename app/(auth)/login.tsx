import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/components/ui/Toast';
import { t } from '@/lib/i18n';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { loginWithApple, loginWithGoogle } = useAuthStore();
  const { show } = useToast();
  const [loadingApple, setLoadingApple] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleApple = async () => {
    setLoadingApple(true);
    const error = await loginWithApple();
    setLoadingApple(false);
    if (error) show({ message: error.message, type: 'error' });
  };

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    const error = await loginWithGoogle();
    setLoadingGoogle(false);
    if (error) show({ message: error.message, type: 'error' });
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black px-6"
    >
      <View className="flex-1 justify-end gap-6">
        <View className="gap-2">
          <Text className="text-lime font-heading text-5xl">gooflo.</Text>
          <Text className="text-white/60 text-base">{t('onboarding.welcome.subtitle')}</Text>
        </View>

        <View className="gap-3">
          <Button
            label={t('auth.signInWithApple')}
            variant="secondary"
            size="lg"
            fullWidth
            isLoading={loadingApple}
            onPress={handleApple}
          />
          <Button
            label={t('auth.signInWithGoogle')}
            variant="outline"
            size="lg"
            fullWidth
            isLoading={loadingGoogle}
            onPress={handleGoogle}
          />
        </View>

        <View className="flex-row items-center gap-4">
          <View className="flex-1 h-px bg-[#3A3A3A]" />
          <Text className="text-white/40 text-sm">{t('common.or')}</Text>
          <View className="flex-1 h-px bg-[#3A3A3A]" />
        </View>

        <Button
          label={t('auth.signInWithEmail')}
          variant="ghost"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/signup')}
        />

        <Text className="text-white/30 text-xs text-center">
          {t('auth.privacyNotice')}
        </Text>
      </View>
    </View>
  );
}
