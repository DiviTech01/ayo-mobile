import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight, tapSelection } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import {
  COUNTRIES,
  INDICATORS,
  type ChartType,
  type Widget,
  type WidgetDraft,
} from '@/lib/widgets';

const CHART_TYPES: { type: ChartType; labelKey: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { type: 'bar', labelKey: 'dashboard.chart.bar', icon: 'bar-chart' },
  { type: 'line', labelKey: 'dashboard.chart.line', icon: 'trending-up' },
  { type: 'area', labelKey: 'dashboard.chart.area', icon: 'analytics' },
  { type: 'radar', labelKey: 'dashboard.chart.radar', icon: 'compass' },
  { type: 'stat', labelKey: 'dashboard.chart.stat', icon: 'pricetag' },
];

const MAX_COUNTRIES = 5;

export function AddEditWidgetModal({
  open,
  editing,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editing: Widget | null;
  onClose: () => void;
  onSubmit: (draft: WidgetDraft) => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [indicator, setIndicator] = useState<string>('');
  const [countries, setCountries] = useState<string[]>([]);
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setChartType(editing.chartType);
      setIndicator(editing.indicator);
      setCountries(editing.countries);
      setTitle(editing.title);
    } else {
      setChartType('bar');
      setIndicator('');
      setCountries([]);
      setTitle('');
    }
  }, [open, editing]);

  const toggleCountry = (c: string) => {
    tapSelection();
    setCountries((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c);
      if (prev.length >= MAX_COUNTRIES) return prev;
      return [...prev, c];
    });
  };

  const canSubmit = title.trim().length > 0 && !!indicator;

  const submit = () => {
    if (!canSubmit) return;
    tapLight();
    onSubmit({ title, chartType, indicator, countries });
    onClose();
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/55" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-3xl bg-card px-5 pt-3"
          style={{ maxHeight: '92%', paddingBottom: Math.max(insets.bottom + 12, 24) }}
        >
          <View className="mb-2 items-center">
            <View className="h-1 w-10 rounded-full bg-muted" />
          </View>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-display text-lg font-bold text-foreground">
              {editing ? t('dashboard.editWidget') : t('dashboard.addWidget')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.foreground} />
            </Pressable>
          </View>
          <Text className="-mt-2 mb-4 text-xs text-muted-foreground">
            {editing
              ? t('dashboard.editWidgetDesc')
              : t('dashboard.addWidgetDesc')}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Label>{t('dashboard.chartType')}</Label>
            <View className="mb-5 flex-row flex-wrap gap-2">
              {CHART_TYPES.map((opt) => {
                const active = chartType === opt.type;
                return (
                  <Pressable
                    key={opt.type}
                    onPress={() => {
                      tapSelection();
                      setChartType(opt.type);
                    }}
                    style={active ? { borderColor: '#D4A017', backgroundColor: 'rgba(212,160,23,0.12)' } : undefined}
                    className={`flex-1 min-w-[80px] items-center gap-1 rounded-lg border px-2 py-3 ${
                      active ? '' : 'border-border bg-muted'
                    }`}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={active ? '#D4A017' : colors.foreground}
                    />
                    <Text
                      className="text-[11px] font-medium"
                      style={{ color: active ? '#D4A017' : colors.foreground }}
                    >
                      {t(opt.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Label>{t('dashboard.indicator')}</Label>
            <View className="mb-5 gap-2">
              {INDICATORS.map((ind) => {
                const active = ind === indicator;
                return (
                  <Pressable
                    key={ind}
                    onPress={() => {
                      tapSelection();
                      setIndicator(ind);
                    }}
                    className={`flex-row items-center justify-between rounded-xl border px-3.5 py-3 ${
                      active ? 'border-primary bg-primary/10' : 'border-border bg-muted'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        active ? 'font-semibold text-primary' : 'text-foreground'
                      }`}
                    >
                      {ind}
                    </Text>
                    {active ? (
                      <Ionicons name="checkmark" size={16} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {chartType !== 'stat' ? (
              <>
                <Label>
                  {t('dashboard.countries')}{' '}
                  <Text className="font-normal text-muted-foreground">
                    {t('dashboard.upTo', { n: MAX_COUNTRIES })}
                  </Text>
                </Label>
                <View className="mb-5 flex-row flex-wrap gap-2">
                  {COUNTRIES.map((c) => {
                    const active = countries.includes(c);
                    const disabled = !active && countries.length >= MAX_COUNTRIES;
                    return (
                      <Pressable
                        key={c}
                        disabled={disabled}
                        onPress={() => toggleCountry(c)}
                        className={`rounded-full border px-3 py-1.5 ${
                          active
                            ? 'border-primary bg-primary/15'
                            : disabled
                            ? 'border-border bg-muted opacity-50'
                            : 'border-border bg-muted'
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            active ? 'font-semibold text-primary' : 'text-foreground'
                          }`}
                        >
                          {c}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            <Label>{t('dashboard.widgetTitle')}</Label>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('dashboard.widgetTitlePlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              className="mb-5 h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            />
          </ScrollView>

          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={!canSubmit ? { opacity: 0.5 } : undefined}
            className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 active:opacity-80"
          >
            <Ionicons
              name={editing ? 'create' : 'add'}
              size={16}
              color={colors.primaryForeground}
            />
            <Text className="text-base font-semibold text-primary-foreground">
              {editing ? t('dashboard.updateWidget') : t('dashboard.addWidget')}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </Text>
  );
}
