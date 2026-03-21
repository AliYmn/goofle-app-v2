import { View, Text } from 'react-native';

interface StreakBadgeProps {
  count: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function StreakBadge({ count, showLabel = true, size = 'md' }: StreakBadgeProps) {
  const isHot = count >= 7;

  return (
    <View className={`flex-row items-center gap-1 ${size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'} bg-dark dark:bg-[#363636] rounded-full`}>
      <Text className={size === 'sm' ? 'text-xs' : 'text-sm'}>
        {isHot ? '🔥' : '⚡'}
      </Text>
      <Text className={`text-white font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {count}
      </Text>
      {showLabel && (
        <Text className={`text-white/60 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          gün
        </Text>
      )}
    </View>
  );
}
