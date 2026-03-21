import { createContext, useContext, useRef, useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  show: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export const useToast = () => useContext(ToastContext);

type IconName = keyof typeof Ionicons.glyphMap;
const typeConfig: Record<ToastType, { icon: IconName; iconColor: string; bg: string; text: string }> = {
  success: { icon: 'checkmark-circle', iconColor: '#1A1A1A', bg: 'bg-success',  text: 'text-black' },
  error:   { icon: 'close-circle',     iconColor: '#FFFFFF', bg: 'bg-coral',    text: 'text-white' },
  info:    { icon: 'information-circle', iconColor: '#FFFFFF', bg: 'bg-info',     text: 'text-white' },
  warning: { icon: 'alert-circle',     iconColor: '#1A1A1A', bg: 'bg-warning',  text: 'text-black' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    translateY.value = withTiming(-100, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 }, (done) => {
      if (done) runOnJS(setToast)(null);
    });
  }, [translateY, opacity]);

  const show = useCallback(({ message, type = 'success', duration = 2500 }: ToastConfig) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type, duration });
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
    timeoutRef.current = setTimeout(hide, duration);
  }, [translateY, opacity, hide]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const config = toast ? typeConfig[toast.type ?? 'success'] : null;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && config && (
        <Animated.View
          style={[animStyle, { top: insets.top + 8, position: 'absolute', left: 16, right: 16, zIndex: 9999 }]}
          className={`${config.bg} rounded-xl px-4 py-3 flex-row items-center gap-3 shadow-float`}
        >
          <Ionicons name={config.icon} size={20} color={config.iconColor} />
          <Text className={`${config.text} font-medium text-sm flex-1`}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}
