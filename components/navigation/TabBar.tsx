import { View, Text, Pressable } from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: { name: string; icon: IconName; activeIcon: IconName; labelKey: string; isCreate?: boolean }[] = [
  { name: '(tabs)/index',       icon: 'compass-outline',      activeIcon: 'compass',          labelKey: 'tabs.feed' },
  { name: '(tabs)/explore',     icon: 'grid-outline',         activeIcon: 'grid',             labelKey: 'tabs.explore' },
  { name: '(tabs)/create',      icon: 'add',                  activeIcon: 'add',              labelKey: 'tabs.create', isCreate: true },
  { name: '(tabs)/leaderboard', icon: 'trophy-outline',       activeIcon: 'trophy',           labelKey: 'tabs.leaderboard' },
  { name: '(tabs)/profile',     icon: 'person-circle-outline', activeIcon: 'person-circle',   labelKey: 'tabs.profile' },
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
                <Ionicons name="add" size={32} color="#1A1A1A" />
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
  icon: IconName;
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
        <Ionicons name={icon} size={22} color={isFocused ? '#BFFF00' : 'rgba(255,255,255,0.4)'} />
      </Animated.View>
      <Text className={`text-[10px] ${isFocused ? 'text-lime font-semibold' : 'text-white/40'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
