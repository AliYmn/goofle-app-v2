import { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
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
import { normalizeImageUri } from '@/lib/images';

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { sourceImageUri, selectedMod, setSourceImageUri, customPrompt, setCustomPrompt } =
    useGenerationStore();
  const { balance } = useCreditStore();
  const { status, startGeneration, reset } = useGeneration();

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

  useEffect(() => {
    if (status === 'completed') {
      router.push('/generation/new');
      reset();
    }
  }, [status]);

  const selectedModThumb = selectedMod ? normalizeImageUri(selectedMod.thumbnail_url, 'mod-thumbs') : null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-off-white dark:bg-black"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-black dark:text-white font-heading text-2xl">{t('create.title')}</Text>
        <CreditPill balance={balance} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160, gap: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo Upload Area */}
        <View className="gap-3">
          <Text className="text-black/40 dark:text-white/40 font-bold text-xs uppercase tracking-widest ml-1">
            {t('create.selectPhoto')}
          </Text>
          <View className="w-full aspect-square rounded-[32px] bg-white dark:bg-dark border border-divider-light dark:border-divider-dark items-center justify-center overflow-hidden shadow-sm">
            {sourceImageUri ? (
              <>
                <Image
                  source={{ uri: sourceImageUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => { setSourceImageUri(null); haptic.tap(); }}
                  className="absolute top-4 right-4 bg-black/70 rounded-full w-10 h-10 items-center justify-center border border-white/20"
                >
                  <Ionicons name="close" size={20} color="white" />
                </Pressable>
              </>
            ) : (
              <View className="items-center px-8 w-full gap-6">
                <View className="w-20 h-20 rounded-full bg-lime/10 items-center justify-center">
                  <Ionicons name="camera" size={32} color="#BFFF00" />
                </View>
                <View className="flex-row gap-3 w-full">
                  <Pressable
                    onPress={takePhoto}
                    className="flex-1 bg-lime h-12 rounded-2xl items-center justify-center"
                  >
                    <Text className="text-black font-bold text-sm">{t('create.camera')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={pickFromGallery}
                    className="flex-1 bg-black dark:bg-white h-12 rounded-2xl items-center justify-center"
                  >
                    <Text className="text-white dark:text-black font-bold text-sm">
                      {t('create.gallery')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Mod Selection Area */}
        <View className="gap-3">
          <Text className="text-black/40 dark:text-white/40 font-bold text-xs uppercase tracking-widest ml-1">
            {t('create.selectMod')}
          </Text>
          <Pressable
            onPress={() => { router.push('/explore'); haptic.tap(); }}
            className="bg-white dark:bg-dark rounded-2xl p-4 flex-row items-center gap-4 border border-divider-light dark:border-divider-dark shadow-sm"
          >
            <View className="w-14 h-14 rounded-xl bg-off-white dark:bg-black items-center justify-center overflow-hidden border border-divider-light dark:border-divider-dark">
              {selectedModThumb ? (
                <Image
                  source={{ uri: selectedModThumb }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="color-palette" size={24} color="rgba(128,128,128,0.4)" />
              )}
            </View>
            
            <View className="flex-1 gap-0.5">
              <Text className="text-black dark:text-white font-bold text-base">
                {selectedMod?.name ?? t('create.noneSelected')}
              </Text>
              <Text className="text-black/40 dark:text-white/40 text-xs">
                {selectedMod ? t('create.changeMod') : t('create.selectMod')}
              </Text>
            </View>

            <View className="w-8 h-8 rounded-full bg-off-white dark:bg-black items-center justify-center">
              <Ionicons name="chevron-forward" size={16} color="rgba(128,128,128,0.6)" />
            </View>
          </Pressable>
        </View>

        {/* Custom Prompt Area */}
        {selectedMod && (
          <View className="gap-3">
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-black/40 dark:text-white/40 font-bold text-xs uppercase tracking-widest">
                {t('create.customizePrompt')}
              </Text>
              <Ionicons name="sparkles" size={14} color="#BFFF00" />
            </View>
            <TextInput
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder={t('create.customizePlaceholder')}
              placeholderTextColor="rgba(128,128,128,0.4)"
              multiline
              className="bg-white dark:bg-dark rounded-2xl p-4 text-black dark:text-white text-sm min-h-[100px] border border-divider-light dark:border-divider-dark shadow-sm"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        )}
      </ScrollView>

      {/* Action Footer */}
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute bottom-0 left-0 right-0 px-6 pt-6 bg-off-white/95 dark:bg-black/95 border-t border-divider-light dark:border-divider-dark"
      >
        <View className="gap-4">
          {selectedMod && (
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="flash" size={12} color="#BFFF00" />
              <Text className="text-black/40 dark:text-white/40 text-xs font-bold">
                {t('create.creditCost', { cost: selectedMod.credit_cost, balance })}
              </Text>
            </View>
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
      </View>

      <ProgressOverlay visible={isGenerating} />
    </KeyboardAvoidingView>
  );
}
