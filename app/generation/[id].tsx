import { useEffect, useState } from 'react';
import { View, Text, Pressable, Share, ActivityIndicator, Switch } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { supabase, GenerationRow } from '@/lib/supabase';
import { useGenerationStore } from '@/stores/useGenerationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCreditStore } from '@/stores/useCreditStore';
import { analytics } from '@/lib/analytics';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

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

  const imageUrl = generation?.result_image_url ?? storeResultImageUrl;

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
      show({ message: 'Ayar kaydedilemedi', type: 'error' });
    }
    setToggling(false);
  };

  const handleRegenerate = () => {
    router.back();
  };

  return (
    <View style={{ paddingBottom: insets.bottom + 16 }} className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Text className="text-white text-2xl">✕</Text>
        </Pressable>
        <Badge label={t('generation.aiDisclosure')} variant="default" size="sm" />
      </View>

      <View className="flex-1 px-4">
        <View className="w-full aspect-square rounded-2xl overflow-hidden bg-[#1C1C1C]">
          {isLoading ? (
            <ActivityIndicator color="#BFFF00" style={{ flex: 1 }} />
          ) : imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
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
          onPress={() => {}}
        />
      </View>
    </View>
  );
}
