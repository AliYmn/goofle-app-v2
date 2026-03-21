import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Linking, Switch } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { supabase } from '@/lib/supabase';
import { restorePurchases } from '@/lib/purchases';
import { haptic } from '@/lib/haptics';
import { t } from '@/lib/i18n';

const THEME_OPTIONS = [
  { key: 'system', label: t('settings.theme.system') },
  { key: 'light',  label: t('settings.theme.light') },
  { key: 'dark',   label: t('settings.theme.dark') },
] as const;

function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="px-4 pt-6 pb-2 text-black/40 dark:text-white/40 text-xs font-semibold uppercase tracking-wide">
      {label}
    </Text>
  );
}

function SettingsRow({
  label,
  value,
  onPress,
  isDestructive = false,
  isFirst = false,
  isLast = false,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  isDestructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const radius = `${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`;
  return (
    <Pressable
      onPress={() => { haptic.tap(); onPress(); }}
      className={`flex-row items-center justify-between px-4 py-4 bg-white dark:bg-[#1C1C1C] ${!isLast ? 'border-b border-[#3A3A3A]' : ''} ${radius}`}
    >
      <Text className={`font-medium text-base ${isDestructive ? 'text-[#FF5C5C]' : 'text-black dark:text-white'}`}>
        {label}
      </Text>
      {value && <Text className="text-black/40 dark:text-white/40 text-sm">{value}</Text>}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, session } = useAuthStore();
  const { preference, setPreference } = useThemeStore();
  const { isPro } = useSubscriptionStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    haptic.medium();
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleRestorePurchases = async () => {
    haptic.medium();
    try {
      await restorePurchases();
      Alert.alert('Başarılı', 'Satın almalar geri yüklendi.');
    } catch {
      Alert.alert('Hata', 'Satın almalar geri yüklenemedi.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount.title'),
      t('settings.deleteAccount.warning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccount.confirm'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const { error } = await supabase.functions.invoke('delete-account');
            if (error) {
              Alert.alert('Hata', 'Hesap silinirken bir hata oluştu.');
              setIsDeleting(false);
              return;
            }
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-[#F5F5F5] dark:bg-black">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-black/60 dark:text-white/60 text-base">{t('common.back')}</Text>
        </Pressable>
        <Text className="text-black dark:text-white font-bold text-xl">{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <SectionHeader label={t('settings.appearance')} />
        <View className="overflow-hidden rounded-xl mx-4">
          <View className="bg-white dark:bg-[#1C1C1C] px-4 py-3 rounded-xl">
            <Text className="text-black dark:text-white font-medium text-sm mb-2 opacity-60">
              {t('settings.appearance')}
            </Text>
            <View className="flex-row gap-2">
              {THEME_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => { haptic.selection(); setPreference(opt.key); }}
                  className={`flex-1 py-2 rounded-lg items-center ${preference === opt.key ? 'bg-[#BFFF00]' : 'bg-[#3A3A3A]'}`}
                >
                  <Text className={`font-semibold text-sm ${preference === opt.key ? 'text-black' : 'text-white'}`}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <SectionHeader label={t('settings.notifications')} />
        <View className="mx-4">
          <SettingsRow
            label={t('settings.notificationSettings.dailyReminder')}
            isFirst
            isLast
            onPress={() => {}}
            value="20:00"
          />
        </View>

        <SectionHeader label={t('settings.privacy')} />
        <View className="mx-4">
          <SettingsRow
            label={t('settings.privacySettings.hideOriginal')}
            isFirst
            isLast
            onPress={() => {}}
          />
        </View>

        <SectionHeader label={t('settings.subscription')} />
        <View className="mx-4">
          {!isPro && (
            <SettingsRow
              label="Gooflo Pro'ya Geç ✨"
              isFirst
              isLast={false}
              onPress={() => router.push('/pro')}
              value="→"
            />
          )}
          <SettingsRow
            label={t('settings.restorePurchases')}
            isFirst={isPro}
            isLast
            onPress={handleRestorePurchases}
          />
        </View>

        <SectionHeader label={t('settings.about')} />
        <View className="mx-4">
          <SettingsRow
            label={t('settings.privacyPolicy')}
            isFirst
            onPress={() => Linking.openURL('https://gooflo.yamapps.com/privacy')}
            value="→"
          />
          <SettingsRow
            label={t('settings.termsOfService')}
            onPress={() => Linking.openURL('https://gooflo.yamapps.com/terms')}
            value="→"
          />
          <SettingsRow
            label={t('settings.support')}
            isLast
            onPress={() => Linking.openURL('mailto:support@gooflo.yamapps.com')}
            value="→"
          />
        </View>

        <SectionHeader label={t('settings.account')} />
        <View className="mx-4">
          <SettingsRow
            label={t('auth.signOut')}
            isFirst
            onPress={handleSignOut}
          />
          <SettingsRow
            label={isDeleting ? 'Siliniyor...' : t('settings.deleteAccount.title')}
            isLast
            onPress={handleDeleteAccount}
            isDestructive
          />
        </View>
      </ScrollView>
    </View>
  );
}
