import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { PageHeader } from '@/components/PageHeader';

type Section = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    icon: 'server',
    title: 'Data Collection Overview',
    body: (
      <View>
        <Text className="text-sm leading-5 text-muted-foreground">
          The African Youth Observatory aggregates youth-focused statistics from a diverse range of authoritative sources. Our methodology is designed to ensure comprehensiveness, accuracy, and comparability across all 54 African countries.
        </Text>
        <Text className="mt-4 text-sm font-semibold text-foreground">Primary Data Sources</Text>
        <Bullets
          items={[
            'National Statistical Offices: census, labor force, household surveys',
            'UN Agencies: UNDP, UNESCO, ILO, UNICEF',
            'World Bank: World Development Indicators, Enterprise Surveys',
            'African Development Bank: African Economic Outlook, Statistical Yearbook',
            'DHS Program: Demographic and Health Surveys',
            'Academic research: peer-reviewed studies and youth surveys',
          ]}
        />
      </View>
    ),
  },
  {
    icon: 'calculator',
    title: 'Standardization Process',
    body: (
      <View>
        <Text className="text-sm leading-5 text-muted-foreground">
          To enable cross-country comparison, we apply rigorous standardization procedures.
        </Text>
        <Text className="mt-4 text-sm font-semibold text-foreground">Age Definition</Text>
        <Text className="mt-1 text-sm leading-5 text-muted-foreground">
          We standardize all youth indicators to the 15–24 age group, consistent with the UN definition. Where source data uses different brackets (e.g., 18–35 for the AU definition), we note this in metadata and apply statistical adjustments where possible.
        </Text>
        <Text className="mt-4 text-sm font-semibold text-foreground">Indicator Harmonization</Text>
        <Bullets
          items={[
            'Standardized definitions aligned with international standards',
            'Consistent calculation methodologies across countries',
            'Currency conversions to USD using World Bank exchange rates',
            'PPP adjustments for economic comparisons where appropriate',
          ]}
        />
        <Text className="mt-4 text-sm font-semibold text-foreground">Temporal Alignment</Text>
        <Text className="mt-1 text-sm leading-5 text-muted-foreground">
          Data points are aligned to calendar years. Multi-year surveys are assigned to the midpoint year. When the latest data is unavailable for a country, we display the most recent available year with vintage labeling.
        </Text>
      </View>
    ),
  },
  {
    icon: 'shield-checkmark',
    title: 'Quality Assurance',
    body: (
      <View>
        <Text className="text-sm leading-5 text-muted-foreground">
          Every dataset undergoes a multi-stage quality assurance process.
        </Text>
        <View className="mt-4 gap-2">
          {[
            { n: '1', t: 'Source Verification', d: 'Confirm data origin from official or peer-reviewed sources. Verify methodology documentation.' },
            { n: '2', t: 'Data Validation', d: 'Cross-check values against multiple sources. Flag outliers for manual review.' },
            { n: '3', t: 'Consistency Checks', d: 'Verify temporal consistency. Check against related indicators.' },
            { n: '4', t: 'Credibility Scoring', d: 'Assign 1–5 star rating based on source reliability, methodology rigor, and recency.' },
          ].map((step) => (
            <View key={step.n} className="flex-row gap-3 rounded-lg bg-muted p-3">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
                <Text className="text-xs font-bold text-primary-foreground">{step.n}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">{step.t}</Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">{step.d}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    ),
  },
  {
    icon: 'checkmark-circle',
    title: 'African Youth Index Methodology',
    body: (
      <View>
        <Text className="text-sm leading-5 text-muted-foreground">
          The African Youth Index (AYI) is a composite indicator that provides a comprehensive measure of youth development across African countries.
        </Text>
        <Text className="mt-4 text-sm font-semibold text-foreground">Dimensions & Weights</Text>
        <View className="mt-2 rounded-xl border border-border overflow-hidden">
          <View className="flex-row bg-muted">
            <Text className="flex-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Dimension
            </Text>
            <Text className="w-14 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Weight
            </Text>
          </View>
          {[
            { d: 'Education', w: '25%', sub: 'Literacy, enrollment, completion, gender parity' },
            { d: 'Employment', w: '30%', sub: 'Unemployment, NEET, labor participation, formality' },
            { d: 'Health', w: '25%', sub: 'Healthcare access, mental health, nutrition, mortality' },
            { d: 'Civic Engagement', w: '20%', sub: 'Political participation, volunteering, digital inclusion' },
          ].map((row, i, arr) => (
            <View
              key={row.d}
              className={`flex-row px-3 py-2.5 ${i < arr.length - 1 ? 'border-b border-border' : ''} bg-card`}
            >
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">{row.d}</Text>
                <Text className="text-[11px] text-muted-foreground">{row.sub}</Text>
              </View>
              <Text className="w-14 text-right text-sm font-bold text-foreground">{row.w}</Text>
            </View>
          ))}
        </View>
        <Text className="mt-4 text-sm font-semibold text-foreground">Calculation Method</Text>
        <Bullets
          items={[
            'Normalize all indicators to a 0–100 scale (min-max)',
            'Compute dimension scores as weighted averages',
            'Compute overall AYI as weighted sum of dimension scores',
            'Rank countries from highest to lowest AYI',
          ]}
          ordered
        />
      </View>
    ),
  },
  {
    icon: 'refresh',
    title: 'Updates & Version Control',
    body: (
      <View>
        <Text className="text-sm leading-5 text-muted-foreground">
          We maintain a systematic approach to data updates and version control.
        </Text>
        <Bullets
          items={[
            'Annual Updates: core indicators reviewed and updated yearly',
            'Continuous Monitoring: track major data releases and integrate promptly',
            'Version History: all datasets maintain change history',
            'Changelog: methodology changes are documented and communicated',
            'API Versioning: version-specific endpoints for reproducibility',
          ]}
        />
      </View>
    ),
  },
];

export default function MethodologyScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PageHeader
        title="Methodology"
        description="How we collect, process, and validate data across 54 African countries."
        icon="document-text"
        showBack
      />

      <ScrollView contentContainerClassName="p-4 pb-10 gap-3">
        {SECTIONS.map((section) => (
          <View key={section.title} className="rounded-2xl border border-border bg-card p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <Ionicons name={section.icon} size={18} color={colors.primary} />
              <Text className="font-display text-base font-bold text-foreground">
                {section.title}
              </Text>
            </View>
            {section.body}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Bullets({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  return (
    <View className="mt-2 gap-1.5">
      {items.map((item, i) => (
        <View key={i} className="flex-row gap-2">
          <Text className="text-sm font-semibold text-primary w-5">
            {ordered ? `${i + 1}.` : '•'}
          </Text>
          <Text className="flex-1 text-sm leading-5 text-muted-foreground">{item}</Text>
        </View>
      ))}
    </View>
  );
}
