import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { purchasePackage } from '@/lib/purchases';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

const BENEFITS = t('pro.benefits') as unknown as string[];

export default function ProScreen() {
  const insets = useSafeAreaInsets();
  const { isPro } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    haptic.generate();
    setIsLoading(true);
    try {
      await purchasePackage(selectedPlan);
    } catch (e: any) {
      if (e?.message !== 'Purchase cancelled') {
        Alert.alert('Hata', e?.message ?? 'Satın alma işlemi başarısız.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ paddingBottom: insets.bottom + 16 }} className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <Pressable onPress={() => router.back()}>
          <Text className="text-white/60 text-base">{t('common.close')}</Text>
        </Pressable>
        {isPro && <Badge label={t('pro.alreadyPro')} variant="premium" />}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-2 mb-8">
          <Text className="text-[#BFFF00] font-bold text-4xl">gooflo</Text>
          <Text className="text-[#BFFF00] font-bold text-2xl">PRO</Text>
          <Text className="text-white/60 text-center text-sm mt-1">{t('pro.subtitle')}</Text>
        </View>

        <View className="gap-3 mb-8">
          {BENEFITS.map((benefit, i) => (
            <View key={i} className="flex-row items-center gap-3">
              <View className="w-6 h-6 rounded-full bg-[#BFFF00]/10 items-center justify-center">
                <Text className="text-[#BFFF00] text-xs font-bold">✓</Text>
              </View>
              <Text className="text-white font-medium text-base flex-1">{benefit}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row gap-3 mb-6">
          {(['monthly', 'yearly'] as const).map((plan) => (
            <Pressable
              key={plan}
              onPress={() => { setSelectedPlan(plan); haptic.selection(); }}
              className={`flex-1 rounded-2xl p-4 border-2 ${selectedPlan === plan ? 'border-[#BFFF00] bg-[#BFFF00]/10' : 'border-[#3A3A3A] bg-[#1C1C1C]'}`}
            >
              <Text className={`font-bold text-base mb-1 ${selectedPlan === plan ? 'text-[#BFFF00]' : 'text-white'}`}>
                {t(`pro.${plan}`)}
              </Text>
              {plan === 'yearly' && (
                <Badge label={t('pro.save', { percent: '40' })} variant="lime" size="sm" />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="px-6">
        <Button
          label={isPro ? t('pro.alreadyPro') : t('pro.subscribe')}
          variant="primary"
          size="lg"
          fullWidth
          disabled={isPro}
          isLoading={isLoading}
          onPress={handleSubscribe}
        />
        <Text className="text-white/30 text-xs text-center mt-3">
          İstediğin zaman iptal edebilirsin.
        </Text>
      </View>
    </View>
  );
}
