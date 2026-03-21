import { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  rounded?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, rounded = false, className = '', style }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800 }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[animStyle, { width: width as number, height }, style]}
      className={`bg-[#3A3A3A] ${rounded ? 'rounded-full' : 'rounded-md'} ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <View className="bg-white dark:bg-dark rounded-xl p-4 gap-3">
      <Skeleton width="60%" height={20} />
      <Skeleton height={14} />
      <Skeleton height={14} width="80%" />
    </View>
  );
}

export function ImageCardSkeleton() {
  return (
    <View className="rounded-xl overflow-hidden gap-2">
      <Skeleton height={200} rounded={false} />
      <View className="px-2 gap-1">
        <Skeleton width="50%" height={14} />
        <Skeleton width="30%" height={12} />
      </View>
    </View>
  );
}
