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
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';

const EASE = Easing.out(Easing.cubic);

export default function FirstGenerateScreen() {
  const insets = useSafeAreaInsets();
  const { user, setOnboardingCompleted } = useAuthStore();

  const visualOpacity = useSharedValue(0);
  const visualY = useSharedValue(24);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(16);
  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(12);

  useEffect(() => {
    visualOpacity.value = withTiming(1, { duration: 560, easing: EASE });
    visualY.value = withTiming(0, { duration: 560, easing: EASE });

    textOpacity.value = withDelay(180, withTiming(1, { duration: 480, easing: EASE }));
    textY.value = withDelay(180, withTiming(0, { duration: 480, easing: EASE }));

    buttonOpacity.value = withDelay(340, withTiming(1, { duration: 400, easing: EASE }));
    buttonY.value = withDelay(340, withTiming(0, { duration: 400, easing: EASE }));
  }, []);

  const visualStyle = useAnimatedStyle(() => ({
    opacity: visualOpacity.value,
    transform: [{ translateY: visualY.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  const handleStart = async () => {
    if (user) {
      await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id);
      setOnboardingCompleted(true);
    }
    router.replace('/(tabs)');
  };

  return (
    <View
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black px-6"
    >
      <View className="flex-1 items-center justify-center gap-10">
        {/* Before → After visual */}
        <Animated.View style={visualStyle} className="flex-row items-center justify-center gap-4">
          {/* Before card */}
          <View
            style={{
              width: 120,
              height: 148,
              borderRadius: 20,
              backgroundColor: '#2D2D2D',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.07)',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Ionicons name="person-circle-outline" size={44} color="rgba(255,255,255,0.22)" />
            <Text
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 11,
                fontFamily: 'Nunito_600SemiBold',
                letterSpacing: 0.3,
              }}
            >
              Your photo
            </Text>
          </View>

          {/* Arrow */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: 'rgba(191, 255, 0, 0.10)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-forward" size={18} color="#BFFF00" />
          </View>

          {/* After card */}
          <View
            style={{
              width: 120,
              height: 148,
              borderRadius: 20,
              backgroundColor: '#BFFF00',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Ionicons name="sparkles" size={44} color="#1A1A1A" />
            <Text
              style={{
                color: '#1A1A1A',
                fontSize: 11,
                fontFamily: 'Nunito_700Bold',
                letterSpacing: 0.3,
              }}
            >
              AI version
            </Text>
          </View>
        </Animated.View>

        {/* Text + badge */}
        <Animated.View style={textStyle} className="items-center gap-4">
          <View className="flex-row items-center gap-2 bg-lime/10 rounded-full px-4 py-1.5">
            <Ionicons name="flash" size={13} color="#BFFF00" />
            <Text className="text-lime text-xs font-bold" style={{ letterSpacing: 0.8 }}>
              1 FREE CREDIT
            </Text>
          </View>
          <Text
            className="text-white font-heading text-center"
            style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.5 }}
          >
            {t('onboarding.firstGenerate.title')}
          </Text>
          <Text
            className="text-white/50 text-base text-center"
            style={{ lineHeight: 26, maxWidth: 280 }}
          >
            {t('onboarding.firstGenerate.subtitle')}
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={buttonStyle}>
        <Button
          label={t('onboarding.firstGenerate.cta')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleStart}
        />
      </Animated.View>
    </View>
  );
}
