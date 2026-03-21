import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, session, updateProfile } = useAuthStore();

  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url ?? null);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [pendingBase64, setPendingBase64] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ username?: string }>({});

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissions.photoLibrary.title'), t('permissions.denied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setLocalAvatarUri(result.assets[0].uri);
      setPendingBase64(result.assets[0].base64 ?? null);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!pendingBase64 || !session?.user?.id) return avatarUri;

    const filePath = `${session.user.id}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, decode(pendingBase64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      Alert.alert(t('common.error'), uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  const handleSave = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrors({ username: t('errors.validation.required') });
      return;
    }

    setIsSaving(true);
    setErrors({});

    const newAvatarUrl = await uploadAvatar();
    if (localAvatarUri && !newAvatarUrl) {
      setIsSaving(false);
      return;
    }

    const updates: { username?: string; bio?: string; avatar_url?: string } = {};
    if (trimmedUsername !== user?.username) updates.username = trimmedUsername;
    if (bio.trim() !== (user?.bio ?? '')) updates.bio = bio.trim();
    if (newAvatarUrl && newAvatarUrl !== user?.avatar_url) updates.avatar_url = newAvatarUrl;

    if (Object.keys(updates).length === 0) {
      setIsSaving(false);
      router.back();
      return;
    }

    const { error } = await updateProfile(updates);

    setIsSaving(false);

    if (error) {
      if (error.includes('unique') || error.includes('duplicate')) {
        setErrors({ username: t('errors.validation.usernameTaken') });
      } else {
        Alert.alert(t('common.error'), error);
      }
      return;
    }

    haptic.success();
    router.back();
  };

  const displayAvatarUri = localAvatarUri ?? avatarUri;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-black/60 dark:text-white/60 text-base">{t('common.cancel')}</Text>
        </Pressable>
        <Text className="text-black dark:text-white font-bold text-lg">{t('profile.editProfile')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center py-6">
          <Pressable onPress={pickAvatar}>
            <Avatar uri={displayAvatarUri} username={username} size="xl" />
            <View className="absolute bottom-0 right-0 bg-lime w-7 h-7 rounded-full items-center justify-center">
              <Text className="text-black text-xs font-bold">+</Text>
            </View>
          </Pressable>
          <Pressable onPress={pickAvatar} className="mt-2">
            <Text className="text-lime font-semibold text-sm">{t('profile.edit.changePhoto')}</Text>
          </Pressable>
        </View>

        <View className="px-4 gap-4">
          <Input
            label={t('profile.edit.username')}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors({});
            }}
            error={errors.username}
            placeholder={t('profile.edit.usernamePlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
          />

          <View>
            <Text className="text-black/60 dark:text-white/60 text-sm font-medium mb-1.5">
              {t('profile.edit.bio')}
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder={t('profile.edit.bioPlaceholder')}
              placeholderTextColor="#8A8A8A"
              multiline
              maxLength={150}
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white dark:bg-[#1C1C1C] text-black dark:text-white border border-[#3A3A3A] rounded-lg px-4 py-3 text-base min-h-[80px]"
            />
            <Text className="text-black/30 dark:text-white/30 text-xs mt-1 text-right">
              {bio.length}/150
            </Text>
          </View>

          <Button
            label={isSaving ? t('common.loading') : t('common.save')}
            isLoading={isSaving}
            onPress={handleSave}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </View>
  );
}
