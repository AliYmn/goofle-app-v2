import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { supabase, PromptLibraryRow } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

function PromptCard({
  item,
  userId,
  onVote,
}: {
  item: PromptLibraryRow;
  userId?: string;
  onVote: (promptId: string) => void;
}) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(item.prompt_text);
    haptic.success();
  };

  return (
    <View className="bg-white dark:bg-[#1C1C1C] rounded-xl p-4 mb-3 gap-3">
      <Text className="text-black dark:text-white text-base leading-6" selectable>
        {item.prompt_text}
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => onVote(item.id)} className="flex-row items-center gap-1">
            <Text className="text-lime text-sm">▲</Text>
            <Text className="text-black/50 dark:text-white/50 text-sm font-medium">{item.vote_count}</Text>
          </Pressable>
          <Text className="text-black/30 dark:text-white/30 text-xs">
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            onPress={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-[#3A3A3A]"
          >
            <Text className="text-white text-xs font-medium">{t('promptLibrary.copy')}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: '/create-mod', params: { prompt: item.prompt_text } })}
            className="px-3 py-1.5 rounded-lg bg-lime"
          >
            <Text className="text-black text-xs font-medium">{t('promptLibrary.createMod')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function PromptLibraryScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const { show } = useToast();

  const [prompts, setPrompts] = useState<PromptLibraryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');

  const fetchPrompts = useCallback(async () => {
    const { data } = await supabase
      .from('prompt_library')
      .select('*')
      .order('vote_count', { ascending: false })
      .limit(50);
    setPrompts(data ?? []);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchPrompts().finally(() => setIsLoading(false));
  }, [fetchPrompts]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchPrompts();
    setIsRefreshing(false);
  };

  const handleAddPrompt = async () => {
    const trimmed = newPrompt.trim();
    if (!trimmed || !session?.user) return;

    const { error } = await supabase.from('prompt_library').insert({
      user_id: session.user.id,
      prompt_text: trimmed,
    });

    if (error) {
      show({ message: error.message, type: 'error' });
      return;
    }

    setNewPrompt('');
    setIsAdding(false);
    haptic.success();
    show({ message: t('promptLibrary.added'), type: 'success' });
    await fetchPrompts();
  };

  const handleVote = async (promptId: string) => {
    if (!session?.user) return;

    const { data: existing } = await supabase
      .from('prompt_votes')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('prompt_id', promptId)
      .maybeSingle();

    if (existing) {
      await supabase.from('prompt_votes').delete().eq('id', existing.id);
      await supabase.rpc('decrement_prompt_votes', { p_id: promptId }).catch(() => {});
    } else {
      await supabase.from('prompt_votes').insert({ user_id: session.user.id, prompt_id: promptId });
      await supabase.rpc('increment_prompt_votes', { p_id: promptId }).catch(() => {});
    }

    haptic.selection();
    await fetchPrompts();
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-black/60 dark:text-white/60 text-base">{t('common.back')}</Text>
        </Pressable>
        <Text className="text-black dark:text-white font-bold text-lg">{t('promptLibrary.title')}</Text>
        <Pressable onPress={() => setIsAdding(!isAdding)}>
          <Text className="text-lime font-semibold text-sm">
            {isAdding ? t('common.cancel') : '+ ' + t('promptLibrary.share')}
          </Text>
        </Pressable>
      </View>

      {isAdding && (
        <View className="px-4 pb-4 gap-3">
          <Input
            value={newPrompt}
            onChangeText={setNewPrompt}
            placeholder={t('promptLibrary.placeholder')}
            multiline
            maxLength={300}
          />
          <Button
            label={t('promptLibrary.sharePrompt')}
            variant="primary"
            size="md"
            fullWidth
            disabled={!newPrompt.trim()}
            onPress={handleAddPrompt}
          />
        </View>
      )}

      <FlatList
        data={prompts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#BFFF00" />
        }
        renderItem={({ item }) => (
          <PromptCard item={item} userId={session?.user?.id} onVote={handleVote} />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <View className="items-center justify-center py-20 gap-4">
              <Text className="text-5xl">💡</Text>
              <Text className="text-black/40 dark:text-white/40 text-sm">{t('promptLibrary.empty')}</Text>
            </View>
          )
        }
      />
    </View>
  );
}
