import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase, CreditTransactionRow } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { t } from '@/lib/i18n';

const TYPE_LABELS: Record<CreditTransactionRow['type'], { label: string; color: string }> = {
  signup_bonus:     { label: 'Signup Bonus',     color: '#2DD4A8' },
  daily_login:      { label: 'Daily Login',      color: '#2DD4A8' },
  pro_daily_bonus:  { label: 'Pro Daily Bonus',  color: '#8B5CF6' },
  share_bonus:      { label: 'Share Bonus',      color: '#2DD4A8' },
  purchase:         { label: 'Purchase',          color: '#4DA8FF' },
  generation:       { label: 'Generation',        color: '#FF5C5C' },
  onboarding_free:  { label: 'Free Trial',       color: '#2DD4A8' },
  challenge_bonus:  { label: 'Challenge Bonus',  color: '#FF9F43' },
  refund:           { label: 'Refund',            color: '#4DA8FF' },
};

function TransactionItem({ item }: { item: CreditTransactionRow }) {
  const config = TYPE_LABELS[item.type] ?? { label: item.type, color: '#8A8A8A' };
  const isPositive = item.amount > 0;
  const date = new Date(item.created_at);

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1C] border-b border-[#E5E5E3] dark:border-[#3A3A3A]">
      <View className="flex-1 gap-0.5">
        <Text className="text-black dark:text-white font-medium text-base">{config.label}</Text>
        <Text className="text-black/40 dark:text-white/40 text-xs">
          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.description && (
          <Text className="text-black/30 dark:text-white/30 text-xs" numberOfLines={1}>{item.description}</Text>
        )}
      </View>
      <Text
        className="font-bold text-base"
        style={{ color: isPositive ? '#2DD4A8' : '#FF5C5C' }}
      >
        {isPositive ? '+' : ''}{item.amount}
      </Text>
    </View>
  );
}

export default function TransactionHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const [transactions, setTransactions] = useState<CreditTransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    setTransactions(data ?? []);
  }, [session?.user?.id]);

  useEffect(() => {
    setIsLoading(true);
    fetchTransactions().finally(() => setIsLoading(false));
  }, [fetchTransactions]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions();
    setIsRefreshing(false);
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-black/60 dark:text-white/60 text-base">{t('common.back')}</Text>
        </Pressable>
        <Text className="text-black dark:text-white font-bold text-xl">{t('credits.history')}</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#BFFF00" />
        }
        renderItem={({ item }) => <TransactionItem item={item} />}
        ListEmptyComponent={
          isLoading ? null : (
            <View className="items-center justify-center py-20">
              <Text className="text-black/40 dark:text-white/40 text-sm">{t('credits.emptyHistory')}</Text>
            </View>
          )
        }
      />
    </View>
  );
}
