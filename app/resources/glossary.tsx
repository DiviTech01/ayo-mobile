import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { PageHeader } from '@/components/PageHeader';

type Term = { term: string; definition: string; category: string };

const TERMS: Term[] = [
  { term: 'African Youth Index (AYI)', category: 'Indices', definition: 'A composite indicator developed by AYD that ranks African countries based on youth development outcomes across education, employment, health, and civic engagement.' },
  { term: 'Youth', category: 'Demographics', definition: 'In the context of AYD, youth refers to individuals aged 15-24 years, consistent with the United Nations definition.' },
  { term: 'NEET Rate', category: 'Employment', definition: 'The share of young people who are Not in Education, Employment, or Training. A key indicator of youth economic exclusion.' },
  { term: 'Youth Unemployment Rate', category: 'Employment', definition: 'The percentage of the youth labor force (15-24) that is without work but available and seeking employment.' },
  { term: 'Labor Force Participation Rate', category: 'Employment', definition: 'The percentage of youth population that is either employed or actively seeking employment.' },
  { term: 'Gender Parity Index (GPI)', category: 'Gender', definition: 'A ratio of female to male values for a given indicator, used to measure gender equality in education and employment.' },
  { term: 'Gross Enrollment Ratio (GER)', category: 'Education', definition: 'Total enrollment in a specific level of education, regardless of age, expressed as a percentage of the eligible official school-age population.' },
  { term: 'Net Enrollment Ratio (NER)', category: 'Education', definition: 'Enrollment of the official age group for a given level of education expressed as a percentage of the corresponding population.' },
  { term: 'Youth Literacy Rate', category: 'Education', definition: 'The percentage of people aged 15-24 who can read and write a short, simple statement about their everyday life.' },
  { term: 'Informal Employment', category: 'Employment', definition: 'Employment in the informal sector, typically lacking social protection and formal contracts.' },
  { term: 'Youth Dependency Ratio', category: 'Demographics', definition: 'The ratio of youth (15-24) to the working-age population (25-64), indicating the demographic burden on the economy.' },
  { term: 'Urban Youth', category: 'Demographics', definition: 'Young people residing in areas classified as urban according to national definitions, typically characterized by higher population density.' },
  { term: 'HIV Prevalence', category: 'Health', definition: 'The percentage of people living with HIV in a specific population group, often measured among youth aged 15-24.' },
  { term: 'Youth-Friendly Health Services', category: 'Health', definition: "Health services designed to be accessible, acceptable, and appropriate for young people's needs." },
  { term: 'Early-Stage Entrepreneurship', category: 'Entrepreneurship', definition: 'The rate of adults aged 18-24 who are either nascent entrepreneurs or owner-managers of new businesses.' },
  { term: 'Access to Finance', category: 'Entrepreneurship', definition: 'The availability and accessibility of formal financial services to young entrepreneurs.' },
  { term: 'Data Provenance', category: 'Data Quality', definition: 'Documentation of the origin, methodology, and transformation history of data, ensuring transparency and trust.' },
  { term: 'Credibility Score', category: 'Data Quality', definition: 'A rating assigned to datasets based on source reliability, methodology rigor, and verification status.' },
];

const CATEGORIES = ['All', 'Demographics', 'Education', 'Employment', 'Health', 'Entrepreneurship', 'Gender', 'Indices', 'Data Quality'];

export default function GlossaryScreen() {
  const colors = useThemeColors();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TERMS.filter((t) => {
      const matchSearch = !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q);
      const matchCat = category === 'All' || t.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PageHeader
        title="Glossary"
        description="Definitions of key terms and indicators used across the African Youth Observatory."
        icon="book"
        showBack
      />

      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center rounded-xl border border-border bg-card px-3 py-2">
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search terms..."
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 pb-2"
      >
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 border ${
              category === c ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                category === c ? 'text-primary-foreground' : 'text-foreground'
              }`}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerClassName="p-4 pb-10 gap-3">
        {filtered.map((t) => (
          <View key={t.term} className="rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-2 mb-1.5 flex-wrap">
              <Text className="font-display text-base font-bold text-foreground flex-shrink">
                {t.term}
              </Text>
              <View className="rounded-full bg-muted px-2 py-0.5">
                <Text className="text-[10px] font-medium text-muted-foreground">{t.category}</Text>
              </View>
            </View>
            <Text className="text-sm leading-5 text-muted-foreground">{t.definition}</Text>
          </View>
        ))}
        {filtered.length === 0 && (
          <View className="rounded-2xl border border-border bg-card p-8 items-center">
            <Ionicons name="search" size={32} color={colors.mutedForeground} />
            <Text className="mt-2 text-sm text-muted-foreground">No terms found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
