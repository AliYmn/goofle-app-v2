import { View, Text, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';

const STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/gooflo/id0000000000',
  android: 'https://play.google.com/store/apps/details?id=com.gooflo.app',
  default: '',
});

export function ForceUpdate() {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 bg-[#F5F5F5] dark:bg-black">
      <Ionicons name="cloud-download-outline" size={48} color="#BFFF00" />
      <Text className="text-black dark:text-white font-bold text-xl text-center">
        {t('update.title')}
      </Text>
      <Text className="text-black/50 dark:text-white/50 text-sm text-center leading-6">
        {t('update.body')}
      </Text>
      <Button
        label={t('update.cta')}
        variant="primary"
        size="lg"
        fullWidth
        onPress={() => STORE_URL && Linking.openURL(STORE_URL)}
        className="mt-4"
      />
    </View>
  );
}
