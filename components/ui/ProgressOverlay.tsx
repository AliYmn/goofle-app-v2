import { useEffect, useState } from 'react';
import { View, Text, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { t } from '@/lib/i18n';

const MESSAGES_KEY = 'create.generatingMessages';

interface ProgressOverlayProps {
  visible: boolean;
  progress?: number;
}

export function ProgressOverlay({ visible, progress }: ProgressOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const dotScale = useSharedValue(1);

  const messages = [
    t('create.generatingMessages.0'),
    t('create.generatingMessages.1'),
    t('create.generatingMessages.2'),
    t('create.generatingMessages.3'),
  ];

  useEffect(() => {
    if (!visible) return;
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
    );
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [visible]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <BlurView intensity={60} tint="dark" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View className="items-center gap-6 px-8">
          <View className="flex-row gap-2">
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={i === 1 ? dotStyle : undefined}
                className="w-3 h-3 rounded-full bg-lime"
              />
            ))}
          </View>

          <Text className="text-white font-bold text-xl text-center">
            {t('create.generating')}
          </Text>

          <Text className="text-white/60 text-base text-center">
            {messages[messageIndex]}
          </Text>

          {typeof progress === 'number' && (
            <View className="w-full h-1.5 bg-[#3A3A3A] rounded-full overflow-hidden">
              <View
                className="h-full bg-lime rounded-full"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
            </View>
          )}
        </View>
      </BlurView>
    </Modal>
  );
}
