// Mobile twin of the web LiveDataTicker. Auto-scrolls real platform numbers
// + Youth Index highlights pulled from the production API. No hardcoded values.

import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useYouthIndexRankings } from '@/lib/queries';
import { useThemeColors } from '@/lib/theme-colors';

type Item = { label: string; value: string; color: string };

const THEME_LABELS: Record<string, string> = {
  'youth-demography-participation': 'Demography & Participation',
  'education': 'Education',
  'employment': 'Employment',
  'health': 'Health',
  'entrepreneurship': 'Entrepreneurship',
  'peace-security': 'Peace & Security',
  'access-to-justice': 'Access to Justice',
};

export function LiveDataTicker() {
  const colors = useThemeColors();
  const translateX = useRef(new Animated.Value(0)).current;

  const platformQ = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => api.platform.stats(),
    staleTime: 5 * 60 * 1000,
  });
  const rankingsQ = useYouthIndexRankings(2025);

  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    const p = platformQ.data;
    if (p) {
      out.push({ label: 'Countries',     value: String(p.totalCountries),                    color: '#60a5fa' });
      out.push({ label: 'Indicators',    value: String(p.totalIndicators),                   color: '#a78bfa' });
      out.push({ label: 'Data points',   value: (p.totalDataPoints ?? 0).toLocaleString(),  color: '#fb923c' });
      if (p.dataYearRange?.latest) {
        out.push({ label: 'Latest year', value: String(p.dataYearRange.latest),              color: '#4ade80' });
      }
      if (p.dataCompleteness) {
        out.push({ label: 'Coverage', value: `${p.dataCompleteness.toFixed(0)}%`,            color: '#34d399' });
      }
    }
    const rankings = Array.isArray(rankingsQ.data) ? rankingsQ.data : [];
    if (rankings.length > 0) {
      const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
      const top = sorted[0];
      out.push({
        label: 'Top Youth Index',
        value: `${top.flagEmoji ?? ''} ${top.countryName} · ${top.overallScore.toFixed(1)}`,
        color: '#fbbf24',
      });
      const avg = rankings.reduce((s, r) => s + r.overallScore, 0) / rankings.length;
      out.push({ label: 'Continental avg', value: avg.toFixed(1), color: '#22d3ee' });

      // Strongest / weakest dimension averages
      const sums: Record<string, number> = {};
      const counts: Record<string, number> = {};
      for (const r of rankings) {
        const d = (r.dimensions || {}) as Record<string, number>;
        for (const [slug, score] of Object.entries(d)) {
          sums[slug] = (sums[slug] ?? 0) + score;
          counts[slug] = (counts[slug] ?? 0) + 1;
        }
      }
      const avgs = Object.entries(sums)
        .map(([slug, sum]) => ({ slug, avg: sum / (counts[slug] || 1) }))
        .sort((a, b) => b.avg - a.avg);
      if (avgs.length > 0) {
        out.push({ label: 'Strongest', value: `${THEME_LABELS[avgs[0].slug] ?? avgs[0].slug} · ${avgs[0].avg.toFixed(1)}`, color: '#f472b6' });
        const w = avgs[avgs.length - 1];
        out.push({ label: 'Weakest',   value: `${THEME_LABELS[w.slug] ?? w.slug} · ${w.avg.toFixed(1)}`, color: '#fb7185' });
      }
    }
    return out;
  }, [platformQ.data, rankingsQ.data]);

  useEffect(() => {
    if (items.length === 0) return;
    translateX.setValue(0);
    const distance = items.length * 220;
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -distance,
        duration: items.length * 4500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [items, translateX]);

  if (items.length === 0) {
    return (
      <View style={{ backgroundColor: '#0f172a', paddingVertical: 8 }}>
        <Text style={{ color: '#94a3b8', textAlign: 'center', fontSize: 11 }}>Loading live data…</Text>
      </View>
    );
  }

  // Double the list so the loop is seamless
  const loop = [...items, ...items];

  return (
    <View style={{ backgroundColor: '#0f172a', overflow: 'hidden', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1e293b' }}>
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX }], paddingVertical: 8 }}>
        {loop.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginRight: 6 }}>{item.label}:</Text>
            <Text style={{ color: item.color, fontSize: 12, fontWeight: '700' }}>{item.value}</Text>
            <Text style={{ color: '#475569', marginHorizontal: 8 }}>•</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export default LiveDataTicker;
