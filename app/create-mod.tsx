import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { normalizeImageUri } from '@/lib/images';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

const CATEGORIES = ['Fantasy', 'Anime', '3D', 'Vintage', 'Cyberpunk', 'Horror', 'Funny', 'Art', 'Other'];

export default function CreateModScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const { show } = useToast();

  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; prompt?: string; category?: string }>({});

  const generateThumbnail = async () => {
    if (!prompt.trim()) {
      setErrors((prev) => ({ ...prev, prompt: t('errors.validation.required') }));
      return;
    }

    setIsGeneratingThumb(true);
    const slug = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || `mod_${Date.now()}`;

    const { data, error } = await supabase.functions.invoke('generate-mod-thumbnail', {
      body: { prompt: prompt.trim(), slug },
    });

    setIsGeneratingThumb(false);

    if (error || !data?.thumbnailUrl) {
      show({ message: t('common.error'), type: 'error' });
      return;
    }

    setThumbnailUrl(data.thumbnailUrl);
    haptic.success();
  };

  const handlePublish = async () => {
    const trimmedName = name.trim();
    const trimmedPrompt = prompt.trim();
    const newErrors: typeof errors = {};

    if (!trimmedName) newErrors.name = t('errors.validation.required');
    if (!trimmedPrompt) newErrors.prompt = t('errors.validation.required');
    if (!category) newErrors.category = t('errors.validation.required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsPublishing(true);

    const slug = trimmedName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + `_${Date.now()}`;

    const { error } = await supabase.from('mods').insert({
      name: trimmedName,
      slug,
      prompt: trimmedPrompt,
      thumbnail_url: thumbnailUrl,
      thumbnail_blurhash: null,
      category,
      type: 'community' as const,
      creator_id: session?.user?.id ?? null,
      is_prompt_public: true,
      is_premium: false,
      credit_cost: 1,
    });

    setIsPublishing(false);

    if (error) {
      show({ message: error.message, type: 'error' });
      return;
    }

    haptic.success();
    show({ message: t('mods.created'), type: 'success' });
    router.back();
  };

  const resolvedThumb = thumbnailUrl ? normalizeImageUri(thumbnailUrl, 'mod-thumbs') : null;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-black/60 dark:text-white/60 text-base">{t('common.cancel')}</Text>
        </Pressable>
        <Text className="text-black dark:text-white font-bold text-lg">{t('mods.createMod')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4 mt-4">
          <Input
            label={t('mods.modName')}
            value={name}
            onChangeText={(v) => { setName(v); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
            error={errors.name}
            placeholder={t('mods.modNamePlaceholder')}
            maxLength={50}
          />

          <View>
            <Text className="text-black/60 dark:text-white/60 text-sm font-medium mb-1.5">
              {t('mods.modPrompt')}
            </Text>
            <Input
              value={prompt}
              onChangeText={(v) => { setPrompt(v); if (errors.prompt) setErrors((p) => ({ ...p, prompt: undefined })); }}
              error={errors.prompt}
              placeholder={t('mods.modPromptPlaceholder')}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text className="text-black/30 dark:text-white/30 text-xs mt-1 text-right">
              {prompt.length}/500
            </Text>
          </View>

          <View>
            <Text className="text-black/60 dark:text-white/60 text-sm font-medium mb-2">
              {t('mods.category')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => { setCategory(cat); if (errors.category) setErrors((p) => ({ ...p, category: undefined })); haptic.selection(); }}
                  className={`px-3 py-2 rounded-lg ${category === cat ? 'bg-lime' : 'bg-white dark:bg-[#1C1C1C] border border-[#3A3A3A]'}`}
                >
                  <Text className={`text-sm font-medium ${category === cat ? 'text-black' : 'text-black/60 dark:text-white/60'}`}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.category && <Text className="text-coral text-xs mt-1">{errors.category}</Text>}
          </View>

          <View>
            <Text className="text-black/60 dark:text-white/60 text-sm font-medium mb-2">
              {t('mods.thumbnail')}
            </Text>
            {resolvedThumb ? (
              <View className="items-center gap-3">
                <View className="w-40 h-40 rounded-xl overflow-hidden">
                  <Image source={{ uri: resolvedThumb }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                </View>
                <Button
                  label={t('mods.regenerateThumbnail')}
                  variant="outline"
                  size="sm"
                  isLoading={isGeneratingThumb}
                  onPress={generateThumbnail}
                />
              </View>
            ) : (
              <Button
                label={t('mods.generateThumbnail')}
                variant="secondary"
                size="md"
                fullWidth
                isLoading={isGeneratingThumb}
                onPress={generateThumbnail}
              />
            )}
          </View>

          <Button
            label={t('mods.publish')}
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isPublishing}
            disabled={!name.trim() || !prompt.trim() || !category}
            onPress={handlePublish}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </View>
  );
}
