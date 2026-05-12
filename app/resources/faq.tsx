import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { PageHeader } from '@/components/PageHeader';

type FaqItem = { question: string; answer: string };
type FaqCategory = {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  questions: FaqItem[];
};

const CATEGORIES: FaqCategory[] = [
  {
    title: 'About the Platform',
    icon: 'server',
    questions: [
      {
        question: 'What is the African Youth Observatory (AYD)?',
        answer:
          "Africa's most comprehensive youth data intelligence platform. AYD centralizes, analyzes, and visualizes youth-related statistics across all 54 African countries, covering population, education, health, employment, and entrepreneurship. Our mission is to power policy, research, innovation, and investment with trusted data.",
      },
      {
        question: 'Who manages and maintains the AYD?',
        answer:
          'AYD is managed by PACSDA (Pan-African Centre for Statistics and Data Analytics) with implementation support from ZeroUp Next. We collaborate with national statistical offices, UN agencies, the World Bank, the African Development Bank, and research institutions across Africa.',
      },
      {
        question: 'How often is the data updated?',
        answer:
          'Update frequency varies by indicator and source. Most core indicators are updated annually when new national or international survey data becomes available. Real-time indicators may be updated more frequently. Each dataset includes metadata showing the last update date and data vintage.',
      },
      {
        question: 'Which countries are covered?',
        answer:
          'AYD covers all 54 African Union member states. Coverage depth varies by country and indicator based on data availability. We continuously work with national partners to expand coverage and improve data quality.',
      },
    ],
  },
  {
    title: 'Using the Data',
    icon: 'bar-chart',
    questions: [
      {
        question: 'How do I search and filter data?',
        answer:
          'Use Explore to browse data by country, theme, indicator, year, gender, and age group. The interactive map lets you tap a country for its profile. Use Compare to analyze up to 6 countries side by side.',
      },
      {
        question: 'What is the African Youth Index (AYI)?',
        answer:
          'The AYI is our flagship composite indicator that ranks all African countries based on youth development outcomes. It combines scores across education, employment, health, and civic engagement. Countries are ranked annually.',
      },
      {
        question: 'Can I download the data?',
        answer:
          'Yes. All public datasets are available in CSV, Excel, and PDF. Charts can be exported as PNG. Premium API access provides programmatic access for advanced users and applications.',
      },
      {
        question: 'Can I embed charts in my website or report?',
        answer:
          "Yes — charts support embedding. On the web, hit 'Embed' on any visualization to copy the embed code. Please attribute the African Youth Observatory as the source and link back.",
      },
    ],
  },
  {
    title: 'Data Quality & Sources',
    icon: 'shield-checkmark',
    questions: [
      {
        question: 'Where does the data come from?',
        answer:
          'National statistical offices, UN agencies (UNDP, UNICEF, UNESCO, ILO), World Bank, African Development Bank, DHS, academic research, and specialized youth surveys. Each dataset includes full source attribution and methodology notes.',
      },
      {
        question: 'How do you ensure data quality?',
        answer:
          'Validation and cross-checking with multiple sources, standardization of indicators across countries, credibility scoring per dataset, human review of all AI-generated insights, and transparent documentation of methodology and limitations.',
      },
      {
        question: 'What is the Credibility Score?',
        answer:
          'A 1–5 star rating per dataset, based on source reliability, methodology rigor, data recency, sample representativeness, and verification status. Higher = more confidence. Datasets below 3 stars include advisory notes.',
      },
      {
        question: 'Are there data gaps I should know about?',
        answer:
          "Yes — we're transparent about limitations. Common challenges: varying definitions of 'youth' across countries, limited data from fragile states, gaps in disaggregated data, and lag between collection and publication. Each indicator page notes specific limitations.",
      },
    ],
  },
  {
    title: 'Access & Permissions',
    icon: 'people',
    questions: [
      {
        question: 'Is the platform free to use?',
        answer:
          'Yes — core features are free. This includes browsing dashboards, viewing visualizations, downloading standard datasets, and accessing the AYI. Premium features (API access, custom dashboards, advanced analytics) require registration or subscription.',
      },
      {
        question: 'Do I need to create an account?',
        answer:
          'No account is needed for basic browsing. Registered users can save dashboards, set up alerts, access download history, use the API, and contribute datasets. Registration is free for researchers and institutions.',
      },
      {
        question: 'Can I cite AYD data in research?',
        answer:
          'Yes — please cite the African Youth Observatory and link to the specific dataset. For academic citations, use the suggested citation format on each data page.',
      },
      {
        question: 'How can my organization contribute data?',
        answer:
          'We welcome contributions from national statistical offices, research institutions, and development organizations. Contributors register through our Partner Portal, submit datasets with metadata and methodology, undergo review, and sign a data sharing agreement. Contributors receive attribution and impact metrics.',
      },
    ],
  },
];

export default function FaqScreen() {
  const colors = useThemeColors();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PageHeader
        title="Frequently Asked"
        description="Common questions about the African Youth Observatory."
        icon="help-circle"
        showBack
      />

      <ScrollView contentContainerClassName="p-4 pb-10 gap-6">
        {CATEGORIES.map((cat, i) => (
          <View key={i}>
            <View className="mb-3 flex-row items-center gap-2">
              <Ionicons name={cat.icon} size={16} color={colors.primary} />
              <Text className="font-display text-base font-bold text-foreground">{cat.title}</Text>
            </View>
            <View className="gap-2">
              {cat.questions.map((q, j) => {
                const key = `${i}-${j}`;
                const isOpen = open === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => toggle(key)}
                    className="rounded-xl border border-border bg-card p-4 active:bg-muted"
                  >
                    <View className="flex-row items-center gap-3">
                      <Text className="flex-1 text-sm font-semibold text-foreground">
                        {q.question}
                      </Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.mutedForeground}
                      />
                    </View>
                    {isOpen && (
                      <Text className="mt-3 text-sm leading-5 text-muted-foreground">
                        {q.answer}
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
            Still have questions?
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Reach out via the contact channels in Settings → About.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
