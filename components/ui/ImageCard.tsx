import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { pressIn, pressOut } from '@/lib/animations';
import { haptic } from '@/lib/haptics';
import { Avatar } from './Avatar';
import { t } from '@/lib/i18n';
import { APP_ICON, normalizeImageUri } from '@/lib/images';

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
  const resolvedImageUrl = useMemo(() => normalizeImageUri(imageUrl, 'generations'), [imageUrl]);
  const [hasImageError, setHasImageError] = useState(false);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    setHasImageError(false);
  }, [resolvedImageUrl]);

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
      {resolvedImageUrl && !hasImageError ? (
        <Image
          source={{ uri: resolvedImageUrl }}
          style={{ width: '100%', aspectRatio: 1, borderRadius: 16 }}
          placeholder={blurhash ? { blurhash } : undefined}
          transition={300}
          contentFit="cover"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <View
          style={{ width: '100%', aspectRatio: 1, borderRadius: 16 }}
          className="bg-[#1C1C1C] items-center justify-center overflow-hidden"
        >
          <RNImage source={APP_ICON} style={{ width: 72, height: 72, opacity: 0.35 }} resizeMode="contain" />
        </View>
      )}

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
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#FF5C5C' : 'rgba(255,255,255,0.5)'}
            />
            <Text className="text-white/60 text-xs">{likeCount}</Text>
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}
