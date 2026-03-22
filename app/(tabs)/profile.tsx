import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, useWindowDimensions, Image as RNImage, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { Ionicons } from '@expo/vector-icons';
import { supabase, GenerationRow, CollectionRow } from '@/lib/supabase';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';
import { APP_ICON, normalizeImageUri } from '@/lib/images';

const TABS = ['creations', 'collections', 'myMods'] as const;
type Tab = (typeof TABS)[number];

function GenerationGridTile({ item, gridSize }: { item: GenerationRow; gridSize: number }) {
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
      style={{ width: gridSize, height: gridSize, margin: 2 }}
      className="overflow-hidden rounded-lg bg-dark"
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
          <Image
            source={APP_ICON}
            style={{ width: 36, height: 36, opacity: 0.35 }}
            contentFit="contain"
          />
        </View>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const GRID_SIZE = useMemo(() => (width - 32 - 8) / 3, [width]);
  const { user, session } = useAuthStore();
  const { currentStreak, longestStreak } = useStreakStore();
  const { isPro } = useSubscriptionStore();
  const { show } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('creations');
  const [generations, setGenerations] = useState<GenerationRow[]>([]);
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const fetchGenerations = useCallback(async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) {
      console.error('Fetch generations error:', error);
    } else {
      setGenerations(data ?? []);
    }
  }, [session?.user?.id]);

  const fetchCollections = useCallback(async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch collections error:', error);
    } else {
      setCollections(data ?? []);
    }
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
    setNewCollectionName('');
    setCreateModalVisible(true);
  };

  const handleConfirmCreateCollection = async () => {
    const trimmed = newCollectionName.trim();
    setCreateModalVisible(false);
    if (!trimmed || !session?.user) return;
    const { error } = await supabase.from('collections').insert({
      user_id: session.user.id,
      name: trimmed,
      cover_image_url: null,
    });
    
    if (error) {
      show({ message: t('common.error'), type: 'error' });
    } else {
      haptic.success();
      await fetchCollections();
    }
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
          <Ionicons name="settings-outline" size={22} color="rgba(128,128,128,0.8)" />
        </Pressable>
      </View>

      <View className="items-center gap-4 py-6 px-6">
        <Avatar uri={user?.avatar_url} username={user?.username} size="xl" showBorder={isPro} />
        <View className="items-center gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-black dark:text-white font-bold text-xl">
              {user?.username ?? t('common.user')}
            </Text>
            {isPro && <Badge label="PRO" variant="premium" size="sm" />}
          </View>
          {user?.bio && (
            <Text className="text-black/50 dark:text-white/50 text-sm text-center">{user.bio}</Text>
          )}
          <Pressable
            onPress={() => router.push('/edit-profile')}
            className="mt-2 px-4 py-1.5 rounded-lg border border-divider-dark"
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
          <View className="w-px bg-divider-dark" />
          <View className="items-center gap-0.5">
            <Text className="text-black dark:text-white font-bold text-2xl">{currentStreak}</Text>
            <Text className="text-black/40 dark:text-white/40 text-xs">{t('profile.streak', { count: currentStreak })}</Text>
          </View>
          <View className="w-px bg-divider-dark" />
          <View className="items-center gap-0.5">
            <Text className="text-black dark:text-white font-bold text-2xl">{longestStreak}</Text>
            <Text className="text-black/40 dark:text-white/40 text-xs">{t('profile.topStreak', { count: longestStreak })}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row border-b border-divider-dark mx-4 mb-2">
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 items-center ${activeTab === tab ? 'border-b-2 border-lime' : ''}`}
          >
            <Text className={`font-semibold text-sm ${activeTab === tab ? 'text-lime' : 'text-black/40 dark:text-white/40'}`}>
              {tabLabels[tab]}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-off-white dark:bg-black">
      {activeTab === 'creations' ? (
        isLoading ? (
          <>
            {header}
            <View className="flex-row flex-wrap px-4 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <View key={i} style={{ width: GRID_SIZE, height: GRID_SIZE }} className="rounded-lg bg-divider-dark" />
              ))}
            </View>
          </>
        ) : (
          <FlatList
            key="creations-grid"
            data={generations}
            keyExtractor={(item) => item.id}
            numColumns={3}
            ListHeaderComponent={header}
            columnWrapperStyle={{ paddingHorizontal: 14 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#BFFF00" />
            }
            renderItem={({ item }) => <GenerationGridTile item={item} gridSize={GRID_SIZE} />}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Ionicons name="color-palette-outline" size={40} color="rgba(255,255,255,0.3)" />
                <Text className="text-black/40 dark:text-white/40 text-sm">{t('profile.emptyCreations')}</Text>
              </View>
            }
          />
        )
      ) : activeTab === 'collections' ? (
        <FlatList
          key="collections-list"
          data={collections}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {header}
              <Pressable
                onPress={handleCreateCollection}
                className="mx-4 mb-4 py-3 rounded-lg border border-dashed border-divider-dark items-center"
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
              className="mx-4 mb-3 p-4 bg-white dark:bg-dark rounded-xl flex-row items-center gap-3"
            >
              <View className="w-12 h-12 rounded-lg bg-divider-dark items-center justify-center">
                <Ionicons name="folder-outline" size={24} color="rgba(255,255,255,0.5)" />
              </View>
              <View className="flex-1">
                <Text className="text-black dark:text-white font-semibold text-base">{item.name}</Text>
                <Text className="text-black/40 dark:text-white/40 text-xs mt-0.5">
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Ionicons name="folder-open-outline" size={40} color="rgba(255,255,255,0.3)" />
              <Text className="text-black/40 dark:text-white/40 text-sm">{t('collections.emptyState')}</Text>
            </View>
          }
        />
      ) : (
        <>
          {header}
          <View className="items-center justify-center flex-1">
            <Ionicons name="build-outline" size={40} color="rgba(255,255,255,0.3)" />
            <Text className="text-black/40 dark:text-white/40 text-sm">{t('collections.comingSoon')}</Text>
          </View>
        </>
      )}

      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/70 items-center justify-center px-6"
          onPress={() => setCreateModalVisible(false)}
        >
          <Pressable className="w-full bg-dark rounded-2xl p-6 gap-4">
            <Text className="text-white font-bold text-lg">{t('collections.createTitle')}</Text>
            <TextInput
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder={t('collections.createDescription')}
              placeholderTextColor="rgba(255,255,255,0.35)"
              className="bg-black rounded-xl px-4 py-3 text-white"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleConfirmCreateCollection}
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setCreateModalVisible(false)}
                className="flex-1 py-3 rounded-xl border border-divider-dark items-center"
              >
                <Text className="text-white/60 font-semibold">{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmCreateCollection}
                className="flex-1 py-3 rounded-xl bg-lime items-center"
              >
                <Text className="text-black font-bold">{t('common.save')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
