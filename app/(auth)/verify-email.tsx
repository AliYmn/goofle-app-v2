import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';
import { useLocalSearchParams } from 'expo-router';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black px-6 items-center justify-center gap-6"
    >
      <Text className="text-6xl">📬</Text>
      <View className="gap-2 items-center">
        <Text className="text-white font-bold text-2xl text-center">{t('auth.verifyEmail')}</Text>
        <Text className="text-white/50 text-sm text-center leading-6">
          {t('auth.verifyEmailMessage', { email: email ?? 'email adresine' })}
        </Text>
      </View>
      <Button
        label={t('common.close')}
        variant="outline"
        onPress={() => {}}
      />
    </View>
  );
}
