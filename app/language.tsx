import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/components/PageHeader';
import { useThemeColors } from '@/lib/theme-colors';
import { tapSelection } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';

export default function LanguageScreen() {
  const colors = useThemeColors();
  const { t, language, setLanguage, languages } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerClassName="pb-12">
        <PageHeader
          title={t('language.title')}
          description={t('language.description')}
          icon="language"
          showBack
        />

        <View className="px-5 pt-4">
          <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('language.current')}
          </Text>

          <View className="overflow-hidden rounded-2xl border border-border bg-card">
            {languages.map((lng, i) => {
              const active = lng.code === language;
              return (
                <View key={lng.code}>
                  {i > 0 ? <View className="ml-4 h-px bg-border" /> : null}
                  <Pressable
                    onPress={() => {
                      tapSelection();
                      setLanguage(lng.code);
                    }}
                    className="flex-row items-center gap-3 px-4 py-4 active:bg-muted"
                  >
                    <View
                      className="h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: active
                          ? 'rgba(34,197,94,0.14)'
                          : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Text
                        className="text-[13px] font-bold uppercase"
                        style={{
                          color: active ? colors.primary : colors.mutedForeground,
                        }}
                      >
                        {lng.code}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-[15px] ${
                          active ? 'font-semibold text-primary' : 'text-foreground'
                        }`}
                      >
                        {lng.nativeName}
                      </Text>
                      <Text className="text-[12px] text-muted-foreground">
                        {lng.name}
                        {lng.dir === 'rtl' ? ' · RTL' : ''}
                      </Text>
                    </View>
                    {active ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.primary}
                      />
                    ) : null}
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Text className="mt-4 px-1 text-[11px] leading-4 text-muted-foreground">
            {t('language.rtlNote')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
