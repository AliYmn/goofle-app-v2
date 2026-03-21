import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { t } from '@/lib/i18n';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerWithEmail } = useAuthStore();
  const { show } = useToast();

  const handleSignUp = async () => {
    if (!email || !password) {
      show({ message: t('errors.validation.required'), type: 'warning' });
      return;
    }
    setIsLoading(true);
    const error = await registerWithEmail(email, password);
    setIsLoading(false);
    if (error) {
      show({ message: error.message, type: 'error' });
    } else {
      router.replace('/(auth)/verify-email');
    }
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
        <Text className="text-white font-bold text-3xl">{t('auth.signUp')}</Text>
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

        <Button
          label={t('auth.signUp')}
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          onPress={handleSignUp}
          className="mt-4"
        />

        <View className="flex-row justify-center gap-2 mt-4">
          <Text className="text-white/40 text-sm">{t('auth.hasAccount')}</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-lime font-semibold text-sm">{t('auth.signIn')}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
