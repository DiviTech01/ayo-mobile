import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';

type TFunc = (key: string, params?: Record<string, string | number>) => string;

type Section = {
  key: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: React.ReactNode;
};

function buildSections(t: TFunc): Section[] {
  return [
    {
      key: 'collection',
      icon: 'server',
      title: t('method.collection.title'),
      body: (
        <View>
          <Text className="text-sm leading-5 text-muted-foreground">
            {t('method.collection.intro')}
          </Text>
          <Text className="mt-4 text-sm font-semibold text-foreground">
            {t('method.collection.sourcesTitle')}
          </Text>
          <Bullets
            items={[
              t('method.collection.s1'),
              t('method.collection.s2'),
              t('method.collection.s3'),
              t('method.collection.s4'),
              t('method.collection.s5'),
              t('method.collection.s6'),
            ]}
          />
        </View>
      ),
    },
    {
      key: 'std',
      icon: 'calculator',
      title: t('method.std.title'),
      body: (
        <View>
          <Text className="text-sm leading-5 text-muted-foreground">
            {t('method.std.intro')}
          </Text>
          <Text className="mt-4 text-sm font-semibold text-foreground">
            {t('method.std.ageTitle')}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-muted-foreground">
            {t('method.std.ageBody')}
          </Text>
          <Text className="mt-4 text-sm font-semibold text-foreground">
            {t('method.std.harmTitle')}
          </Text>
          <Bullets
            items={[
              t('method.std.h1'),
              t('method.std.h2'),
              t('method.std.h3'),
              t('method.std.h4'),
            ]}
          />
          <Text className="mt-4 text-sm font-semibold text-foreground">
            {t('method.std.tempTitle')}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-muted-foreground">
            {t('method.std.tempBody')}
          </Text>
        </View>
      ),
    },
    {
      key: 'qa',
      icon: 'shield-checkmark',
      title: t('method.qa.title'),
      body: (
        <View>
          <Text className="text-sm leading-5 text-muted-foreground">
            {t('method.qa.intro')}
          </Text>
          <View className="mt-4 gap-2">
            {(['1', '2', '3', '4'] as const).map((n) => (
              <View key={n} className="flex-row gap-3 rounded-lg bg-muted p-3">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xs font-bold text-primary-foreground">{n}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {t(`method.qa.s${n}.t`)}
                  </Text>
                  <Text className="mt-0.5 text-xs text-muted-foreground">
                    {t(`method.qa.s${n}.d`)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ),
    },
    {
      key: 'ayi',
      icon: 'checkmark-circle',
      title: t('method.ayi.title'),
      body: (
        <View>
          <Text className="text-sm leading-5 text-muted-foreground">
            {t('method.ayi.intro')}
          </Text>
          <Text className="mt-4 text-sm font-semibold text-foreground">
            {t('method.ayi.dimTitle')}
          </Text>
          <View className="mt-2 rounded-xl border border-border overflow-hidden">
            <View className="flex-row bg-muted">
              <Text className="flex-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('method.ayi.colDim')}
              </Text>
              <Text className="w-14 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                {t('method.ayi.colWeight')}
              </Text>
            </View>
            {[
              { label: 'Youth Demography & Participation', sub: 'Population share, voter turnout, parliamentary representation, trust in government',                                w: '20%' },
              { label: 'Education',                        sub: 'Literacy, primary/secondary/tertiary enrollment, dropout, teacher–student ratio, education spending',               w: '15%' },
              { label: 'Employment',                       sub: 'Unemployment, labour-force participation, employment-to-population, sectoral split, informal employment',           w: '15%' },
              { label: 'Health',                           sub: 'Skilled births, contraception, HIV, mortality, mental health, maternal mortality, health spending',                  w: '15%' },
              { label: 'Entrepreneurship',                 sub: 'Startup survival, microcredit, IP registrations, credit access, mobile money, internet access',                      w: '15%' },
              { label: 'Peace & Security',                 sub: 'Internally displaced youth, trafficking victims, deaths from violent extremism',                                     w: '10%' },
              { label: 'Access to Justice',                sub: 'Youth awaiting trial, youth imprisoned, juvenile detentions',                                                        w: '10%' },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                className={`flex-row px-3 py-2.5 ${i < arr.length - 1 ? 'border-b border-border' : ''} bg-card`}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{row.label}</Text>
                  <Text className="text-[11px] text-muted-foreground">{row.sub}</Text>
                </View>
                <Text className="w-14 text-right text-sm font-bold text-foreground">{row.w}</Text>
              </View>
            ))}
          </View>
          <Text className="mt-4 text-sm font-semibold text-foreground">
            {t('method.ayi.calcTitle')}
          </Text>
          <Bullets
            items={[
              t('method.ayi.c1'),
              t('method.ayi.c2'),
              t('method.ayi.c3'),
              t('method.ayi.c4'),
            ]}
            ordered
          />
        </View>
      ),
    },
    {
      key: 'upd',
      icon: 'refresh',
      title: t('method.upd.title'),
      body: (
        <View>
          <Text className="text-sm leading-5 text-muted-foreground">
            {t('method.upd.intro')}
          </Text>
          <Bullets
            items={[
              t('method.upd.u1'),
              t('method.upd.u2'),
              t('method.upd.u3'),
              t('method.upd.u4'),
              t('method.upd.u5'),
            ]}
          />
        </View>
      ),
    },
  ];
}

export default function MethodologyScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const sections = buildSections(t);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PageHeader
        title={t('method.title')}
        description={t('method.description')}
        icon="document-text"
        showBack
      />

      <ScrollView contentContainerClassName="p-4 pb-10 gap-3">
        {sections.map((section) => (
          <View key={section.key} className="rounded-2xl border border-border bg-card p-4">
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
