import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { show } = useToast();

  const handleReset = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      show({ message: t('errors.validation.required'), type: 'warning' });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: 'gooflo://reset-password',
    });
    setIsLoading(false);

    if (error) {
      show({ message: error.message, type: 'error' });
      return;
    }

    setIsSent(true);
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-black px-6"
    >
      <Pressable onPress={() => router.back()} className="py-4">
        <Text className="text-white/60 text-base">{t('common.back')}</Text>
      </Pressable>

      <View className="gap-2 mb-8">
        <Text className="text-white font-bold text-3xl">{t('auth.forgotPassword')}</Text>
        <Text className="text-white/50 text-base">
          {isSent ? t('auth.resetSent') : t('auth.resetDescription')}
        </Text>
      </View>

      {!isSent ? (
        <View className="gap-4">
          <Input
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Button
            label={t('auth.sendResetLink')}
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            onPress={handleReset}
            className="mt-4"
          />
        </View>
      ) : (
        <View className="gap-4">
          <Button
            label={t('auth.signIn')}
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.replace('/(auth)/login')}
          />
        </View>
      )}
    </View>
  );
}
