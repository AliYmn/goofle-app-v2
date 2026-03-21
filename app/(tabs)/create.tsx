import { View, Text, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { CreditPill } from '@/components/ui/CreditPill';
import { ProgressOverlay } from '@/components/ui/ProgressOverlay';
import { useGenerationStore } from '@/stores/useGenerationStore';
import { useCreditStore } from '@/stores/useCreditStore';
import { useGeneration } from '@/hooks/useGeneration';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { sourceImageUri, selectedMod, setSourceImageUri, customPrompt, setCustomPrompt } =
    useGenerationStore();
  const { balance } = useCreditStore();
  const { status, resultImageUrl, startGeneration, reset } = useGeneration();

  const isGenerating = status === 'submitting' || status === 'processing';

  const pickFromGallery = async () => {
    const { status: permStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permStatus !== 'granted') {
      Alert.alert(t('permissions.photoLibrary.title'), t('permissions.photoLibrary.body'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setSourceImageUri(result.assets[0].uri);
      haptic.selection();
    }
  };

  const takePhoto = async () => {
    const { status: permStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (permStatus !== 'granted') {
      Alert.alert(t('permissions.camera.title'), t('permissions.camera.body'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setSourceImageUri(result.assets[0].uri);
      haptic.selection();
    }
  };

  const handleGenerate = async () => {
    if (!sourceImageUri || !selectedMod) return;
    haptic.generate();
    await startGeneration({
      modId: selectedMod.id,
      modSlug: selectedMod.slug,
      sourceImageUrl: sourceImageUri,
      customPrompt: customPrompt || undefined,
    });
  };

  const handleGenerationComplete = () => {
    if (resultImageUrl) {
      router.push(`/generation/new`);
    }
    reset();
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-black dark:text-white font-bold text-xl">{t('create.title')}</Text>
        <CreditPill balance={balance} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140, gap: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full aspect-square rounded-2xl bg-white dark:bg-[#1C1C1C] border-2 border-dashed border-[#3A3A3A] items-center justify-center overflow-hidden">
          {sourceImageUri ? (
            <>
              <Image
                source={{ uri: sourceImageUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              <Pressable
                onPress={() => setSourceImageUri(null)}
                className="absolute top-3 right-3 bg-black/60 rounded-full w-8 h-8 items-center justify-center"
              >
                <Text className="text-white text-xs font-bold">✕</Text>
              </Pressable>
            </>
          ) : (
            <View className="items-center gap-4">
              <Text className="text-5xl">📸</Text>
              <Text className="text-black/40 dark:text-white/40 font-medium text-sm">
                {t('create.selectPhoto')}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={takePhoto}
                  className="bg-[#BFFF00]/10 rounded-lg px-4 py-2"
                >
                  <Text className="text-[#BFFF00] font-semibold text-sm">{t('create.camera')}</Text>
                </Pressable>
                <Pressable
                  onPress={pickFromGallery}
                  className="bg-black/10 dark:bg-white/10 rounded-lg px-4 py-2"
                >
                  <Text className="text-black dark:text-white font-semibold text-sm">
                    {t('create.gallery')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => router.push('/explore')}
          className="bg-white dark:bg-[#1C1C1C] rounded-xl p-4 flex-row items-center justify-between"
        >
          <View className="gap-0.5">
            <Text className="text-black/40 dark:text-white/40 text-xs">{t('create.selectMod')}</Text>
            <Text className="text-black dark:text-white font-bold text-base">
              {selectedMod?.name ?? 'Mod seçilmedi'}
            </Text>
          </View>
          <Text className="text-[#BFFF00] font-semibold text-sm">
            {selectedMod ? t('create.changeMod') : 'Seç →'}
          </Text>
        </Pressable>

        {selectedMod && (
          <View className="gap-2">
            <Text className="text-black dark:text-white font-semibold text-sm">
              {t('create.customizePrompt')}
            </Text>
            <TextInput
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder="İsteğe bağlı ek detaylar..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              numberOfLines={3}
              className="bg-white dark:bg-[#1C1C1C] rounded-xl p-4 text-black dark:text-white text-sm min-h-[80px]"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        )}
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute bottom-0 left-0 right-0 px-4 pt-4 bg-[#F5F5F5]/90 dark:bg-black/90"
      >
        {selectedMod && (
          <Text className="text-black/40 dark:text-white/40 text-xs text-center mb-3">
            {t('create.creditCost', { cost: selectedMod.credit_cost, balance })}
          </Text>
        )}
        <Button
          label={t('create.generate')}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!sourceImageUri || !selectedMod}
          isLoading={isGenerating}
          onPress={handleGenerate}
        />
      </View>

      <ProgressOverlay visible={isGenerating} />
    </View>
  );
}
