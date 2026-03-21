import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ModCard } from '@/components/ui/ModCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/screens/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { supabase, ModRow } from '@/lib/supabase';
import { useGenerationStore } from '@/stores/useGenerationStore';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

const FILTER_TABS = [
  { key: 'trending', label: t('mods.trending'), orderBy: 'usage_count' },
  { key: 'new',      label: t('mods.new'),       orderBy: 'created_at' },
  { key: 'liked',    label: t('mods.topLiked'),  orderBy: 'like_count' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('trending');
  const [search, setSearch] = useState('');
  const [mods, setMods] = useState<ModRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { setSelectedMod } = useGenerationStore();

  const fetchMods = useCallback(async (filter = activeFilter, query = search) => {
    const tab = FILTER_TABS.find((t) => t.key === filter) ?? FILTER_TABS[0];
    let req = supabase
      .from('mods')
      .select('*')
      .order(tab.orderBy, { ascending: false })
      .limit(40);

    if (query.trim()) {
      req = req.ilike('name', `%${query.trim()}%`);
    }

    const { data } = await req;
    setMods(data ?? []);
  }, [activeFilter, search]);

  useEffect(() => {
    setIsLoading(true);
    fetchMods(activeFilter, search).finally(() => setIsLoading(false));
  }, [activeFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchMods(activeFilter, search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchMods(activeFilter, search);
    setIsRefreshing(false);
  };

  const handleSelectMod = (mod: ModRow) => {
    setSelectedMod(mod);
    haptic.selection();
    router.push('/(tabs)/create');
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="px-4 pt-3 pb-2 gap-3">
        <Text className="text-black dark:text-white font-bold text-2xl">{t('mods.title')}</Text>

        <View className="flex-row items-center bg-white dark:bg-[#1C1C1C] rounded-xl px-4 h-11 border border-[#3A3A3A]">
          <Ionicons name="search-outline" size={18} color="rgba(128,128,128,0.6)" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-black dark:text-white text-sm"
            placeholder="Mod ara..."
            placeholderTextColor="#8A8A8A"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.4)" style={{ marginLeft: 8 }} />
            </Pressable>
          )}
        </View>

        <View className="flex-row gap-2">
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => {
                setActiveFilter(tab.key);
                haptic.tap();
              }}
            >
              <Badge
                label={tab.label}
                variant={activeFilter === tab.key ? 'lime' : 'default'}
                size="md"
              />
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-row flex-wrap px-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="rounded-2xl" style={{ width: '47%', aspectRatio: 0.8 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={mods}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 100, gap: 12, paddingTop: 4 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#BFFF00" />
          }
          renderItem={({ item }) => (
            <ModCard
              id={item.id}
              name={item.name}
              thumbnailUrl={item.thumbnail_url}
              thumbnailBlurhash={item.thumbnail_blurhash}
              usageCount={item.usage_count}
              likeCount={item.like_count}
              isOfficial={item.type === 'official'}
              isPremium={item.is_premium}
              onPress={() => router.push(`/mod/${item.slug}`)}
              onTryPress={() => handleSelectMod(item)}
              variant="grid"
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title={t('mods.empty.title')}
              body={t('mods.empty.body')}
              icon="color-palette-outline"
            />
          }
        />
      )}
    </View>
  );
}
