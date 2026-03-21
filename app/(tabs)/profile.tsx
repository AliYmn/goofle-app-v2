import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, Dimensions, Image as RNImage, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { supabase, GenerationRow, CollectionRow } from '@/lib/supabase';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';
import { APP_ICON, normalizeImageUri } from '@/lib/images';

const TABS = ['creations', 'collections', 'myMods'] as const;
type Tab = (typeof TABS)[number];

const GRID_SIZE = (Dimensions.get('window').width - 32 - 8) / 3;

function GenerationGridTile({ item }: { item: GenerationRow }) {
  const resolvedImageUrl = useMemo(
    () => normalizeImageUri(item.result_image_url, 'generations'),
    [item.result_image_url]
  );
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [resolvedImageUrl]);

  return (
    <Pressable
      onPress={() => router.push(`/generation/${item.id}`)}
      style={{ width: GRID_SIZE, height: GRID_SIZE, margin: 2 }}
      className="overflow-hidden rounded-lg bg-[#1C1C1C]"
    >
      {resolvedImageUrl && !hasImageError ? (
        <Image
          source={{ uri: resolvedImageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          placeholder={item.blurhash ? { blurhash: item.blurhash } : undefined}
          transition={200}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <RNImage source={APP_ICON} style={{ width: 36, height: 36, opacity: 0.35 }} resizeMode="contain" />
        </View>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, session } = useAuthStore();
  const { currentStreak, longestStreak } = useStreakStore();
  const { isPro } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState<Tab>('creations');
  const [generations, setGenerations] = useState<GenerationRow[]>([]);
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGenerations = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(60);
    setGenerations(data ?? []);
  }, [session?.user?.id]);

  const fetchCollections = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    setCollections(data ?? []);
  }, [session?.user?.id]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchGenerations(), fetchCollections()]).finally(() => setIsLoading(false));
  }, [fetchGenerations, fetchCollections]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchGenerations(), fetchCollections()]);
    setIsRefreshing(false);
  };

  const handleCreateCollection = () => {
    Alert.prompt(
      t('collections.createTitle'),
      t('collections.createDescription'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.save'),
          onPress: async (name?: string) => {
            const trimmed = name?.trim();
            if (!trimmed || !session?.user) return;
            await supabase.from('collections').insert({
              user_id: session.user.id,
              name: trimmed,
              cover_image_url: null,
            });
            haptic.success();
            await fetchCollections();
          },
        },
      ],
      'plain-text',
    );
  };

  const tabLabels: Record<Tab, string> = {
    creations: t('profile.creations'),
    collections: t('profile.collections'),
    myMods: t('profile.myMods'),
  };

  const header = (
    <>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-black dark:text-white font-bold text-xl">{t('profile.title')}</Text>
        <Pressable onPress={() => router.push('/settings')}>
          <Text className="text-black/60 dark:text-white/60 text-xl">⚙</Text>
        </Pressable>
      </View>

      <View className="items-center gap-4 py-6 px-6">
        <Avatar uri={user?.avatar_url} username={user?.username} size="xl" showBorder={isPro} />
        <View className="items-center gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-black dark:text-white font-bold text-xl">
              {user?.username ?? 'Kullanıcı'}
            </Text>
            {isPro && <Badge label="PRO" variant="premium" size="sm" />}
          </View>
          {user?.bio && (
            <Text className="text-black/50 dark:text-white/50 text-sm text-center">{user.bio}</Text>
          )}
          <Pressable
            onPress={() => router.push('/edit-profile')}
            className="mt-2 px-4 py-1.5 rounded-lg border border-[#3A3A3A]"
          >
            <Text className="text-black/60 dark:text-white/60 text-sm font-medium">
              {t('profile.editProfile')}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row gap-8">
          <View className="items-center gap-0.5">
            <Text className="text-black dark:text-white font-bold text-2xl">{generations.length}</Text>
            <Text className="text-black/40 dark:text-white/40 text-xs">{t('profile.creations')}</Text>
          </View>
          <View className="w-px bg-[#3A3A3A]" />
          <View className="items-center gap-0.5">
            <Text className="text-black dark:text-white font-bold text-2xl">{currentStreak}</Text>
            <Text className="text-black/40 dark:text-white/40 text-xs">{t('profile.streak', { count: currentStreak })}</Text>
          </View>
          <View className="w-px bg-[#3A3A3A]" />
          <View className="items-center gap-0.5">
            <Text className="text-black dark:text-white font-bold text-2xl">{longestStreak}</Text>
            <Text className="text-black/40 dark:text-white/40 text-xs">{t('profile.topStreak', { count: longestStreak })}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row border-b border-[#3A3A3A] mx-4 mb-2">
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 items-center ${activeTab === tab ? 'border-b-2 border-[#BFFF00]' : ''}`}
          >
            <Text className={`font-semibold text-sm ${activeTab === tab ? 'text-[#BFFF00]' : 'text-black/40 dark:text-white/40'}`}>
              {tabLabels[tab]}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      {activeTab === 'creations' ? (
        isLoading ? (
          <>
            {header}
            <View className="flex-row flex-wrap px-4 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <View key={i} style={{ width: GRID_SIZE, height: GRID_SIZE }} className="rounded-lg bg-[#3A3A3A]" />
              ))}
            </View>
          </>
        ) : (
          <FlatList
            data={generations}
            keyExtractor={(item) => item.id}
            numColumns={3}
            ListHeaderComponent={header}
            columnWrapperStyle={{ paddingHorizontal: 14 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#BFFF00" />
            }
            renderItem={({ item }) => <GenerationGridTile item={item} />}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Text className="text-4xl mb-3">🎨</Text>
                <Text className="text-black/40 dark:text-white/40 text-sm">Henüz üretim yok</Text>
              </View>
            }
          />
        )
      ) : activeTab === 'collections' ? (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {header}
              <Pressable
                onPress={handleCreateCollection}
                className="mx-4 mb-4 py-3 rounded-lg border border-dashed border-[#3A3A3A] items-center"
              >
                <Text className="text-lime font-semibold text-sm">+ {t('collections.create')}</Text>
              </Pressable>
            </>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#BFFF00" />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/collection/${item.id}`)}
              className="mx-4 mb-3 p-4 bg-white dark:bg-[#1C1C1C] rounded-xl flex-row items-center gap-3"
            >
              <View className="w-12 h-12 rounded-lg bg-[#3A3A3A] items-center justify-center">
                <Text className="text-xl">📁</Text>
              </View>
              <View className="flex-1">
                <Text className="text-black dark:text-white font-semibold text-base">{item.name}</Text>
                <Text className="text-black/40 dark:text-white/40 text-xs mt-0.5">
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text className="text-black/30 dark:text-white/30 text-lg">›</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-4xl mb-3">📁</Text>
              <Text className="text-black/40 dark:text-white/40 text-sm">{t('collections.emptyState')}</Text>
            </View>
          }
        />
      ) : (
        <>
          {header}
          <View className="items-center justify-center flex-1">
            <Text className="text-4xl mb-3">🛠️</Text>
            <Text className="text-black/40 dark:text-white/40 text-sm">{t('collections.comingSoon')}</Text>
          </View>
        </>
      )}
    </View>
  );
}
