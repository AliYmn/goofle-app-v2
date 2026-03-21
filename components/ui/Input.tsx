import { useState } from 'react';
import { View, Text, TextInput, Pressable, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerClassName = '',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? 'border-coral'
    : isFocused
    ? 'border-lime'
    : 'border-[#3A3A3A]';

  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label && (
        <Text className="text-black dark:text-white font-semibold text-sm">{label}</Text>
      )}

      <View className={`flex-row items-center border ${borderColor} rounded-lg bg-white dark:bg-dark px-4 h-12`}>
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          className="flex-1 text-black dark:text-white text-base font-medium"
          placeholderTextColor="#8A8A8A"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && (
          <Pressable onPress={onRightIconPress} className="ml-3">
            {rightIcon}
          </Pressable>
        )}
      </View>

      {error ? (
        <Text className="text-coral text-xs">{error}</Text>
      ) : hint ? (
        <Text className="text-black/40 dark:text-white/40 text-xs">{hint}</Text>
      ) : null}
    </View>
  );
}
