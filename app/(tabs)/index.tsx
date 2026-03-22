import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFeedStore } from '@/stores/useFeedStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCreditStore } from '@/stores/useCreditStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { ImageCard } from '@/components/ui/ImageCard';
import { EmptyState } from '@/components/screens/EmptyState';
import { ImageCardSkeleton } from '@/components/ui/Skeleton';
import { CreditPill } from '@/components/ui/CreditPill';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { GenerationRow } from '@/lib/supabase';

const PAGE_SIZE = 20;

type FeedUser = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type FeedMod = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { posts, setPosts, appendPosts, isRefreshing, setRefreshing, hasMore, setHasMore, toggleLike, likedPostIds } =
    useFeedStore();
  const { session } = useAuthStore();
  const { balance, refreshBalance } = useCreditStore();
  const { currentStreak, refreshStreak } = useStreakStore();
  const cursorRef = useRef<string | null>(null);
  const [usersById, setUsersById] = useState<Record<string, FeedUser>>({});
  const [modsById, setModsById] = useState<Record<string, FeedMod>>({});
  const [likeCountByGenerationId, setLikeCountByGenerationId] = useState<Record<string, number>>({});
  const isInitialLoad = posts.length === 0;

  const hydrateFeedContext = useCallback(async (rows: GenerationRow[]) => {
    if (rows.length === 0) {
      setUsersById({});
      setModsById({});
      setLikeCountByGenerationId({});
      return;
    }

    const userIds = Array.from(new Set(rows.map((row) => row.user_id)));
    const modIds = Array.from(new Set(rows.map((row) => row.mod_id)));
    const generationIds = rows.map((row) => row.id);

    const [{ data: users }, { data: mods }, { data: likes }] = await Promise.all([
      supabase.from('users').select('id, username, avatar_url').in('id', userIds),
      supabase.from('mods').select('id, name, slug, category').in('id', modIds),
      supabase.from('likes').select('generation_id').in('generation_id', generationIds),
    ]);

    setUsersById(
      Object.fromEntries((users ?? []).map((user) => [user.id, user as FeedUser])),
    );
    setModsById(
      Object.fromEntries((mods ?? []).map((mod) => [mod.id, mod as FeedMod])),
    );

    const likeCounts = (likes ?? []).reduce<Record<string, number>>((acc, like) => {
      acc[like.generation_id] = (acc[like.generation_id] ?? 0) + 1;
      return acc;
    }, {});

    setLikeCountByGenerationId(likeCounts);
  }, []);

  const fetchFeed = useCallback(async (reset = false) => {
    const cursor = reset ? null : cursorRef.current;
    let query = supabase
      .from('generations')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (cursor) query = query.lt('created_at', cursor);

    const { data } = await query;
    if (!data) return;

    if (reset) {
      setPosts(data);
    } else {
      appendPosts(data);
    }

    setHasMore(data.length === PAGE_SIZE);
    cursorRef.current = data[data.length - 1]?.created_at ?? null;
    await hydrateFeedContext(reset ? data : [...posts, ...data]);
  }, [appendPosts, hydrateFeedContext, posts, setHasMore, setPosts]);

  const fetchMyLikes = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('likes')
      .select('generation_id')
      .eq('user_id', session.user.id);
    if (data) {
      data.forEach((row) => toggleLike(row.generation_id));
    }
  }, [session?.user?.id, toggleLike]);

  const claimDailyLogin = useCallback(async () => {
    if (!session) return;
    await supabase.functions.invoke('claim-daily-login');
    if (session.user && balance === 0) {
      refreshBalance(session.user.id);
    }
  }, [session, balance, refreshBalance]);

  useEffect(() => {
    fetchFeed(true);
    fetchMyLikes();
    claimDailyLogin();
    if (session?.user) {
      refreshBalance(session.user.id);
      refreshStreak(session.user.id);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    cursorRef.current = null;
    await fetchFeed(true);
    setRefreshing(false);
  };

  const handleEndReached = () => {
    if (hasMore && !isRefreshing) fetchFeed(false);
  };

  const handleLike = async (postId: string) => {
    if (!session?.user) return;
    const isLiked = likedPostIds.has(postId);
    toggleLike(postId);
    setLikeCountByGenerationId((current) => ({
      ...current,
      [postId]: Math.max(0, (current[postId] ?? 0) + (isLiked ? -1 : 1)),
    }));
    if (isLiked) {
      await supabase.from('likes').delete().eq('generation_id', postId).eq('user_id', session.user.id);
    } else {
      await supabase.from('likes').insert({ generation_id: postId, user_id: session.user.id });
    }
  };

  const creatorCount = useMemo(() => Object.keys(usersById).length, [usersById]);

  const header = (
    <View className="pb-5">
      <View
        style={{ paddingTop: Math.max(insets.top + 2, 16) }}
        className="rounded-b-[34px] bg-[#BFFF00] px-4 pb-6"
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-2">
            <Text className="text-[36px] font-black text-[#1A1A1A]">
              gooflo
              <Text className="text-[#FF5C5C]">.</Text>
            </Text>
            <Text className="max-w-[240px] text-sm font-semibold leading-5 text-[#1A1A1A]/78">
              Make it weird. Make it viral.
            </Text>
          </View>
          <View className="gap-2 pt-1">
            <CreditPill balance={balance} onPress={() => router.push('/settings')} />
            <StreakBadge count={currentStreak} size="sm" />
          </View>
        </View>

        <View className="mt-5 rounded-[24px] border border-[#1A1A1A]/10 bg-[#F2F2F0] p-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-lg font-extrabold text-[#1A1A1A]">Fresh weird drops</Text>
              <Text className="text-sm font-medium leading-5 text-[#1A1A1A]/62">
                Viral denemeler, official modlar ve topluluğun son işleri tek akışta.
              </Text>
            </View>
            <View className="rounded-full bg-[#1A1A1A] px-3 py-2">
              <Ionicons name="sparkles" size={16} color="#BFFF00" />
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-[18px] bg-white px-4 py-3">
              <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-[#1A1A1A]/45">
                Live posts
              </Text>
              <Text className="mt-1 text-2xl font-black text-[#1A1A1A]">{posts.length}</Text>
            </View>
            <View className="flex-1 rounded-[18px] bg-white px-4 py-3">
              <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-[#1A1A1A]/45">
                Creators
              </Text>
              <Text className="mt-1 text-2xl font-black text-[#1A1A1A]">{creatorCount}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 pt-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xl font-extrabold text-[#1A1A1A] dark:text-white">Trending feed</Text>
            <Text className="mt-1 text-sm font-medium leading-5 text-[#1A1A1A]/55 dark:text-white/55">
              Official mods, weird selfies, fast drops.
            </Text>
          </View>
          <View className="rounded-full border border-[#E5E5E3] bg-white px-3 py-1.5 dark:border-[#3A3A3A] dark:bg-[#2D2D2D]">
            <Text className="text-xs font-semibold text-[#1A1A1A]/70 dark:text-white/70">
              {posts.length} cards
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F2F2F0] dark:bg-[#1A1A1A]">
      {isInitialLoad && !isRefreshing ? (
        <View className="pb-8">
          {header}
          <View className="px-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <ImageCardSkeleton key={i} />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#BFFF00" />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <View className="px-4">
              <ImageCard
                id={item.id}
                imageUrl={item.result_image_url ?? ''}
                blurhash={item.blurhash}
                username={usersById[item.user_id]?.username}
                avatarUrl={usersById[item.user_id]?.avatar_url}
                modName={modsById[item.mod_id]?.name}
                likeCount={likeCountByGenerationId[item.id] ?? 0}
                isLiked={likedPostIds.has(item.id)}
                onPress={() => router.push(`/generation/${item.id}`)}
                onLike={() => handleLike(item.id)}
                onTryMod={modsById[item.mod_id]?.slug ? () => router.push(`/mod/${modsById[item.mod_id].slug}`) : undefined}
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="mx-4 rounded-[24px] border border-[#E5E5E3] bg-white p-6 dark:border-[#3A3A3A] dark:bg-[#2D2D2D]">
              <EmptyState
                title={t('feed.empty.title')}
                body={t('feed.empty.body')}
                cta={t('feed.empty.cta')}
                icon="sparkles-outline"
                onCta={() => router.push('/(tabs)/create')}
              />
            </View>
          }
        />
      )}
    </View>
  );
}
