import { useRef } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';
import { pressIn, pressOut } from '@/lib/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: Variant;
  size?: Size;
  label: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const variantClasses: Record<Variant, { container: string; text: string }> = {
  primary:   { container: 'bg-lime active:bg-lime-dark',        text: 'text-black font-bold' },
  secondary: { container: 'bg-dark active:bg-[#3a3a3a]',        text: 'text-white font-semibold' },
  outline:   { container: 'border border-lime bg-transparent',  text: 'text-lime font-semibold' },
  ghost:     { container: 'bg-transparent',                      text: 'text-lime font-semibold' },
  danger:    { container: 'bg-coral active:bg-coral-dark',       text: 'text-white font-bold' },
};

const sizeClasses: Record<Size, { container: string; text: string }> = {
  sm: { container: 'h-10 px-4 rounded-md',     text: 'text-sm' },
  md: { container: 'h-12 px-6 rounded-lg',     text: 'text-base' },
  lg: { container: 'h-14 px-8 rounded-lg',     text: 'text-lg' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  onPress,
  className = '',
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = pressIn();
    haptic.tap();
  };

  const handlePressOut = () => {
    scale.value = pressOut();
  };

  const isDisabled = disabled || isLoading;
  const { container, text } = variantClasses[variant];
  const { container: sizeContainer, text: sizeText } = sizeClasses[size];

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${container} ${sizeContainer} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#1A1A1A' : '#BFFF00'}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text className={`${text} ${sizeText} ${leftIcon ? 'ml-2' : ''} ${rightIcon ? 'mr-2' : ''}`}>
            {label}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </AnimatedPressable>
  );
}
