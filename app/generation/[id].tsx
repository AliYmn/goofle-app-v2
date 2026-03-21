import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Share, ActivityIndicator, Switch, Image as RNImage, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Ionicons } from '@expo/vector-icons';
import { supabase, GenerationRow, CollectionRow } from '@/lib/supabase';
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

  const imageUrl = generation?.result_image_url ?? capturedImageUrl;
  const resolvedImageUrl = useMemo(() => normalizeImageUri(imageUrl, 'generations'), [imageUrl]);

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
      .then(({ data }) => {
        if (data) {
          setGeneration(data);
          setIsPublic(data.is_public);
        }
        setIsLoading(false);
      });
  }, [id]);

  const handleShare = async () => {
    if (!imageUrl) return;
    haptic.medium();
    analytics.sharePressed('generation_detail');
    const result = await Share.share({ message: 'gooflo.yamapps.com ile ürettim!', url: imageUrl });
    if (result.action === Share.sharedAction && generation?.id && session) {
      const { data } = await supabase.functions.invoke('claim-share-bonus', {
        body: { generationId: generation.id },
      });
      if (data?.credits_awarded > 0 && session.user) {
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

    const { data: collections } = await supabase
      .from('collections')
      .select('id, name')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!collections || collections.length === 0) {
      setNewCollectionName('');
      setCreateModalVisible(true);
      return;
    }

    // Pick from existing collections via action sheet (works cross-platform)
    const { Alert } = await import('react-native');
    const buttons = collections.map((col: CollectionRow) => ({
      text: col.name,
      onPress: async () => {
        await supabase.from('collection_items').insert({
          collection_id: col.id,
          generation_id: generation.id,
        });
        haptic.success();
        show({ message: t('collections.added'), type: 'success' });
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
    const { data: newCol } = await supabase
      .from('collections')
      .insert({ user_id: session.user.id, name: trimmed, cover_image_url: null })
      .select('id')
      .single();
    if (newCol) {
      await supabase.from('collection_items').insert({
        collection_id: newCol.id,
        generation_id: generation.id,
      });
      haptic.success();
      show({ message: t('collections.added'), type: 'success' });
    }
  };

  return (
    <View style={{ paddingBottom: insets.bottom + 16 }} className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>
        <Badge label={t('generation.aiDisclosure')} variant="default" size="sm" />
      </View>

      <View className="flex-1 px-4">
        <View className="w-full aspect-square rounded-2xl overflow-hidden bg-dark">
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

        {generation && (
          <View className="flex-row items-center justify-between mt-4 px-1">
            <Text className="text-white/60 text-sm">
              {isPublic ? t('generation.makePrivate') : t('generation.makePublic')}
            </Text>
            <Switch
              value={isPublic}
              onValueChange={handleTogglePublic}
              disabled={toggling}
              trackColor={{ false: '#3A3A3A', true: '#BFFF00' }}
              thumbColor="#FFFFFF"
            />
          </View>
        )}
      </View>

      <View className="px-4 gap-3 mt-4">
        <View className="flex-row gap-3">
          <Button
            label={t('generation.share')}
            variant="primary"
            size="md"
            fullWidth
            disabled={!imageUrl}
            onPress={handleShare}
          />
          <Button
            label={t('generation.regenerate')}
            variant="outline"
            size="md"
            fullWidth
            onPress={handleRegenerate}
          />
        </View>
        <Button
          label={t('generation.addToCollection')}
          variant="ghost"
          size="sm"
          fullWidth
          onPress={handleAddToCollection}
        />
      </View>

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
