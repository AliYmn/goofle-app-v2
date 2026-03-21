import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Image as RNImage } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase, ModRow } from '@/lib/supabase';
import { useGenerationStore } from '@/stores/useGenerationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';
import { APP_ICON, normalizeImageUri } from '@/lib/images';

export default function ModDetailScreen() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { setSelectedMod } = useGenerationStore();
  const { session } = useAuthStore();

  const [mod, setMod] = useState<ModRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const resolvedThumbnailUrl = useMemo(
    () => normalizeImageUri(mod?.thumbnail_url, 'mod-thumbs'),
    [mod?.thumbnail_url]
  );
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [resolvedThumbnailUrl]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('mods')
        .select('*')
        .eq('slug', slug)
        .single();
      if (data) {
        setMod(data);
        setLikeCount(data.like_count);
      }
      setIsLoading(false);

      if (session?.user && data) {
        const { data: liked } = await supabase
          .from('mod_likes')
          .select('id')
          .eq('mod_id', data.id)
          .eq('user_id', session.user.id)
          .maybeSingle();
        setIsLiked(!!liked);
      }
    };
    load();
  }, [slug, session?.user?.id]);

  const handleLike = async () => {
    if (!mod || !session?.user || liking) return;
    setLiking(true);
    haptic.like();
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    if (newLiked) {
      await supabase.from('mod_likes').insert({ mod_id: mod.id, user_id: session.user.id });
    } else {
      await supabase.from('mod_likes').delete().eq('mod_id', mod.id).eq('user_id', session.user.id);
    }
    setLiking(false);
  };

  const handleTry = () => {
    if (!mod) return;
    haptic.medium();
    setSelectedMod(mod);
    router.push('/(tabs)/create');
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#BFFF00" />
      </View>
    );
  }

  if (!mod) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-white/40 text-center">Mod bulunamadı.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-[#BFFF00] font-semibold">{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: insets.bottom + 16 }} className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={handleLike} className="w-10 h-10 items-center justify-center">
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? '#FF5C5C' : 'rgba(255,255,255,0.4)'}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 20 }}>
        <View className="w-full aspect-square rounded-2xl overflow-hidden bg-[#1C1C1C]">
          {resolvedThumbnailUrl && !hasImageError ? (
            <Image
              source={{ uri: resolvedThumbnailUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              placeholder={mod.thumbnail_blurhash ? { blurhash: mod.thumbnail_blurhash } : undefined}
              transition={300}
              onError={() => setHasImageError(true)}
            />
          ) : (
            <View className="flex-1 items-center justify-center gap-3">
              <RNImage source={APP_ICON} style={{ width: 64, height: 64, opacity: 0.35 }} resizeMode="contain" />
              <Text className="text-white/30 text-sm">Kapak görseli yok</Text>
            </View>
          )}
        </View>

        <View className="gap-2">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-white font-bold text-2xl">{mod.name}</Text>
            {mod.type === 'official' && <Badge label={t('mods.official')} variant="lime" size="sm" />}
            {mod.is_premium && <Badge label={t('mods.premium')} variant="premium" size="sm" />}
          </View>
          <Text className="text-white/40 text-sm">
            {t('mods.usage', { count: mod.usage_count })} · {t('mods.likes', { count: likeCount })}
          </Text>
        </View>

        <View className="gap-2">
          <Text className="text-white/60 text-xs font-semibold uppercase tracking-wide">
            Kategori
          </Text>
          <Badge label={mod.category} variant="default" />
        </View>

        <View className="bg-[#1C1C1C] rounded-xl p-4 flex-row items-center justify-between">
          <Text className="text-white/60 text-sm">Kredi maliyeti</Text>
          <Text className="text-[#BFFF00] font-bold text-base">{mod.credit_cost} kredi</Text>
        </View>
      </ScrollView>

      <View className="px-4">
        <Button
          label={t('mods.tryThis')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleTry}
        />
      </View>
    </View>
  );
}
