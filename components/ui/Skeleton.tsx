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
    <View className="overflow-hidden rounded-[24px] border border-[#E5E5E3] bg-white dark:border-[#3A3A3A] dark:bg-[#2D2D2D]">
      <Skeleton height={320} rounded={false} className="rounded-none" />
      <View className="gap-3 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Skeleton width="44%" height={16} />
          <Skeleton width={86} height={32} rounded />
        </View>
        <Skeleton width="28%" height={13} />
      </View>
    </View>
  );
}
