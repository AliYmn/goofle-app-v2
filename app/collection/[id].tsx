import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '@/lib/i18n';

export default function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-off-white dark:bg-black">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-white/60 text-base">{t('common.back')}</Text>
        </Pressable>
        <Text className="text-black dark:text-white font-bold text-xl">Koleksiyon</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-white/40 text-sm">Koleksiyon içeriği yükleniyor... ({id})</Text>
      </View>
    </View>
  );
}
