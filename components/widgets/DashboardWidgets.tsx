import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import {
  COUNTRIES_LIST,
  INDICATORS_LIST,
  defaultWidgets,
  generateData,
  loadWidgets,
  newWidgetId,
  saveWidgets,
  type ChartType,
  type Widget,
} from '@/lib/dashboard-storage';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { RadarChart } from '@/components/charts/RadarChart';

const CHART_OPTIONS: Array<{
  type: ChartType;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}> = [
  { type: 'bar', label: 'Bar', icon: 'bar-chart' },
  { type: 'line', label: 'Line', icon: 'analytics' },
  { type: 'area', label: 'Area', icon: 'trending-up' },
  { type: 'radar', label: 'Radar', icon: 'radio' },
];

export function DashboardWidgets() {
  const [userId, setUserId] = useState<string>('anon');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [editing, setEditing] = useState<Widget | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? 'anon';
      setUserId(id);
      setWidgets(await loadWidgets(id));
    })();
  }, []);

  const persist = (next: Widget[]) => {
    setWidgets(next);
    saveWidgets(userId, next).catch(() => undefined);
  };

  const onAdd = (w: Widget) => {
    persist([...widgets, w]);
    setAdding(false);
  };

  const onUpdate = (id: string, patch: Partial<Widget>) => {
    persist(
      widgets.map((w) => {
        if (w.id !== id) return w;
        const updated = { ...w, ...patch };
        if (patch.chartType || patch.countries || patch.indicator) {
          updated.data = generateData(updated.chartType, updated.countries, updated.indicator);
        }
        return updated;
      }),
    );
  };

  const onDelete = (id: string) => {
    persist(widgets.filter((w) => w.id !== id));
    setEditing(null);
  };

  const onReset = () => {
    persist(defaultWidgets());
  };

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-display font-semibold text-foreground">
            Your dashboard
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {widgets.length} widget{widgets.length === 1 ? '' : 's'} · stored on this device
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            onPress={onReset}
            hitSlop={6}
            className="rounded-full border border-border bg-card px-3 py-1.5"
          >
            <Text className="text-[11px] font-semibold text-muted-foreground">Reset</Text>
          </Pressable>
          <Pressable
            onPress={() => setAdding(true)}
            hitSlop={6}
            className="flex-row items-center gap-1 rounded-full bg-primary px-3 py-1.5"
          >
            <Ionicons name="add" size={12} color="white" />
            <Text className="text-[11px] font-semibold text-white">Add widget</Text>
          </Pressable>
        </View>
      </View>

      <View className="gap-4">
        {widgets.map((w) => (
          <WidgetCard key={w.id} widget={w} onEdit={() => setEditing(w)} />
        ))}
      </View>

      <EditWidgetModal
        widget={editing}
        onClose={() => setEditing(null)}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      <AddWidgetModal open={adding} onClose={() => setAdding(false)} onAdd={onAdd} />
    </View>
  );
}

function WidgetCard({ widget, onEdit }: { widget: Widget; onEdit: () => void }) {
  return (
    <View className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-sm font-display font-semibold text-foreground">
            {widget.title}
          </Text>
          <Text className="mt-0.5 text-[11px] text-muted-foreground">
            {widget.indicator}
          </Text>
        </View>
        <Pressable onPress={onEdit} hitSlop={6} className="p-1">
          <Ionicons name="ellipsis-horizontal" size={16} color="#6b7280" />
        </Pressable>
      </View>

      <View className="items-center">
        {widget.chartType === 'bar' ? (
          <BarChart data={widget.data as never} series={widget.countries} />
        ) : widget.chartType === 'line' ? (
          <LineChart data={widget.data as never} series={widget.countries} />
        ) : widget.chartType === 'area' ? (
          <LineChart data={widget.data as never} series={widget.countries} fill />
        ) : widget.chartType === 'radar' ? (
          <RadarChart data={widget.data as never} series={widget.countries} />
        ) : null}
      </View>
    </View>
  );
}

function EditWidgetModal({
  widget,
  onClose,
  onUpdate,
  onDelete,
}: {
  widget: Widget | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Widget>) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [indicator, setIndicator] = useState('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setIndicator(widget.indicator);
      setChartType(widget.chartType);
      setCountries(widget.countries);
    }
  }, [widget]);

  if (!widget) return null;

  const toggleCountry = (c: string) => {
    if (countries.includes(c)) {
      if (countries.length <= 1) return;
      setCountries(countries.filter((x) => x !== c));
    } else {
      if (countries.length >= 6) return;
      setCountries([...countries, c]);
    }
  };

  const onSave = () => {
    onUpdate(widget.id, { title, indicator, chartType, countries });
    onClose();
  };

  return (
    <Modal visible={!!widget} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-sm text-muted-foreground">Cancel</Text>
          </Pressable>
          <Text className="text-base font-display font-semibold text-foreground">
            Edit widget
          </Text>
          <Pressable onPress={onSave} hitSlop={8}>
            <Text className="text-sm font-semibold text-primary">Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="p-4 gap-5">
          <View>
            <Text className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              className="rounded-xl border border-border bg-card px-3 py-3 text-base text-foreground"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View>
            <Text className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Chart type
            </Text>
            <View className="flex-row gap-2">
              {CHART_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.type}
                  onPress={() => setChartType(opt.type)}
                  className={`flex-1 items-center gap-1 rounded-xl border py-3 ${
                    chartType === opt.type
                      ? 'border-primary bg-primary-50'
                      : 'border-border bg-card'
                  }`}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={chartType === opt.type ? '#15803d' : '#6b7280'}
                  />
                  <Text
                    className={`text-[11px] font-medium ${
                      chartType === opt.type ? 'text-primary-700' : 'text-muted-foreground'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Indicator
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {INDICATORS_LIST.map((ind) => (
                  <Pressable
                    key={ind}
                    onPress={() => setIndicator(ind)}
                    className={`rounded-full px-3 py-1.5 ${
                      indicator === ind ? 'bg-primary' : 'bg-card border border-border'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        indicator === ind ? 'text-white font-medium' : 'text-foreground'
                      }`}
                    >
                      {ind}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View>
            <Text className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Countries · {countries.length} of max 6
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {COUNTRIES_LIST.map((c) => {
                const active = countries.includes(c);
                return (
                  <Pressable
                    key={c}
                    onPress={() => toggleCountry(c)}
                    className={`rounded-full px-3 py-1.5 ${
                      active ? 'bg-primary' : 'bg-card border border-border'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        active ? 'text-white font-medium' : 'text-foreground'
                      }`}
                    >
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => onDelete(widget.id)}
            className="mt-4 rounded-xl border border-destructive-200 bg-destructive-50 py-3"
          >
            <Text className="text-center text-sm font-semibold text-destructive-700">
              Delete widget
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function AddWidgetModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (w: Widget) => void;
}) {
  const TEMPLATES: Array<{ chartType: ChartType; title: string; indicator: string }> = [
    { chartType: 'bar', title: 'Country comparison', indicator: 'Youth Literacy Rate' },
    { chartType: 'line', title: 'Time-series trend', indicator: 'Youth Unemployment Rate' },
    { chartType: 'area', title: 'Coverage over time', indicator: 'Health Access Index' },
    { chartType: 'radar', title: 'Multi-dimensional profile', indicator: 'Cross-dimensional comparison' },
  ];

  const create = (t: typeof TEMPLATES[number]) => {
    const countries = ['Nigeria', 'Kenya', 'Ghana'];
    onAdd({
      id: newWidgetId(),
      title: t.title,
      chartType: t.chartType,
      indicator: t.indicator,
      countries,
      data: generateData(t.chartType, countries, t.indicator),
    });
  };

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-sm text-muted-foreground">Close</Text>
          </Pressable>
          <Text className="text-base font-display font-semibold text-foreground">
            Add widget
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView contentContainerClassName="p-4 gap-3">
          <Text className="text-sm text-muted-foreground">
            Pick a template — you can customize countries and indicator after adding.
          </Text>
          {TEMPLATES.map((t) => (
            <Pressable
              key={t.chartType}
              onPress={() => create(t)}
              className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4 active:bg-muted"
            >
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                <Ionicons
                  name={
                    t.chartType === 'bar'
                      ? 'bar-chart'
                      : t.chartType === 'line'
                      ? 'analytics'
                      : t.chartType === 'area'
                      ? 'trending-up'
                      : 'radio'
                  }
                  size={20}
                  color="#15803d"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-display font-semibold text-foreground">
                  {t.title}
                </Text>
                <Text className="text-[11px] text-muted-foreground">{t.indicator}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
