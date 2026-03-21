import { View, Text, Pressable, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '@/lib/i18n';

export default function PromptLibraryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-off-white dark:bg-black">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-white/60 text-base">{t('common.back')}</Text>
        </Pressable>
        <Text className="text-black dark:text-white font-bold text-xl">Prompt Kütüphanesi</Text>
      </View>
      <FlatList
        data={[]}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={() => null}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 gap-4">
            <Text className="text-5xl">💡</Text>
            <Text className="text-white/40 text-sm">Prompt kütüphanesi yakında...</Text>
          </View>
        }
      />
    </View>
  );
}
