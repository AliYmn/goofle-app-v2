import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { pressIn, pressOut } from '@/lib/animations';
import { haptic } from '@/lib/haptics';
import { Badge } from './Badge';
import { t } from '@/lib/i18n';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ModCardProps {
  id: string;
  name: string;
  thumbnailUrl?: string | null;
  thumbnailBlurhash?: string | null;
  category?: string;
  isOfficial?: boolean;
  isPremium?: boolean;
  usageCount?: number;
  likeCount?: number;
  onPress?: () => void;
  onTryPress?: () => void;
  variant?: 'grid' | 'list';
}

export function ModCard({
  id,
  name,
  thumbnailUrl,
  thumbnailBlurhash,
  category,
  isOfficial = false,
  isPremium = false,
  usageCount = 0,
  likeCount = 0,
  onPress,
  onTryPress,
  variant = 'grid',
}: ModCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (variant === 'list') {
    return (
      <AnimatedPressable
        style={animStyle}
        onPressIn={() => { scale.value = pressIn(0.98); haptic.tap(); }}
        onPressOut={() => { scale.value = pressOut(); }}
        onPress={onPress}
        className="flex-row items-center gap-3 bg-white dark:bg-dark rounded-xl p-3 mb-2"
      >
        <Image
          source={thumbnailUrl ? { uri: thumbnailUrl } : require('@/assets/images/icon.png')}
          style={{ width: 56, height: 56, borderRadius: 12 }}
          placeholder={thumbnailBlurhash ? { blurhash: thumbnailBlurhash } : undefined}
          transition={200}
          contentFit="cover"
        />
        <View className="flex-1 gap-0.5">
          <Text className="text-black dark:text-white font-bold text-sm" numberOfLines={1}>{name}</Text>
          <Text className="text-black/40 dark:text-white/40 text-xs">
            {t('mods.usage', { count: usageCount })} · {t('mods.likes', { count: likeCount })}
          </Text>
        </View>
        <View className="flex-row gap-1">
          {isOfficial && <Badge label={t('mods.official')} variant="lime" />}
          {isPremium && <Badge label={t('mods.premium')} variant="premium" />}
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={() => { scale.value = pressIn(0.97); haptic.tap(); }}
      onPressOut={() => { scale.value = pressOut(); }}
      onPress={onPress}
      className="flex-1"
    >
      <View className="relative">
        <Image
          source={thumbnailUrl ? { uri: thumbnailUrl } : require('@/assets/images/icon.png')}
          style={{ width: '100%', aspectRatio: 1, borderRadius: 16 }}
          placeholder={thumbnailBlurhash ? { blurhash: thumbnailBlurhash } : undefined}
          transition={200}
          contentFit="cover"
        />
        {isPremium && (
          <View className="absolute top-2 right-2">
            <Badge label="Pro" variant="premium" size="sm" />
          </View>
        )}
        {isOfficial && (
          <View className="absolute top-2 left-2">
            <Badge label="✓" variant="lime" size="sm" />
          </View>
        )}
      </View>
      <View className="mt-1.5 px-0.5">
        <Text className="text-black dark:text-white font-semibold text-sm" numberOfLines={1}>{name}</Text>
        <Text className="text-black/40 dark:text-white/40 text-xs">{t('mods.usage', { count: usageCount })}</Text>
      </View>
      {onTryPress && (
        <Pressable
          onPress={onTryPress}
          className="mt-2 mx-0.5 bg-[#BFFF00]/10 rounded-lg py-1.5 items-center"
        >
          <Text className="text-[#BFFF00] font-semibold text-xs">{t('mods.tryThis')}</Text>
        </Pressable>
      )}
    </AnimatedPressable>
  );
}
