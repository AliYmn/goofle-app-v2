import { View, Text, Pressable } from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

const TABS = [
  { name: '(tabs)/index',      icon: '✦',  activeIcon: '✦',  labelKey: 'tabs.feed' },
  { name: '(tabs)/explore',    icon: '⊞',  activeIcon: '⊞',  labelKey: 'tabs.explore' },
  { name: '(tabs)/create',     icon: '+',  activeIcon: '+',  labelKey: 'tabs.create', isCreate: true },
  { name: '(tabs)/leaderboard',icon: '▲',  activeIcon: '▲',  labelKey: 'tabs.leaderboard' },
  { name: '(tabs)/profile',    icon: '○',  activeIcon: '●',  labelKey: 'tabs.profile' },
];

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: insets.bottom + 4 }}
      className="flex-row bg-black dark:bg-[#1A1A1A] border-t border-[#2D2D2D] px-2 pt-2"
    >
      {state.routes.map((route, index) => {
        const tab = TABS[index];
        if (!tab) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          haptic.selection();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (tab.isCreate) {
          return (
            <View key={route.key} className="flex-1 items-center">
              <Pressable
                onPress={onPress}
                className="w-14 h-14 -mt-4 bg-lime rounded-full items-center justify-center shadow-float"
              >
                <Text className="text-black text-3xl font-bold leading-none">+</Text>
              </Pressable>
            </View>
          );
        }

        return (
          <TabItem
            key={route.key}
            icon={isFocused ? tab.activeIcon : tab.icon}
            label={t(tab.labelKey)}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

function TabItem({
  icon,
  label,
  isFocused,
  onPress,
}: {
  icon: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      className="flex-1 items-center gap-1 py-1"
    >
      <Animated.View style={animStyle}>
        <Text className={`text-xl ${isFocused ? 'text-lime' : 'text-white/40'}`}>{icon}</Text>
      </Animated.View>
      <Text className={`text-[10px] ${isFocused ? 'text-lime font-semibold' : 'text-white/40'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
