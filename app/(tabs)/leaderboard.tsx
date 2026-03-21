import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { supabase } from '@/lib/supabase';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

const PERIOD_TABS = [
  { key: 'daily',   label: t('leaderboard.daily') },
  { key: 'weekly',  label: t('leaderboard.weekly') },
  { key: 'monthly', label: t('leaderboard.monthly') },
] as const;

const CATEGORY_TABS = [
  { key: 'most_liked',    label: t('leaderboard.mostLiked') },
  { key: 'longest_streak', label: t('leaderboard.longestStreak') },
  { key: 'most_used_mods', label: t('leaderboard.mostUsedMods') },
] as const;

type PeriodKey = (typeof PERIOD_TABS)[number]['key'];
type CategoryKey = (typeof CATEGORY_TABS)[number]['key'];

const RANK_ICONS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

interface LeaderboardEntry {
  id: string;
  score: number;
  user_id: string;
  users: { username: string | null; avatar_url: string | null } | null;
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<PeriodKey>('weekly');
  const [category, setCategory] = useState<CategoryKey>('most_liked');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEntries = useCallback(async (p = period, c = category) => {
    const now = new Date();
    let periodStart: string;
    if (p === 'daily') {
      periodStart = now.toISOString().slice(0, 10);
    } else if (p === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.getFullYear(), now.getMonth(), diff);
      periodStart = monday.toISOString().slice(0, 10);
    } else {
      periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }

    const { data } = await supabase
      .from('leaderboard_entries')
      .select('id, score, user_id, users(username, avatar_url)')
      .eq('period_type', p)
      .eq('ranking_category', c)
      .eq('period_start', periodStart)
      .order('score', { ascending: false })
      .limit(50);

    setEntries((data as unknown as LeaderboardEntry[]) ?? []);
  }, [period, category]);

  useEffect(() => {
    setIsLoading(true);
    fetchEntries(period, category).finally(() => setIsLoading(false));
  }, [period, category]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchEntries(period, category);
    setIsRefreshing(false);
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="px-4 pt-3 pb-2 gap-3">
        <Text className="text-black dark:text-white font-bold text-2xl">{t('leaderboard.title')}</Text>

        <View className="flex-row gap-2">
          {PERIOD_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => { setPeriod(tab.key); haptic.tap(); }}
            >
              <Badge label={tab.label} variant={period === tab.key ? 'lime' : 'default'} size="md" />
            </Pressable>
          ))}
        </View>

        <View className="flex-row gap-2 flex-wrap">
          {CATEGORY_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => { setCategory(tab.key); haptic.tap(); }}
            >
              <Badge
                label={tab.label}
                variant={category === tab.key ? 'coral' : 'default'}
                size="sm"
              />
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View className="px-4 gap-3 mt-2">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#BFFF00" />
          }
          renderItem={({ item, index }) => (
            <View className="flex-row items-center gap-3 py-3 border-b border-[#3A3A3A]">
              <Text className="text-2xl w-8 text-center font-bold">
                {RANK_ICONS[index + 1] ?? (
                  <Text className="text-black dark:text-white text-sm font-bold">{index + 1}</Text>
                )}
              </Text>
              <Avatar
                uri={item.users?.avatar_url}
                username={item.users?.username}
                size="md"
              />
              <View className="flex-1">
                <Text className="text-black dark:text-white font-semibold">
                  {item.users?.username ?? 'Kullanıcı'}
                </Text>
                <Text className="text-black/40 dark:text-white/40 text-xs">
                  {item.score.toLocaleString()} puan
                </Text>
              </View>
              {index < 3 && (
                <Text className="text-2xl">{RANK_ICONS[index + 1]}</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 gap-4">
              <Ionicons name="trophy-outline" size={48} color="rgba(255,255,255,0.3)" />
              <Text className="text-black/40 dark:text-white/40 text-sm text-center">
                Bu dönemde henüz kayıt yok.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
