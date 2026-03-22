import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';
import { APP_SPLASH_ICON } from '@/lib/images';

const EASE_OUT = Easing.out(Easing.cubic);

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(24);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(16);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600, easing: EASE_OUT });
    logoY.value = withTiming(0, { duration: 600, easing: EASE_OUT });

    textOpacity.value = withDelay(180, withTiming(1, { duration: 560, easing: EASE_OUT }));
    textY.value = withDelay(180, withTiming(0, { duration: 560, easing: EASE_OUT }));

    buttonOpacity.value = withDelay(360, withTiming(1, { duration: 480, easing: EASE_OUT }));
    buttonY.value = withDelay(360, withTiming(0, { duration: 480, easing: EASE_OUT }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  return (
    <View
      style={{ paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-black"
    >
      {/* Decorative glow — behind all content */}
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center"
        style={{ justifyContent: 'center', top: -40 }}
      >
        <View
          style={{
            width: 380,
            height: 380,
            borderRadius: 190,
            backgroundColor: 'rgba(191, 255, 0, 0.04)',
          }}
        />
      </View>
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center"
        style={{ justifyContent: 'center', top: -40 }}
      >
        <View
          style={{
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: 'rgba(191, 255, 0, 0.06)',
          }}
        />
      </View>

      {/* Main content */}
      <View className="flex-1 items-center justify-center px-6 gap-8">
        {/* Icon mark */}
        <Animated.View style={logoStyle} className="items-center">
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              backgroundColor: '#BFFF00',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <Image
              source={APP_SPLASH_ICON}
              style={{ width: 78, height: 78 }}
              contentFit="contain"
            />
          </View>
        </Animated.View>

        {/* Wordmark + tagline */}
        <Animated.View style={textStyle} className="items-center gap-3">
          <Text
            className="text-lime font-heading"
            style={{ fontSize: 56, lineHeight: 60, letterSpacing: -1 }}
          >
            gooflo.
          </Text>
          <Text
            className="text-white/50 text-base text-center"
            style={{ lineHeight: 26, maxWidth: 260 }}
          >
            {t('onboarding.welcome.subtitle')}
          </Text>
        </Animated.View>
      </View>

      {/* CTA */}
      <Animated.View style={buttonStyle} className="px-6 gap-3">
        <Button
          label={t('onboarding.welcome.cta')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/(onboarding)/how-it-works')}
        />
      </Animated.View>
    </View>
  );
}
