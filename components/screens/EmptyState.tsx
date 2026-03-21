import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

type IconName = keyof typeof Ionicons.glyphMap;

interface EmptyStateProps {
  title: string;
  body: string;
  cta?: string;
  onCta?: () => void;
  icon?: IconName;
  className?: string;
}

export function EmptyState({ title, body, cta, onCta, icon = 'sparkles-outline', className = '' }: EmptyStateProps) {
  return (
    <View className={`flex-1 items-center justify-center gap-4 px-8 ${className}`}>
      <Ionicons name={icon} size={48} color="rgba(255,255,255,0.3)" />
      <Text className="text-black dark:text-white font-bold text-xl text-center">{title}</Text>
      <Text className="text-black/50 dark:text-white/50 text-sm text-center leading-6">{body}</Text>
      {cta && onCta && (
        <Button label={cta} onPress={onCta} variant="outline" size="md" className="mt-2" />
      )}
    </View>
  );
}
