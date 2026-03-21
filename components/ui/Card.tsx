import { View, Pressable, type ViewProps, type PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { pressIn, pressOut } from '@/lib/animations';
import { haptic } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

interface PressableCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <View
      className={`bg-white dark:bg-dark rounded-xl p-4 ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}

export function PressableCard({ children, className = '', onPress, ...rest }: PressableCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={() => { scale.value = pressIn(0.98); haptic.tap(); }}
      onPressOut={() => { scale.value = pressOut(); }}
      onPress={onPress}
      className={`bg-white dark:bg-dark rounded-xl p-4 ${className}`}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
