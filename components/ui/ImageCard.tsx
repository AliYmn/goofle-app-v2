import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { pressIn, pressOut } from '@/lib/animations';
import { haptic } from '@/lib/haptics';
import { Avatar } from './Avatar';
import { t } from '@/lib/i18n';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ImageCardProps {
  id: string;
  imageUrl: string;
  blurhash?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  modName?: string;
  likeCount?: number;
  isLiked?: boolean;
  onPress?: () => void;
  onLike?: () => void;
  onTryMod?: () => void;
}

export function ImageCard({
  id,
  imageUrl,
  blurhash,
  username,
  avatarUrl,
  modName,
  likeCount = 0,
  isLiked = false,
  onPress,
  onLike,
  onTryMod,
}: ImageCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLike = () => {
    haptic.like();
    onLike?.();
  };

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={() => { scale.value = pressIn(0.98); }}
      onPressOut={() => { scale.value = pressOut(); }}
      onPress={onPress}
      className="mb-4"
    >
      <Image
        source={{ uri: imageUrl }}
        style={{ width: '100%', aspectRatio: 1, borderRadius: 16 }}
        placeholder={blurhash ? { blurhash } : undefined}
        transition={300}
        contentFit="cover"
      />

      <View className="flex-row items-center justify-between mt-2 px-1">
        <View className="flex-row items-center gap-2">
          <Avatar uri={avatarUrl} username={username} size="xs" />
          <View>
            <Text className="text-white font-semibold text-sm">{username ?? 'anon'}</Text>
            {modName && (
              <Text className="text-white/50 text-xs">{modName}</Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          {onTryMod && (
            <Pressable
              onPress={() => { haptic.tap(); onTryMod(); }}
              className="bg-dark rounded-full px-3 py-1"
            >
              <Text className="text-lime text-xs font-semibold">{t('feed.tryThis')}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleLike}
            className="flex-row items-center gap-1"
          >
            <Text className={`text-lg ${isLiked ? '' : 'opacity-50'}`}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
            <Text className="text-white/60 text-xs">{likeCount}</Text>
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}
