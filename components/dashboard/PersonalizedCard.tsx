import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCountryDirectory } from '@/lib/queries';
import { useUserPreferences } from '@/lib/userPreferences';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';
import { slugify } from '@/lib/country-helpers';
import { flagDominantColor, withAlpha } from '@/lib/flag-colors';
import { useTranslation } from '@/lib/i18n';

const GOLD = '#D4A017';

function formatMillions(n: number | undefined | null): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function PersonalizedCard({
  onPersonalize,
}: {
  onPersonalize: () => void;
}) {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { preferences, isPersonalized, toggleFavorite } = useUserPreferences();
  const directory = useCountryDirectory();

  const meCountry = useMemo(
    () =>
      preferences.myCountry
        ? directory.items.find((c) => c.name === preferences.myCountry)
        : undefined,
    [preferences.myCountry, directory.items],
  );

  // All hooks must be declared BEFORE any conditional return — Rules of Hooks.
  // Previously these `useSharedValue`/`useEffect`/`useAnimatedStyle` calls sat
  // after an `if (!isPersonalized) return …`, so the hook count flipped
  // between renders and React crashed with "Rendered more hooks than during
  // the previous render". Hoisting them up costs ~nothing (the shared values
  // just sit at 0 in the un-personalized state since no animation is started).
  const pulseInner = useSharedValue(0);
  const pulseMid = useSharedValue(0);
  const pulseOuter = useSharedValue(0);
  useEffect(() => {
    // Only animate when the card actually renders its full personalised view.
    if (!isPersonalized) return;
    const PERIOD = 1400; // ms for each half of the breath
    const PHASE = 700; // ms offset between rings
    const wave = () =>
      withRepeat(
        withTiming(1, { duration: PERIOD, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );

    pulseInner.value = wave();
    pulseMid.value = withDelay(PHASE, wave());
    pulseOuter.value = withDelay(PHASE * 2, wave());
  }, [isPersonalized, pulseInner, pulseMid, pulseOuter]);

  const innerStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + pulseInner.value * 0.15,
  }));
  const midStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pulseMid.value * 0.08,
  }));
  const outerStyle = useAnimatedStyle(() => ({
    opacity: 0.05 + pulseOuter.value * 0.08,
  }));

  const openCountry = (name: string) => {
    const slug = slugify(name);
    tapLight();
    router.push({ pathname: '/country/[slug]', params: { slug } } as unknown as Href);
  };

  if (!isPersonalized) {
    return (
      <Pressable
        onPress={() => {
          tapLight();
          onPersonalize();
        }}
        className="flex-row items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-4 py-3.5 active:opacity-90"
      >
        <View
          style={{ backgroundColor: 'rgba(212,160,23,0.18)' }}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <Ionicons name="sparkles" size={16} color={GOLD} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[14px] font-semibold text-foreground">
            {t('dashboard.personalizeTitle')}
          </Text>
          <Text className="mt-0.5 text-[12px] text-muted-foreground" numberOfLines={1}>
            {t('dashboard.personalizeDesc')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      </Pressable>
    );
  }

  const tint = flagDominantColor(meCountry?.name);

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: withAlpha(tint, 0.25),
      }}
      className="overflow-hidden rounded-2xl border p-5"
    >
      {/* Outer ambient glow */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: -120,
            right: -120,
            width: 320,
            height: 320,
            borderRadius: 160,
            backgroundColor: tint,
          },
          outerStyle,
        ]}
      />
      {/* Mid glow */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: -70,
            right: -70,
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: tint,
          },
          midStyle,
        ]}
      />
      {/* Inner hot spot */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: -30,
            right: -30,
            width: 130,
            height: 130,
            borderRadius: 65,
            backgroundColor: tint,
          },
          innerStyle,
        ]}
      />

      {meCountry ? (
        <>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => openCountry(meCountry.name)}
              className="min-w-0 flex-1 flex-row items-center gap-3 active:opacity-80"
            >
              <Text className="text-4xl">{meCountry.flagEmoji ?? '🏳️'}</Text>
              <View className="min-w-0 flex-1">
                <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {t('dashboard.welcomeBack')}
                </Text>
                <Text
                  className="font-display text-xl font-bold text-foreground"
                  numberOfLines={1}
                >
                  {meCountry.name}
                </Text>
                <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                  {meCountry.region}
                  {meCountry.capital ? ` · ${meCountry.capital}` : ''}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                tapLight();
                onPersonalize();
              }}
              hitSlop={8}
              accessibilityLabel="Change country"
              style={{ borderColor: withAlpha(tint, 0.5) }}
              className="h-11 w-11 items-center justify-center rounded-full border-[1.5px] bg-card/80 active:bg-muted"
            >
              <Ionicons name="create-outline" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <View className="mt-4 flex-row gap-2.5">
            <Stat
              label={t('dashboard.population')}
              value={formatMillions(meCountry.population)}
              icon="people-outline"
            />
            <Stat
              label={t('dashboard.youth')}
              value={formatMillions(meCountry.youthPopulation)}
              icon="trending-up-outline"
            />
            <Stat
              label="AYEMI"
              value={meCountry.ayemiScore ? String(meCountry.ayemiScore) : '—'}
              icon="ribbon-outline"
              accentGold
            />
          </View>
        </>
      ) : (
        <Pressable
          onPress={() => {
            tapLight();
            onPersonalize();
          }}
          className="flex-row items-center gap-3 active:opacity-80"
        >
          <View
            style={{ backgroundColor: 'rgba(212,160,23,0.18)' }}
            className="h-12 w-12 items-center justify-center rounded-full"
          >
            <Ionicons name="flag-outline" size={20} color={GOLD} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-foreground">
              {t('dashboard.pickCountry')}
            </Text>
            <Text className="text-[12px] text-muted-foreground">
              {t('dashboard.pickCountryDesc')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </Pressable>
      )}

      {preferences.favoriteCountries.length > 0 ? (
        <View className="mt-5">
          <View className="mb-2 flex-row items-center gap-1.5">
            <Ionicons name="star" size={12} color={GOLD} />
            <Text className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t('dashboard.favorites')}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2 pr-5">
              {preferences.favoriteCountries.map((name) => {
                const c = directory.items.find((x) => x.name === name);
                return (
                  <Pressable
                    key={name}
                    onPress={() => openCountry(name)}
                    className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 active:opacity-80"
                  >
                    {c?.flagEmoji ? <Text className="text-sm">{c.flagEmoji}</Text> : null}
                    <Text className="text-[12px] font-medium text-foreground">{name}</Text>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        tapLight();
                        toggleFavorite(name);
                      }}
                      hitSlop={8}
                      className="ml-0.5"
                    >
                      <Ionicons name="close" size={13} color={colors.mutedForeground} />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : null}

      {preferences.recentlyViewed.length > 0 ? (
        <View className="mt-4">
          <View className="mb-2 flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
            <Text className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t('dashboard.recentlyViewed')}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {preferences.recentlyViewed.map((name) => {
              const c = directory.items.find((x) => x.name === name);
              return (
                <Pressable
                  key={name}
                  onPress={() => openCountry(name)}
                  className="flex-row items-center gap-1 rounded-full border border-border px-2.5 py-1 active:bg-muted"
                >
                  {c?.flagEmoji ? <Text className="text-xs">{c.flagEmoji}</Text> : null}
                  <Text className="text-[11px] text-muted-foreground">{name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Stat({
  label,
  value,
  icon,
  accentGold,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accentGold?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View
      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      className="flex-1 rounded-xl border border-border px-3 py-3"
    >
      <View className="flex-row items-center gap-1">
        <Ionicons
          name={icon}
          size={11}
          color={accentGold ? GOLD : colors.mutedForeground}
        />
        <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </Text>
      </View>
      <Text
        className="mt-1 font-display text-lg font-bold tabular-nums"
        style={{ color: accentGold ? GOLD : colors.foreground }}
      >
        {value}
      </Text>
    </View>
  );
}
