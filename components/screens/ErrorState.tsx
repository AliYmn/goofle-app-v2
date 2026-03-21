import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';

type ErrorType = 'network' | 'server' | 'notFound' | 'rateLimit' | 'generationFailed' | 'premiumRequired';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
  className?: string;
}

const errorConfig: Record<ErrorType, { icon: string; title: string; body: string; cta: string }> = {
  network:          { icon: '📡', title: 'Bağlantı Yok',         body: 'İnternet bağlantını kontrol et.',                cta: 'Yeniden Dene' },
  server:           { icon: '⚡', title: 'Bir Hata Oluştu',      body: 'Sunucumuzda bir sorun var.',                     cta: 'Yeniden Dene' },
  notFound:         { icon: '🔍', title: 'Bulunamadı',            body: 'İçerik bulunamadı ya da kaldırılmış.',           cta: 'Ana Sayfaya Dön' },
  rateLimit:        { icon: '⏱', title: 'Çok Fazla İstek',       body: 'Biraz bekle ve tekrar dene.',                    cta: 'Yeniden Dene' },
  generationFailed: { icon: '🎨', title: 'Üretim Başarısız',      body: 'Fotoğrafın işlenirken hata oluştu.',             cta: 'Tekrar Dene' },
  premiumRequired:  { icon: '⭐', title: 'Pro Özelliği',          body: 'Bu özellik Gooflo Pro üyelerine özeldir.',       cta: "Pro'ya Geç" },
};

export function ErrorState({
  type = 'server',
  title,
  body,
  cta,
  onCta,
  className = '',
}: ErrorStateProps) {
  const config = errorConfig[type];

  return (
    <View className={`flex-1 items-center justify-center gap-4 px-8 ${className}`}>
      <Text className="text-5xl">{config.icon}</Text>
      <Text className="text-black dark:text-white font-bold text-xl text-center">
        {title ?? config.title}
      </Text>
      <Text className="text-black/50 dark:text-white/50 text-sm text-center leading-6">
        {body ?? config.body}
      </Text>
      {onCta && (
        <Button
          label={cta ?? config.cta}
          onPress={onCta}
          variant={type === 'premiumRequired' ? 'primary' : 'outline'}
          size="md"
          className="mt-2"
        />
      )}
    </View>
  );
}
