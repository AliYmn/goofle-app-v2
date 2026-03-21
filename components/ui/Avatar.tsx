import { View, Text } from 'react-native';
import { Image } from 'expo-image';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  username?: string | null;
  size?: AvatarSize;
  className?: string;
  showBorder?: boolean;
}

const sizeMap: Record<AvatarSize, { px: number; text: string; container: string }> = {
  xs: { px: 24,  text: 'text-[10px]', container: 'w-6 h-6 rounded-full' },
  sm: { px: 32,  text: 'text-xs',     container: 'w-8 h-8 rounded-full' },
  md: { px: 40,  text: 'text-sm',     container: 'w-10 h-10 rounded-full' },
  lg: { px: 56,  text: 'text-base',   container: 'w-14 h-14 rounded-full' },
  xl: { px: 80,  text: 'text-xl',     container: 'w-20 h-20 rounded-full' },
};

const getInitials = (username?: string | null): string => {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
};

export function Avatar({ uri, username, size = 'md', className = '', showBorder = false }: AvatarProps) {
  const { px, text, container } = sizeMap[size];
  const borderClass = showBorder ? 'border-2 border-lime' : '';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: px, height: px, borderRadius: px / 2 }}
        className={`${borderClass} ${className}`}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={200}
      />
    );
  }

  return (
    <View className={`${container} ${borderClass} bg-dark items-center justify-center ${className}`}>
      <Text className={`${text} text-lime font-bold`}>{getInitials(username)}</Text>
    </View>
  );
}
