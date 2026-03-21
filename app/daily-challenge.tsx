import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { supabase, DailyChallengeRow, UserChallengeRow } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCreditStore } from '@/stores/useCreditStore';
import { haptic } from '@/lib/haptics';
import { t, getLocale } from '@/lib/i18n';

export default function DailyChallengeScreen() {
  const insets = useSafeAreaInsets();
  const { session, user } = useAuthStore();
  const { refreshBalance } = useCreditStore();
  const { show } = useToast();

  const [challenge, setChallenge] = useState<DailyChallengeRow | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  const lang = getLocale();

  useEffect(() => {
    const fetchChallenge = async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data: challengeData } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('active_date', today)
        .single();

      if (challengeData) {
        setChallenge(challengeData);

        if (session?.user) {
          const { data: completion } = await supabase
            .from('user_challenges')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('challenge_id', challengeData.id)
            .maybeSingle();

          setIsCompleted(!!completion);
        }
      }
      setIsLoading(false);
    };

    fetchChallenge();
  }, [session?.user?.id]);

  const handleClaim = async () => {
    if (!challenge || !session?.user) return;
    setIsClaiming(true);

    const { data, error } = await supabase.functions.invoke('claim-daily-challenge', {
      body: { challengeId: challenge.id },
    });

    setIsClaiming(false);

    if (error) {
      show({ message: t('common.error'), type: 'error' });
      return;
    }

    setIsCompleted(true);
    haptic.success();

    if (data?.creditsAwarded > 0) {
      show({ message: `+${data.creditsAwarded} ${t('challenge.bonusCredits')}`, type: 'success' });
      refreshBalance(session.user.id);
    }
  };

  const title = challenge ? (lang === 'tr' ? challenge.title_tr : challenge.title_en) : '';
  const description = challenge ? (lang === 'tr' ? challenge.description_tr : challenge.description_en) : '';

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-black/60 dark:text-white/60 text-base">{t('common.back')}</Text>
        </Pressable>
        <Text className="text-black dark:text-white font-bold text-xl">{t('challenge.title')}</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-black/40 dark:text-white/40">{t('common.loading')}</Text>
        </View>
      ) : !challenge ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl mb-4">🎯</Text>
          <Text className="text-black/40 dark:text-white/40 text-base text-center">
            {t('challenge.noChallenge')}
          </Text>
        </View>
      ) : (
        <View className="px-6 py-8 gap-6">
          <View className="bg-white dark:bg-[#1C1C1C] rounded-2xl p-6 gap-4">
            <View className="items-center">
              <Text className="text-4xl mb-2">🎯</Text>
              <Text className="text-black dark:text-white font-bold text-xl text-center">{title}</Text>
              <Text className="text-black/50 dark:text-white/50 text-base text-center mt-2">{description}</Text>
            </View>

            <View className="flex-row items-center justify-center gap-2 py-3 bg-lime/10 rounded-xl">
              <Text className="text-lime font-bold text-lg">+{challenge.bonus_credits}</Text>
              <Text className="text-black/60 dark:text-white/60 text-sm">{t('challenge.bonusCredits')}</Text>
            </View>

            {isCompleted ? (
              <View className="items-center py-3">
                <Text className="text-success font-bold text-base">{t('challenge.completed')}</Text>
              </View>
            ) : (
              <Button
                label={t('challenge.claim')}
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isClaiming}
                onPress={handleClaim}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}
