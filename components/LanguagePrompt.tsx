import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { useTranslation } from '@/lib/i18n';

/**
 * Shown once on the sign-in screen when the app language was auto-set from the
 * visitor's location (not an explicit pick) and is not English. Lets them keep
 * that language or switch to English — either choice becomes sticky, so this
 * never appears again.
 */
export function LanguagePrompt() {
  const colors = useThemeColors();
  const { t, language, languageSource, languageInfo, setLanguage, confirmLanguage } =
    useTranslation();
  const [dismissed, setDismissed] = useState(false);

  const visible = !dismissed && language !== 'en' && languageSource === 'auto';
  if (!visible) return null;

  const nativeName = languageInfo.nativeName;

  const keep = () => {
    confirmLanguage();
    setDismissed(true);
  };
  const toEnglish = () => {
    setLanguage('en');
    setDismissed(true);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={keep}>
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
          <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-primary/15">
            <Ionicons name="language" size={22} color={colors.primary} />
          </View>

          <Text className="font-display text-lg font-bold text-foreground">
            {t('langPrompt.title')}
          </Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            {t('langPrompt.body', { language: nativeName })}
          </Text>

          <View className="mt-5 gap-2.5">
            <Pressable
              onPress={keep}
              className="flex-row items-center justify-center rounded-xl bg-primary py-3.5 active:opacity-80"
            >
              <Text className="text-base font-semibold text-primary-foreground">
                {t('langPrompt.keep', { language: nativeName })}
              </Text>
            </Pressable>
            <Pressable
              onPress={toEnglish}
              className="flex-row items-center justify-center rounded-xl border border-border bg-background py-3.5 active:opacity-70"
            >
              <Text className="text-base font-semibold text-foreground">
                {t('langPrompt.english')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
