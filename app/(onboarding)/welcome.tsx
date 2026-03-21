import { View, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';
import { APP_SPLASH_ICON } from '@/lib/images';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black px-6"
    >
      <View className="flex-1 items-center justify-center gap-8">
        <View className="h-40 w-40 items-center justify-center rounded-[40px] bg-lime/10">
          <View className="h-32 w-32 items-center justify-center rounded-[32px] bg-lime">
            <Image
              source={APP_SPLASH_ICON}
              style={{ width: 84, height: 84 }}
              resizeMode="contain"
            />
          </View>
        </View>
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
