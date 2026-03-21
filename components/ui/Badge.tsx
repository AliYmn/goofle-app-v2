import { View, Text } from 'react-native';

type BadgeVariant = 'default' | 'lime' | 'coral' | 'premium' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default:  { container: 'bg-[#3A3A3A]',           text: 'text-white' },
  lime:     { container: 'bg-lime',                  text: 'text-black' },
  coral:    { container: 'bg-coral',                 text: 'text-white' },
  premium:  { container: 'bg-premium',               text: 'text-white' },
  info:     { container: 'bg-info',                  text: 'text-white' },
};

const sizeClasses = {
  sm: { container: 'px-2 py-0.5 rounded', text: 'text-xs' },
  md: { container: 'px-3 py-1 rounded-md', text: 'text-sm' },
};

export function Badge({ label, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const { container, text } = variantClasses[variant];
  const { container: sc, text: st } = sizeClasses[size];

  return (
    <View className={`${container} ${sc} ${className}`}>
      <Text className={`${text} ${st} font-semibold`}>{label}</Text>
    </View>
  );
}
