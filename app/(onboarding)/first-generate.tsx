import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { OnboardingArtwork } from '@/components/ui/OnboardingArtwork';
import { t } from '@/lib/i18n';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';

export default function FirstGenerateScreen() {
  const insets = useSafeAreaInsets();
  const { user, setOnboardingCompleted } = useAuthStore();

  const handleStart = async () => {
    if (user) {
      await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id);
      setOnboardingCompleted(true);
    }
    router.replace('/(tabs)');
  };

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black px-6"
    >
      <View className="flex-1 items-center justify-center gap-8">
        <OnboardingArtwork variant="launch" />
        <View className="gap-3 items-center">
          <Text className="text-white font-bold text-3xl text-center">
            {t('onboarding.firstGenerate.title')}
          </Text>
          <Text className="text-white/50 text-base text-center leading-7">
            {t('onboarding.firstGenerate.subtitle')}
          </Text>
        </View>
      </View>

      <Button
        label={t('onboarding.firstGenerate.cta')}
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleStart}
      />
    </View>
  );
}
