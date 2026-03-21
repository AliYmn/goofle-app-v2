import { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';

interface MaintenanceModeProps {
  onRetry: () => void;
}

export function MaintenanceMode({ onRetry }: MaintenanceModeProps) {
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRetry();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onRetry]);

  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 bg-[#F5F5F5] dark:bg-black">
      <Text className="text-5xl">🔧</Text>
      <Text className="text-black dark:text-white font-bold text-xl text-center">
        {t('maintenance.title')}
      </Text>
      <Text className="text-black/50 dark:text-white/50 text-sm text-center leading-6">
        {t('maintenance.body')}
      </Text>
      <Text className="text-black/30 dark:text-white/30 text-xs mt-2">
        {t('common.retry')} ({countdown}s)
      </Text>
      <Button
        label={t('common.retry')}
        variant="outline"
        size="md"
        onPress={() => { setCountdown(30); onRetry(); }}
        className="mt-2"
      />
    </View>
  );
}
