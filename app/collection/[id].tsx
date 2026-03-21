import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, Dimensions, Alert, Image as RNImage } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { supabase, CollectionRow, GenerationRow } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { normalizeImageUri, APP_ICON } from '@/lib/images';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

const GRID_SIZE = (Dimensions.get('window').width - 32 - 8) / 3;

export default function CollectionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthStore();

  const [collection, setCollection] = useState<CollectionRow | null>(null);
  const [items, setItems] = useState<GenerationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;

    const [collectionRes, itemsRes] = await Promise.all([
      supabase.from('collections').select('*').eq('id', id).single(),
      supabase
        .from('collection_items')
        .select('generation_id, generations(*)')
        .eq('collection_id', id)
        .order('created_at', { ascending: false }),
    ]);

    if (collectionRes.data) setCollection(collectionRes.data);
    if (itemsRes.data) {
      const gens = itemsRes.data
        .map((item: any) => item.generations as GenerationRow)
        .filter(Boolean);
      setItems(gens);
    }
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const isOwner = collection?.user_id === session?.user?.id;

  const handleDelete = () => {
    if (!isOwner) return;
    Alert.alert(t('collections.deleteTitle'), t('collections.deleteWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await supabase.from('collections').delete().eq('id', id!);
          haptic.medium();
          router.back();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: GenerationRow }) => {
    const uri = normalizeImageUri(item.result_image_url, 'generations');
    return (
      <Pressable
        onPress={() => router.push(`/generation/${item.id}`)}
        style={{ width: GRID_SIZE, height: GRID_SIZE, margin: 2 }}
        className="overflow-hidden rounded-lg bg-[#1C1C1C]"
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            placeholder={item.blurhash ? { blurhash: item.blurhash } : undefined}
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <RNImage source={APP_ICON} style={{ width: 36, height: 36, opacity: 0.35 }} resizeMode="contain" />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-black/60 dark:text-white/60 text-base">{t('common.back')}</Text>
        </Pressable>
        <Text className="text-black dark:text-white font-bold text-lg" numberOfLines={1}>
          {collection?.name ?? t('collections.title')}
        </Text>
        {isOwner ? (
          <Pressable onPress={handleDelete}>
            <Text className="text-coral text-sm font-medium">{t('common.delete')}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {isLoading ? (
        <View className="flex-row flex-wrap px-4 gap-1 mt-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={{ width: GRID_SIZE, height: GRID_SIZE }} className="rounded-lg bg-[#3A3A3A] m-0.5" />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={{ paddingHorizontal: 14 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#BFFF00" />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="folder-open-outline" size={40} color="rgba(255,255,255,0.3)" />
              <Text className="text-black/40 dark:text-white/40 text-sm">
                {t('collections.empty')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
