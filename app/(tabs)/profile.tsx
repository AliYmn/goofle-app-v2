import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { supabase, GenerationRow } from '@/lib/supabase';
import { t } from '@/lib/i18n';

const TABS = ['creations', 'collections', 'myMods'] as const;
type Tab = (typeof TABS)[number];

const GRID_SIZE = (Dimensions.get('window').width - 32 - 8) / 3;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, session } = useAuthStore();
  const { currentStreak, longestStreak } = useStreakStore();
  const { isPro } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState<Tab>('creations');
  const [generations, setGenerations] = useState<GenerationRow[]>([]);
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

  useEffect(() => {
    setIsLoading(true);
    fetchGenerations().finally(() => setIsLoading(false));
  }, [fetchGenerations]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchGenerations();
    setIsRefreshing(false);
  };

  const renderGridItem = ({ item }: { item: GenerationRow }) => (
    <Pressable
      onPress={() => router.push(`/generation/${item.id}`)}
      style={{ width: GRID_SIZE, height: GRID_SIZE, margin: 2 }}
      className="overflow-hidden rounded-lg"
    >
      {item.result_image_url ? (
        <Image
          source={{ uri: item.result_image_url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          placeholder={item.blurhash ? { blurhash: item.blurhash } : undefined}
          transition={200}
        />
      ) : (
        <View className="flex-1 bg-[#3A3A3A]" />
      )}
    </Pressable>
  );

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
            renderItem={renderGridItem}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Text className="text-4xl mb-3">🎨</Text>
                <Text className="text-black/40 dark:text-white/40 text-sm">Henüz üretim yok</Text>
              </View>
            }
          />
        )
      ) : (
        <>
          {header}
          <View className="items-center justify-center flex-1">
            <Text className="text-4xl mb-3">
              {activeTab === 'collections' ? '📁' : '🛠️'}
            </Text>
            <Text className="text-black/40 dark:text-white/40 text-sm">Yakında...</Text>
          </View>
        </>
      )}
    </View>
  );
}
