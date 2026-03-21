import { forwardRef, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import GBottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetProps as GBottomSheetProps,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomSheetProps {
  snapPoints?: (string | number)[];
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

export type BottomSheetRef = GBottomSheet;

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ snapPoints = ['50%'], title, onClose, children }, ref) => {
    const insets = useSafeAreaInsets();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
        />
      ),
      [],
    );

    return (
      <GBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#2D2D2D' }}
        handleIndicatorStyle={{ backgroundColor: '#555555', width: 40 }}
        onChange={(index) => { if (index === -1) onClose?.(); }}
      >
        <BottomSheetView style={{ flex: 1, paddingBottom: insets.bottom + 16 }}>
          {title && (
            <View className="px-6 pb-4 flex-row items-center justify-between border-b border-[#3A3A3A]">
              <Text className="text-white font-bold text-lg">{title}</Text>
              {onClose && (
                <Pressable
                  onPress={onClose}
                  className="w-8 h-8 items-center justify-center rounded-full bg-[#3A3A3A]"
                >
                  <Text className="text-white text-lg">✕</Text>
                </Pressable>
              )}
            </View>
          )}
          <View className="px-6 pt-4">{children}</View>
        </BottomSheetView>
      </GBottomSheet>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';
