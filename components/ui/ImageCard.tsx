import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
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
      className="mb-5 overflow-hidden rounded-[24px] border border-[#E5E5E3] bg-white dark:border-[#3A3A3A] dark:bg-[#2D2D2D]"
    >
      <View className="relative">
        {resolvedImageUrl && !hasImageError ? (
          <Image
            source={{ uri: resolvedImageUrl }}
            style={{ width: '100%', aspectRatio: 0.92 }}
            placeholder={blurhash ? { blurhash } : undefined}
            transition={300}
            contentFit="cover"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <View
            style={{ width: '100%', aspectRatio: 0.92 }}
            className="items-center justify-center overflow-hidden bg-black"
          >
            <Image
              source={APP_ICON}
              style={{ width: 72, height: 72, opacity: 0.35 }}
              contentFit="contain"
            />
          </View>
        )}

        {modName && (
          <View className="absolute left-4 top-4 rounded-full bg-[#F2F2F0] px-3 py-1.5 dark:bg-[#1A1A1A]">
            <Text className="text-xs font-bold text-[#1A1A1A] dark:text-white">{modName}</Text>
          </View>
        )}

        <View className="absolute bottom-4 left-4 right-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 rounded-full bg-[#1A1A1A] px-3 py-2">
            <Avatar uri={avatarUrl} username={username} size="xs" />
            <Text className="text-sm font-semibold text-white">{username ?? 'anon'}</Text>
          </View>

          <Pressable
            onPress={handleLike}
            className="flex-row items-center gap-1 rounded-full bg-[#F2F2F0] px-3 py-2"
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? '#FF5C5C' : '#1A1A1A'}
            />
            <Text className="text-xs font-bold text-[#1A1A1A]">{likeCount}</Text>
          </Pressable>
        </View>
      </View>

      <View className="gap-3 px-4 py-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#1A1A1A] dark:text-white">
              {modName ?? 'Gooflo drop'}
            </Text>
            <Text className="mt-1 text-sm text-[#1A1A1A]/55 dark:text-white/55">
              {username ? `by ${username}` : 'Community remix'}
            </Text>
          </View>
          {onTryMod && (
            <Pressable
              onPress={() => { haptic.tap(); onTryMod(); }}
              className="rounded-full bg-[#BFFF00] px-3 py-2"
            >
              <Text className="text-xs font-bold text-[#1A1A1A]">{t('feed.tryThis')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}
