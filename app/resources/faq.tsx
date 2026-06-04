import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';

type CategoryId = 'about' | 'using' | 'quality' | 'access';

type FaqCategory = {
  id: CategoryId;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  count: number;
};

const CATEGORIES: FaqCategory[] = [
  { id: 'about', icon: 'server', count: 4 },
  { id: 'using', icon: 'bar-chart', count: 4 },
  { id: 'quality', icon: 'shield-checkmark', count: 4 },
  { id: 'access', icon: 'people', count: 4 },
];

export default function FaqScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PageHeader
        title={t('faq.title')}
        description={t('faq.description')}
        icon="help-circle"
        showBack
      />

      <ScrollView contentContainerClassName="p-4 pb-10 gap-6">
        {CATEGORIES.map((cat) => (
          <View key={cat.id}>
            <View className="mb-3 flex-row items-center gap-2">
              <Ionicons name={cat.icon} size={16} color={colors.primary} />
              <Text className="font-display text-base font-bold text-foreground">
                {t(`faq.cat.${cat.id}`)}
              </Text>
            </View>
            <View className="gap-2">
              {Array.from({ length: cat.count }, (_, idx) => idx + 1).map((n) => {
                const key = `${cat.id}-${n}`;
                const isOpen = open === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => toggle(key)}
                    className="rounded-xl border border-border bg-card p-4 active:bg-muted"
                  >
                    <View className="flex-row items-center gap-3">
                      <Text className="flex-1 text-sm font-semibold text-foreground">
                        {t(`faq.${cat.id}.q${n}.q`)}
                      </Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.mutedForeground}
                      />
                    </View>
                    {isOpen && (
                      <Text className="mt-3 text-sm leading-5 text-muted-foreground">
                        {t(`faq.${cat.id}.q${n}.a`)}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View className="rounded-2xl bg-muted p-4">
          <Text className="font-display text-base font-bold text-foreground">
            {t('faq.still.title')}
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {t('faq.still.body')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
