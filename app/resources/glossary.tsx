import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';

type TermDef = { id: string; category: string };

const TERMS: TermDef[] = [
  { id: 'ayi', category: 'Indices' },
  { id: 'youth', category: 'Demographics' },
  { id: 'neet', category: 'Employment' },
  { id: 'unemployment', category: 'Employment' },
  { id: 'lfp', category: 'Employment' },
  { id: 'gpi', category: 'Gender' },
  { id: 'ger', category: 'Education' },
  { id: 'ner', category: 'Education' },
  { id: 'literacy', category: 'Education' },
  { id: 'informal', category: 'Employment' },
  { id: 'dependency', category: 'Demographics' },
  { id: 'urban', category: 'Demographics' },
  { id: 'hiv', category: 'Health' },
  { id: 'yfhs', category: 'Health' },
  { id: 'earlyEnt', category: 'Entrepreneurship' },
  { id: 'finance', category: 'Entrepreneurship' },
  { id: 'provenance', category: 'Data Quality' },
  { id: 'credibility', category: 'Data Quality' },
];

const CATEGORIES = ['All', 'Demographics', 'Education', 'Employment', 'Health', 'Entrepreneurship', 'Gender', 'Indices', 'Data Quality'];

const CATEGORY_KEY: Record<string, string> = {
  All: 'glossary.cat.all',
  Demographics: 'glossary.cat.demographics',
  Education: 'glossary.cat.education',
  Employment: 'glossary.cat.employment',
  Health: 'glossary.cat.health',
  Entrepreneurship: 'glossary.cat.entrepreneurship',
  Gender: 'glossary.cat.gender',
  Indices: 'glossary.cat.indices',
  'Data Quality': 'glossary.cat.dataQuality',
};

export default function GlossaryScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TERMS.map((x) => ({
      id: x.id,
      category: x.category,
      term: t(`glossary.term.${x.id}`),
      definition: t(`glossary.def.${x.id}`),
    })).filter((item) => {
      const matchSearch =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q);
      const matchCat = category === 'All' || item.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category, t]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PageHeader
        title={t('glossary.title')}
        description={t('glossary.description')}
        icon="book"
        showBack
      />

      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center rounded-xl border border-border bg-card px-3 py-2">
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('glossary.search')}
            placeholderTextColor={colors.mutedForeground}
            className="ml-2 flex-1 text-sm text-foreground"
          />
          {!!search && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4 pb-2"
        >
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              className={`shrink-0 rounded-full px-3 py-1 border ${
                category === c ? 'bg-primary border-primary' : 'bg-card border-border'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  category === c ? 'text-primary-foreground' : 'text-foreground'
                }`}
              >
                {t(CATEGORY_KEY[c])}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerClassName="p-4 pb-10 gap-3">
        {filtered.map((item) => (
          <View key={item.id} className="rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-2 mb-1.5 flex-wrap">
              <Text className="font-display text-base font-bold text-foreground flex-shrink">
                {item.term}
              </Text>
              <View className="rounded-full bg-muted px-2 py-0.5">
                <Text className="text-[10px] font-medium text-muted-foreground">
                  {t(CATEGORY_KEY[item.category])}
                </Text>
              </View>
            </View>
            <Text className="text-sm leading-5 text-muted-foreground">{item.definition}</Text>
          </View>
        ))}
        {filtered.length === 0 && (
          <View className="rounded-2xl border border-border bg-card p-8 items-center">
            <Ionicons name="search" size={32} color={colors.mutedForeground} />
            <Text className="mt-2 text-sm text-muted-foreground">
              {t('glossary.noResults')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
