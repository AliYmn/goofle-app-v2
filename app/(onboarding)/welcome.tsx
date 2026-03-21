import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black px-6"
    >
      <View className="flex-1 items-center justify-center gap-8">
        <Image
          source={require('@/assets/images/icon.png')}
          style={{ width: 120, height: 120, borderRadius: 28 }}
        />
        <View className="gap-3 items-center">
          <Text className="text-lime font-heading text-5xl">gooflo.</Text>
          <Text className="text-white/60 text-base text-center leading-7">
            {t('onboarding.welcome.subtitle')}
          </Text>
        </View>
      </View>

      <View className="gap-3">
        <Button
          label={t('onboarding.welcome.cta')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/(onboarding)/how-it-works')}
        />
      </View>
    </View>
  );
}
