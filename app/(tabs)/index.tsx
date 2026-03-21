import { useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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

const PAGE_SIZE = 20;

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { posts, setPosts, appendPosts, isRefreshing, setRefreshing, hasMore, setHasMore, toggleLike, likedPostIds } =
    useFeedStore();
  const { session } = useAuthStore();
  const { balance, refreshBalance } = useCreditStore();
  const { currentStreak, refreshStreak } = useStreakStore();
  const cursorRef = useRef<string | null>(null);
  const isInitialLoad = posts.length === 0;

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
  }, [setPosts, appendPosts, setHasMore]);

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
    if (isLiked) {
      await supabase.from('likes').delete().eq('generation_id', postId).eq('user_id', session.user.id);
    } else {
      await supabase.from('likes').insert({ generation_id: postId, user_id: session.user.id });
    }
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-black dark:text-[#BFFF00] font-bold text-2xl">gooflo.</Text>
        <View className="flex-row items-center gap-2">
          <StreakBadge count={currentStreak} size="sm" />
          <CreditPill balance={balance} onPress={() => router.push('/settings')} />
        </View>
      </View>

      {isInitialLoad && !isRefreshing ? (
        <View className="px-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ImageCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#BFFF00" />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <ImageCard
              id={item.id}
              imageUrl={item.result_image_url ?? ''}
              blurhash={item.blurhash}
              isLiked={likedPostIds.has(item.id)}
              onPress={() => router.push(`/generation/${item.id}`)}
              onLike={() => handleLike(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title={t('feed.empty.title')}
              body={t('feed.empty.body')}
              cta={t('feed.empty.cta')}
              icon="🌟"
              onCta={() => router.push('/(tabs)/create')}
            />
          }
        />
      )}
    </View>
  );
}
