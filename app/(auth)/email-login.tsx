import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { t } from '@/lib/i18n';

function isEmailConfirmationError(message: string, code?: string) {
  if (code === 'email_not_confirmed') return true;

  const normalizedMessage = message.toLowerCase();
  return normalizedMessage.includes('confirm') || normalizedMessage.includes('verify');
}

export default function EmailLoginScreen() {
  const insets = useSafeAreaInsets();
  const { loginWithEmail } = useAuthStore();
  const { show } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      show({ message: t('errors.validation.required'), type: 'warning' });
      return;
    }

    setIsLoading(true);
    const error = await loginWithEmail(trimmedEmail, password);
    setIsLoading(false);

    if (!error) {
      router.replace('/');
      return;
    }

    if (isEmailConfirmationError(error.message, error.code)) {
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: trimmedEmail },
      });
      return;
    }

    show({ message: error.message, type: 'error' });
  };

  return (
    <ScrollView
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-black"
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} className="py-4">
        <Text className="text-white/60 text-base">{t('common.back')}</Text>
      </Pressable>

      <View className="gap-2 mb-8">
        <Text className="text-white font-bold text-3xl">{t('auth.signIn')}</Text>
      </View>

      <View className="gap-4">
        <Input
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="self-end">
          <Text className="text-white/40 text-sm">{t('auth.forgotPassword')}</Text>
        </Pressable>

        <Button
          label={t('auth.signIn')}
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          onPress={handleLogin}
          className="mt-4"
        />

        <View className="flex-row justify-center gap-2 mt-4">
          <Text className="text-white/40 text-sm">{t('auth.noAccount')}</Text>
          <Pressable onPress={() => router.replace('/(auth)/signup')}>
            <Text className="text-lime font-semibold text-sm">{t('auth.signUp')}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
