import { View, Text, Linking } from 'react-native';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';

type PermissionType = 'camera' | 'photoLibrary' | 'notifications';

interface PrePermissionProps {
  type: PermissionType;
  onAllow: () => void;
  onSkip: () => void;
  isDenied?: boolean;
}

const permissionConfig: Record<PermissionType, { icon: string }> = {
  camera:       { icon: '📸' },
  photoLibrary: { icon: '🖼' },
  notifications: { icon: '🔔' },
};

export function PrePermission({ type, onAllow, onSkip, isDenied = false }: PrePermissionProps) {
  const config = permissionConfig[type];

  if (isDenied) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8 bg-[#F5F5F5] dark:bg-black">
        <Text className="text-5xl">{config.icon}</Text>
        <Text className="text-black dark:text-white font-bold text-xl text-center">
          {t(`permissions.${type}.title`)}
        </Text>
        <Text className="text-black/50 dark:text-white/50 text-sm text-center">
          {t('permissions.denied')}
        </Text>
        <Button
          label={t('permissions.openSettings')}
          variant="primary"
          size="md"
          onPress={() => Linking.openSettings()}
          className="mt-2"
        />
        <Button
          label={t('common.back')}
          variant="ghost"
          size="sm"
          onPress={onSkip}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 bg-[#F5F5F5] dark:bg-black">
      <Text className="text-5xl">{config.icon}</Text>
      <Text className="text-black dark:text-white font-bold text-xl text-center">
        {t(`permissions.${type}.title`)}
      </Text>
      <Text className="text-black/50 dark:text-white/50 text-sm text-center leading-6">
        {t(`permissions.${type}.body`)}
      </Text>
      <Button
        label={t(`permissions.${type}.cta`)}
        variant="primary"
        size="lg"
        onPress={onAllow}
        className="mt-4"
        fullWidth
      />
      <Button
        label={t('common.cancel')}
        variant="ghost"
        size="sm"
        onPress={onSkip}
      />
    </View>
  );
}
