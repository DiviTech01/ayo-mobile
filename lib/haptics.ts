import * as Haptics from 'expo-haptics';

export const tapSelection = () => {
  Haptics.selectionAsync().catch(() => undefined);
};

export const tapLight = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
};

export const tapMedium = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
};

export const tapHeavy = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
};

export const notifySuccess = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
};

export const notifyWarn = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
};

export const notifyError = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
};
