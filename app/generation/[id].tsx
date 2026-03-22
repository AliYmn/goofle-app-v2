import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Share, ActivityIndicator, Switch, Image as RNImage, Modal, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { supabase, GenerationRow, ModRow, UserRow } from '@/lib/supabase';
import { useGenerationStore } from '@/stores/useGenerationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCreditStore } from '@/stores/useCreditStore';
import { analytics } from '@/lib/analytics';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';
import { APP_ICON, normalizeImageUri } from '@/lib/images';

export default function GenerationDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { show } = useToast();

  const storeResultImageUrl = useGenerationStore((s) => s.resultImageUrl);
  const { session } = useAuthStore();
  const { refreshBalance } = useCreditStore();

  const [generation, setGeneration] = useState<GenerationRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [toggling, setToggling] = useState(false);
  // Capture on mount so the URL survives a store reset while this screen is shown
  const [capturedImageUrl] = useState<string | null>(() => storeResultImageUrl);
  const [hasImageError, setHasImageError] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creator, setCreator] = useState<UserRow | null>(null);
  const [mod, setMod] = useState<ModRow | null>(null);

  const imageUrl = generation?.result_image_url ?? capturedImageUrl;
  const resolvedImageUrl = useMemo(() => normalizeImageUri(imageUrl, 'generations'), [imageUrl]);
  const createdLabel = useMemo(() => {
    if (!generation?.created_at) return null;
    return new Date(generation.created_at).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    });
  }, [generation?.created_at]);

  useEffect(() => {
    setHasImageError(false);
  }, [resolvedImageUrl]);

  useEffect(() => {
    if (!id || id === 'new') {
      setIsLoading(false);
      return;
    }
    supabase
      .from('generations')
      .select('*')
      .eq('id', id)
      .single()
      .then(async ({ data, error }) => {
        if (error) {
          show({ message: t('errors.notFound.body'), type: 'error' });
          router.back();
          return;
        }
        if (data) {
          setGeneration(data);
          setIsPublic(data.is_public);
          const [{ data: creatorData }, { data: modData }] = await Promise.all([
            supabase.from('users').select('*').eq('id', data.user_id).maybeSingle(),
            supabase.from('mods').select('*').eq('id', data.mod_id).maybeSingle(),
          ]);
          setCreator(creatorData ?? null);
          setMod(modData ?? null);
        }
        setIsLoading(false);
      });
  }, [id]);

  const handleShare = async () => {
    if (!imageUrl) return;
    haptic.medium();
    analytics.sharePressed('generation_detail');
    const result = await Share.share({ message: t('generation.shareMessage'), url: imageUrl });
    if (result.action === Share.sharedAction && generation?.id && session) {
      const { data, error } = await supabase.functions.invoke('claim-share-bonus', {
        body: { generationId: generation.id },
      });
      if (error) {
        console.error('Share bonus error:', error);
      } else if (data?.credits_awarded > 0 && session.user) {
        show({ message: t('credits.shareBonus', { count: data.credits_awarded }), type: 'success' });
        refreshBalance(session.user.id);
      }
    }
  };

  const handleTogglePublic = async (value: boolean) => {
    if (!generation) return;
    setToggling(true);
    const { error } = await supabase
      .from('generations')
      .update({ is_public: value })
      .eq('id', generation.id);
    if (!error) {
      setIsPublic(value);
      haptic.selection();
    } else {
      show({ message: t('generation.saveFailed'), type: 'error' });
    }
    setToggling(false);
  };

  const handleRegenerate = () => {
    router.back();
  };

  const handleAddToCollection = async () => {
    if (!generation || !session?.user) return;

    const { data: collections, error } = await supabase
      .from('collections')
      .select('id, name')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      show({ message: t('common.error'), type: 'error' });
      return;
    }

    if (!collections || collections.length === 0) {
      setNewCollectionName('');
      setCreateModalVisible(true);
      return;
    }

    // Pick from existing collections via action sheet (works cross-platform)
    const { Alert } = await import('react-native');
    const buttons = collections.map((col) => ({
      text: col.name,
      onPress: () => {
        void (async () => {
          const { error: insError } = await supabase.from('collection_items').insert({
            collection_id: col.id,
            generation_id: generation.id,
          });
          if (insError) {
            show({ message: t('common.error'), type: 'error' });
          } else {
            haptic.success();
            show({ message: t('collections.added'), type: 'success' });
          }
        })();
      },
    }));
    buttons.push({ text: t('common.cancel'), onPress: () => {} });
    Alert.alert(t('collections.selectCollection'), '', buttons);
  };

  const handleConfirmCreateCollection = async () => {
    if (!generation || !session?.user) { setCreateModalVisible(false); return; }
    const trimmed = newCollectionName.trim();
    setCreateModalVisible(false);
    if (!trimmed) return;
    const { data: newCol, error } = await supabase
      .from('collections')
      .insert({ user_id: session.user.id, name: trimmed, cover_image_url: null })
      .select('id')
      .single();
    
    if (error || !newCol) {
      show({ message: t('common.error'), type: 'error' });
      return;
    }

    const { error: insError } = await supabase.from('collection_items').insert({
      collection_id: newCol.id,
      generation_id: generation.id,
    });

    if (insError) {
      show({ message: t('common.error'), type: 'error' });
    } else {
      haptic.success();
      show({ message: t('collections.added'), type: 'success' });
    }
  };

  return (
    <View className="flex-1 bg-[#F2F2F0] dark:bg-[#1A1A1A]">
      <View
        style={{ paddingTop: Math.max(insets.top + 2, 16) }}
        className="rounded-b-[34px] bg-[#BFFF00] px-4 pb-5"
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#1A1A1A]"
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <Badge label={t('generation.aiDisclosure')} variant="default" size="sm" className="bg-[#1A1A1A]" />
        </View>

        <View className="mt-5 flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-2">
            <Text className="text-[30px] font-black text-[#1A1A1A]">
              {mod?.name ?? 'Gooflo drop'}
            </Text>
            <Text className="text-sm font-semibold leading-5 text-[#1A1A1A]/75">
              Tek üretim değil, paylaşılabilir bir drop gibi hissetmeli.
            </Text>
          </View>
          {createdLabel ? (
            <View className="rounded-full bg-[#F2F2F0] px-3 py-1.5">
              <Text className="text-xs font-bold text-[#1A1A1A]">{createdLabel}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden rounded-[28px] border border-[#E5E5E3] bg-white dark:border-[#3A3A3A] dark:bg-[#2D2D2D]">
          <View className="relative">
            <View className="w-full aspect-square overflow-hidden bg-[#1A1A1A]">
              {isLoading ? (
                <ActivityIndicator color="#BFFF00" style={{ flex: 1 }} />
              ) : resolvedImageUrl && !hasImageError ? (
                <Image
                  source={{ uri: resolvedImageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={300}
                  onError={() => setHasImageError(true)}
                />
              ) : (
                <View className="flex-1 items-center justify-center gap-3">
                  <RNImage source={APP_ICON} style={{ width: 64, height: 64, opacity: 0.35 }} resizeMode="contain" />
                  <Text className="text-white/30 text-sm">Görüntü bulunamadı</Text>
                </View>
              )}
            </View>

            {mod?.category ? (
              <View className="absolute left-4 top-4 rounded-full bg-[#F2F2F0] px-3 py-1.5 dark:bg-[#1A1A1A]">
                <Text className="text-xs font-bold text-[#1A1A1A] dark:text-white">{mod.category}</Text>
              </View>
            ) : null}
          </View>

          <View className="gap-4 px-4 py-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-3">
                <Avatar uri={creator?.avatar_url} username={creator?.username} size="sm" />
                <View>
                  <Text className="text-base font-extrabold text-[#1A1A1A] dark:text-white">
                    {creator?.username ?? 'anon'}
                  </Text>
                  <Text className="text-sm font-medium text-[#1A1A1A]/55 dark:text-white/55">
                    {mod?.type === 'official' ? 'Official mod drop' : 'Community remix'}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={mod?.slug ? () => router.push(`/mod/${mod.slug}`) : undefined}
                disabled={!mod?.slug}
                className={`rounded-full px-3 py-2 ${mod?.slug ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A]/20'}`}
              >
                <Text className={`text-xs font-bold ${mod?.slug ? 'text-[#BFFF00]' : 'text-[#1A1A1A]/45'}`}>
                  Mod details
                </Text>
              </Pressable>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 rounded-[18px] bg-[#F2F2F0] px-4 py-3 dark:bg-[#1A1A1A]">
                <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-[#1A1A1A]/45 dark:text-white/45">
                  Visibility
                </Text>
                <Text className="mt-1 text-base font-extrabold text-[#1A1A1A] dark:text-white">
                  {isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
              <View className="flex-1 rounded-[18px] bg-[#F2F2F0] px-4 py-3 dark:bg-[#1A1A1A]">
                <Text className="text-xs font-semibold uppercase tracking-[0.8px] text-[#1A1A1A]/45 dark:text-white/45">
                  Status
                </Text>
                <Text className="mt-1 text-base font-extrabold text-[#1A1A1A] dark:text-white">
                  {generation?.status ?? 'completed'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {generation ? (
          <View className="rounded-[24px] border border-[#E5E5E3] bg-white px-4 py-4 dark:border-[#3A3A3A] dark:bg-[#2D2D2D]">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text className="text-base font-extrabold text-[#1A1A1A] dark:text-white">
                  {isPublic ? t('generation.makePrivate') : t('generation.makePublic')}
                </Text>
                <Text className="mt-1 text-sm font-medium leading-5 text-[#1A1A1A]/58 dark:text-white/58">
                  Feed’de görünürlüğünü buradan anında değiştir.
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={handleTogglePublic}
                disabled={toggling}
                trackColor={{ false: '#D9D9D5', true: '#BFFF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        ) : null}

        <View className="gap-3">
          <View className="flex-row gap-3">
            <Button
              label={t('generation.share')}
              variant="primary"
              size="md"
              fullWidth
              disabled={!imageUrl}
              leftIcon={<Ionicons name="share-social-outline" size={18} color="#1A1A1A" />}
              onPress={handleShare}
            />
            <Button
              label={t('generation.regenerate')}
              variant="secondary"
              size="md"
              fullWidth
              leftIcon={<Ionicons name="refresh-outline" size={18} color="#FFFFFF" />}
              onPress={handleRegenerate}
            />
          </View>
          <Button
            label={t('generation.addToCollection')}
            variant="outline"
            size="md"
            fullWidth
            leftIcon={<Ionicons name="bookmark-outline" size={18} color="#BFFF00" />}
            onPress={handleAddToCollection}
          />
        </View>
      </ScrollView>

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
          <Pressable className="w-full rounded-[24px] bg-[#2D2D2D] p-6 gap-4">
            <Text className="text-white font-bold text-lg">{t('collections.createTitle')}</Text>
            <TextInput
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder={t('collections.createDescription')}
              placeholderTextColor="rgba(255,255,255,0.35)"
              className="rounded-xl bg-[#1A1A1A] px-4 py-3 text-white"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => { void handleConfirmCreateCollection(); }}
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setCreateModalVisible(false)}
                className="flex-1 py-3 rounded-xl border border-[#3A3A3A] items-center"
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
