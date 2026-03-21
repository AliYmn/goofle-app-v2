import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { OnboardingArtwork } from '@/components/ui/OnboardingArtwork';
import { t } from '@/lib/i18n';

const STEPS = [
  { icon: '📸', titleKey: 'onboarding.howItWorks.step1Title', bodyKey: 'onboarding.howItWorks.step1Body' },
  { icon: '🎨', titleKey: 'onboarding.howItWorks.step2Title', bodyKey: 'onboarding.howItWorks.step2Body' },
  { icon: '✨', titleKey: 'onboarding.howItWorks.step3Title', bodyKey: 'onboarding.howItWorks.step3Body' },
];

export default function HowItWorksScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black px-6"
    >
      <View className="flex-1 justify-center gap-8">
        <OnboardingArtwork variant="process" />
        <Text className="text-white font-bold text-3xl">{t('onboarding.howItWorks.title')}</Text>

        <View className="gap-6">
          {STEPS.map((step, i) => (
            <View key={i} className="flex-row gap-4 items-start">
              <View className="w-12 h-12 rounded-full bg-lime/10 items-center justify-center shrink-0">
                <Text className="text-2xl">{step.icon}</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-white font-bold text-base">{t(step.titleKey)}</Text>
                <Text className="text-white/50 text-sm leading-6">{t(step.bodyKey)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Button
        label={t('onboarding.howItWorks.cta')}
        variant="primary"
        size="lg"
        fullWidth
        onPress={() => router.push('/(onboarding)/first-generate')}
      />
    </View>
  );
}
