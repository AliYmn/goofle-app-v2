import * as Haptics from 'expo-haptics';

export const haptic = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),

  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  like: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  generate: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  purchase: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};
