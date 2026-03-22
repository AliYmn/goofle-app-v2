import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';

type IconName = keyof typeof Ionicons.glyphMap;

const EASE = Easing.out(Easing.cubic);

const STEPS: { icon: IconName; color: string; bg: string; titleKey: string; bodyKey: string }[] = [
  {
    icon: 'camera-outline',
    color: '#BFFF00',
    bg: 'rgba(191, 255, 0, 0.10)',
    titleKey: 'onboarding.howItWorks.step1Title',
    bodyKey: 'onboarding.howItWorks.step1Body',
  },
  {
    icon: 'color-wand-outline',
    color: '#4DA8FF',
    bg: 'rgba(77, 168, 255, 0.10)',
    titleKey: 'onboarding.howItWorks.step2Title',
    bodyKey: 'onboarding.howItWorks.step2Body',
  },
  {
    icon: 'share-social-outline',
    color: '#FF5C5C',
    bg: 'rgba(255, 92, 92, 0.10)',
    titleKey: 'onboarding.howItWorks.step3Title',
    bodyKey: 'onboarding.howItWorks.step3Body',
  },
];

function StepRow({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);

  useEffect(() => {
    const delay = 160 + index * 120;
    opacity.value = withDelay(delay, withTiming(1, { duration: 480, easing: EASE }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 480, easing: EASE }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={style} className="flex-row items-start gap-4">
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: step.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="shrink-0"
      >
        <Ionicons name={step.icon} size={24} color={step.color} />
      </View>
      <View className="flex-1 pt-1 gap-1">
        <Text className="text-white font-bold text-base">{t(step.titleKey)}</Text>
        <Text className="text-white/50 text-sm" style={{ lineHeight: 22 }}>
          {t(step.bodyKey)}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function HowItWorksScreen() {
  const insets = useSafeAreaInsets();

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(16);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 480, easing: EASE });
    headerY.value = withTiming(0, { duration: 480, easing: EASE });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  // Decorative flow strip: three icon dots + connectors
  const flowOpacity = useSharedValue(0);
  useEffect(() => {
    flowOpacity.value = withDelay(60, withTiming(1, { duration: 600, easing: EASE }));
  }, []);
  const flowStyle = useAnimatedStyle(() => ({ opacity: flowOpacity.value }));

  return (
    <View
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black px-6"
    >
      {/* Header */}
      <Animated.View style={headerStyle} className="pt-4 mb-8">
        <View className="self-start rounded-full bg-lime/10 px-3 py-1 mb-4">
          <Text className="text-lime text-xs font-bold" style={{ letterSpacing: 1.5 }}>
            HOW IT WORKS
          </Text>
        </View>
        <Text
          className="text-white font-heading"
          style={{ fontSize: 34, lineHeight: 40, letterSpacing: -0.5 }}
        >
          {t('onboarding.howItWorks.title')}
        </Text>
      </Animated.View>

      {/* Visual flow strip */}
      <Animated.View
        style={flowStyle}
        className="flex-row items-center justify-center mb-10 gap-2"
      >
        {STEPS.map((step, i) => (
          <View key={i} className="flex-row items-center gap-2">
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                backgroundColor: step.bg,
                borderWidth: 1,
                borderColor: `${step.color}25`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={step.icon} size={26} color={step.color} />
            </View>
            {i < STEPS.length - 1 && (
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
            )}
          </View>
        ))}
      </Animated.View>

      {/* Steps */}
      <View className="flex-1 justify-evenly">
        {STEPS.map((step, i) => (
          <StepRow key={i} step={step} index={i} />
        ))}
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
