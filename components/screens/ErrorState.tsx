import { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/i18n';

type IconName = keyof typeof Ionicons.glyphMap;

type ErrorType = 'network' | 'server' | 'notFound' | 'rateLimit' | 'generationFailed' | 'premiumRequired';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
  className?: string;
  rateLimitSeconds?: number;
}

const errorConfig: Record<ErrorType, { icon: IconName; titleKey: string; bodyKey: string; ctaKey: string }> = {
  network:          { icon: 'cloud-offline-outline', titleKey: 'errors.noConnection.title',    bodyKey: 'errors.noConnection.body',    ctaKey: 'errors.noConnection.cta' },
  server:           { icon: 'warning-outline',       titleKey: 'errors.serverError.title',     bodyKey: 'errors.serverError.body',     ctaKey: 'errors.serverError.cta' },
  notFound:         { icon: 'search-outline',        titleKey: 'errors.notFound.title',        bodyKey: 'errors.notFound.body',        ctaKey: 'errors.notFound.cta' },
  rateLimit:        { icon: 'timer-outline',         titleKey: 'errors.rateLimit.title',       bodyKey: 'errors.rateLimit.body',       ctaKey: 'errors.rateLimit.cta' },
  generationFailed: { icon: 'color-wand-outline',   titleKey: 'errors.generationFailed.title', bodyKey: 'errors.generationFailed.body', ctaKey: 'errors.generationFailed.cta' },
  premiumRequired:  { icon: 'diamond-outline',      titleKey: 'errors.premiumRequired.title', bodyKey: 'errors.premiumRequired.body', ctaKey: 'errors.premiumRequired.cta' },
};

export function ErrorState({
  type = 'server',
  title,
  body,
  cta,
  onCta,
  className = '',
  rateLimitSeconds = 30,
}: ErrorStateProps) {
  const config = errorConfig[type];
  const [countdown, setCountdown] = useState(type === 'rateLimit' ? rateLimitSeconds : 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (type !== 'rateLimit') return;
    setCountdown(rateLimitSeconds);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [type, rateLimitSeconds]);

  const isRateLimited = type === 'rateLimit' && countdown > 0;

  return (
    <View className={`flex-1 items-center justify-center gap-4 px-8 ${className}`}>
      <Ionicons name={config.icon} size={48} color="#BFFF00" />
      <Text className="text-black dark:text-white font-bold text-xl text-center">
        {title ?? t(config.titleKey)}
      </Text>
      <Text className="text-black/50 dark:text-white/50 text-sm text-center leading-6">
        {body ?? t(config.bodyKey)}
      </Text>
      {isRateLimited && (
        <Text className="text-lime font-bold text-2xl">{countdown}s</Text>
      )}
      {onCta && (
        <Button
          label={cta ?? t(config.ctaKey)}
          onPress={onCta}
          variant={type === 'premiumRequired' ? 'primary' : 'outline'}
          size="md"
          disabled={isRateLimited}
          className="mt-2"
        />
      )}
    </View>
  );
}
