import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight, tapSelection } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import {
  ALL_THEMES,
  EXPLORE_COUNTRIES,
  GENDERS,
  INDICATORS_BY_THEME,
  SELECT_INDICATOR,
  THEMES,
  YEAR_RANGES,
} from '@/lib/explore-data';

const GOLD = '#D4A017';

export type ExploreFilters = {
  country: string;
  theme: string;
  indicator: string;
  yearRange: [number, number];
  gender: 'all' | 'male' | 'female';
  ageGroup: string;
};

export function DataFiltersSheet({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: ExploreFilters;
  onChange: (next: ExploreFilters) => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  const availableIndicators =
    value.theme !== ALL_THEMES
      ? INDICATORS_BY_THEME[value.theme] ?? []
      : ['Select a theme first'];

  const set = <K extends keyof ExploreFilters>(key: K, v: ExploreFilters[K]) =>
    onChange({ ...value, [key]: v });

  const isRangeActive = (r: [number, number]) =>
    value.yearRange[0] === r[0] && value.yearRange[1] === r[1];

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
              {t('explore.dataFilters')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Label>{t('explore.country')}</Label>
            <Pressable
              onPress={() => setCountryPickerOpen(true)}
              className="mb-4 flex-row items-center justify-between rounded-md border border-border bg-background px-3 py-2.5 active:bg-muted"
            >
              <Text className="text-sm text-foreground" numberOfLines={1}>
                {value.country}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
            </Pressable>

            <Label>{t('explore.theme')}</Label>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {THEMES.map((themeOpt) => {
                const active = themeOpt === value.theme;
                return (
                  <Pressable
                    key={themeOpt}
                    onPress={() => {
                      tapSelection();
                      onChange({
                        ...value,
                        theme: themeOpt,
                        indicator: SELECT_INDICATOR,
                      });
                    }}
                    className={`rounded-full px-3 py-1.5 ${
                      active ? 'bg-primary' : 'border border-border bg-muted'
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-medium ${
                        active ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {themeOpt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Label>{t('explore.indicator')}</Label>
            <View className="mb-4 gap-2">
              {value.theme === ALL_THEMES ? (
                <Text className="text-xs text-muted-foreground">
                  {t('explore.selectThemeFirst')}
                </Text>
              ) : (
                availableIndicators.map((ind) => {
                  const active = ind === value.indicator;
                  return (
                    <Pressable
                      key={ind}
                      onPress={() => {
                        tapSelection();
                        set('indicator', ind);
                      }}
                      className={`flex-row items-center justify-between rounded-xl border px-3.5 py-3 ${
                        active
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-muted'
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
                })
              )}
            </View>

            <Label>{t('explore.yearRange')}</Label>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {YEAR_RANGES.map((opt) => {
                const active = isRangeActive(opt.range);
                return (
                  <Pressable
                    key={opt.label}
                    onPress={() => {
                      tapSelection();
                      set('yearRange', opt.range);
                    }}
                    style={{ width: '48%' }}
                    className={`items-center rounded-md border px-3 py-2 ${
                      active
                        ? 'border-primary bg-primary/15'
                        : 'border-border bg-muted'
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-medium ${
                        active ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Label>{t('explore.gender')}</Label>
            <View className="mb-4 flex-row gap-2">
              {GENDERS.map((g) => {
                const active = g.id === value.gender;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => {
                      tapSelection();
                      set('gender', g.id);
                    }}
                    className={`flex-1 items-center rounded-md border px-3 py-2 ${
                      active
                        ? 'border-primary bg-primary/15'
                        : 'border-border bg-muted'
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-medium ${
                        active ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {g.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Age band is intrinsic to each AYIMS indicator (15-35 for most,
                18-30/18-35 for justice and mortality metrics, no band for
                country-level policy markers). The chart surfaces the actual
                stored band as a badge — no user selector. */}
            <View className="mb-4 rounded-md border border-border bg-muted/40 px-3 py-2.5">
              <Text className="text-[11px] leading-snug text-muted-foreground">
                <Text className="font-semibold text-foreground">Age band</Text> is defined by the indicator (AU 15–35 for most metrics, 18–30/18–35 for justice and mortality). Shown on the chart once you pick an indicator.
              </Text>
            </View>
          </ScrollView>

          <Pressable
            onPress={() => {
              tapLight();
              onClose();
            }}
            className="mt-2 flex-row items-center justify-center rounded-xl bg-primary py-3.5 active:opacity-80"
          >
            <Text className="text-base font-semibold text-primary-foreground">
              {t('common.apply')}
            </Text>
          </Pressable>

          <CountryPickerInline
            open={countryPickerOpen}
            current={value.country}
            onPick={(c) => {
              set('country', c);
              setCountryPickerOpen(false);
            }}
            onClose={() => setCountryPickerOpen(false)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CountryPickerInline({
  open,
  current,
  onPick,
  onClose,
}: {
  open: boolean;
  current: string;
  onPick: (country: string) => void;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXPLORE_COUNTRIES;
    return EXPLORE_COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-3xl bg-card px-5 pt-3"
          style={{ maxHeight: '88%', paddingBottom: Math.max(insets.bottom + 12, 24) }}
        >
          <View className="mb-2 items-center">
            <View className="h-1 w-10 rounded-full bg-muted" />
          </View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-display text-lg font-bold text-foreground">
              {t('explore.selectCountry')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.foreground} />
            </Pressable>
          </View>

          <View className="mb-3 flex-row items-center rounded-full border border-border bg-background px-3">
            <Ionicons name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('countries.search')}
              placeholderTextColor={colors.mutedForeground}
              className="ml-2 h-10 flex-1 text-sm text-foreground"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-1.5 pb-2">
              {items.map((c) => {
                const active = c === current;
                return (
                  <Pressable
                    key={c}
                    onPress={() => {
                      tapSelection();
                      onPick(c);
                    }}
                    className={`flex-row items-center justify-between rounded-xl border px-3.5 py-3 ${
                      active
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        active ? 'font-semibold text-primary' : 'text-foreground'
                      }`}
                      numberOfLines={1}
                    >
                      {c}
                    </Text>
                    {active ? (
                      <Ionicons name="checkmark" size={16} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
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
