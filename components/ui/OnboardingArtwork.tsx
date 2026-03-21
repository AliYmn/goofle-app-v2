import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_SPLASH_ICON } from '@/lib/images';

type OnboardingArtworkVariant = 'process' | 'launch';

interface OnboardingArtworkProps {
  variant: OnboardingArtworkVariant;
}

function ProcessArtwork() {
  return (
    <View className="h-[240px] w-full items-center justify-center">
      <View className="absolute h-[192px] w-[192px] rounded-[40px] border border-white/10 bg-[#121212]" />

      <View className="absolute left-2 top-3 rounded-[28px] border border-white/10 bg-white/5 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-lime/15">
            <Ionicons name="camera-outline" size={20} color="#BFFF00" />
          </View>
          <View className="gap-1">
            <Text className="text-xs font-bold uppercase tracking-[1px] text-white/80">Capture</Text>
            <Text className="text-xs text-white/45">Selfie ready</Text>
          </View>
        </View>
      </View>

      <View className="absolute right-0 top-14 rounded-[28px] border border-white/10 bg-white/5 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-lime/15">
            <Ionicons name="color-palette-outline" size={20} color="#BFFF00" />
          </View>
          <View className="gap-1">
            <Text className="text-xs font-bold uppercase tracking-[1px] text-white/80">Style</Text>
            <Text className="text-xs text-white/45">Choose a mod</Text>
          </View>
        </View>
      </View>

      <View className="absolute bottom-2 left-8 rounded-[28px] border border-white/10 bg-white/5 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-lime/15">
            <Ionicons name="sparkles-outline" size={20} color="#BFFF00" />
          </View>
          <View className="gap-1">
            <Text className="text-xs font-bold uppercase tracking-[1px] text-white/80">Generate</Text>
            <Text className="text-xs text-white/45">Share instantly</Text>
          </View>
        </View>
      </View>

      <View className="h-32 w-32 items-center justify-center rounded-[32px] bg-lime shadow-2xl">
        <Image
          source={APP_SPLASH_ICON}
          style={{ width: 72, height: 72 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function LaunchArtwork() {
  return (
    <View className="h-[260px] w-full items-center justify-center">
      <View className="absolute top-6 h-[188px] w-[244px] rotate-[-8deg] rounded-[36px] border border-white/10 bg-[#101010]" />
      <View className="absolute top-7 h-[188px] w-[244px] rotate-[7deg] rounded-[36px] border border-white/10 bg-[#161616]" />

      <View className="h-[188px] w-[244px] rounded-[36px] border border-white/10 bg-[#1A1A1A] px-5 py-5">
        <View className="mb-4 self-end rounded-full border border-lime/20 bg-lime/15 px-3 py-1">
          <Text className="text-[11px] font-bold uppercase tracking-[1px] text-lime">1 free</Text>
        </View>

        <View className="flex-row items-center justify-center gap-3">
          <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-white/5">
            <Image
              source={APP_SPLASH_ICON}
              style={{ width: 44, height: 44, opacity: 0.65 }}
              resizeMode="contain"
            />
          </View>
          <Ionicons name="arrow-forward" size={28} color="#BFFF00" />
          <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-lime">
            <Image
              source={APP_SPLASH_ICON}
              style={{ width: 52, height: 52 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="mt-5 rounded-[24px] border border-white/10 bg-black/20 px-4 py-3">
          <Text className="text-center text-sm font-semibold text-white">AI transformation ready</Text>
        </View>
      </View>
    </View>
  );
}

export function OnboardingArtwork({ variant }: OnboardingArtworkProps) {
  if (variant === 'launch') {
    return <LaunchArtwork />;
  }

  return <ProcessArtwork />;
}
