import { View, Text, Pressable } from 'react-native';
import { haptic } from '@/lib/haptics';

interface CreditPillProps {
  balance: number;
  onPress?: () => void;
}

export function CreditPill({ balance, onPress }: CreditPillProps) {
  return (
    <Pressable
      onPress={() => { haptic.tap(); onPress?.(); }}
      className="flex-row items-center gap-1 bg-dark dark:bg-[#363636] rounded-full px-3 py-1.5"
    >
      <Text className="text-lime text-sm">⚡</Text>
      <Text className="text-white font-bold text-sm">{balance}</Text>
    </Pressable>
  );
}
