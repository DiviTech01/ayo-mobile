import { memo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetChart } from './WidgetChart';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import type { ChartType, Widget } from '@/lib/widgets';

const CHART_TYPE_LABEL_KEY: Record<ChartType, string> = {
  bar: 'dashboard.chart.bar',
  line: 'dashboard.chart.line',
  area: 'dashboard.chart.area',
  radar: 'dashboard.chart.radar',
  stat: 'dashboard.chart.stat',
};

function WidgetCardImpl({
  widget,
  onEdit,
  onDelete,
}: {
  widget: Widget;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View
      style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
      className="overflow-hidden rounded-2xl border border-border"
    >
      <View
        style={{ backgroundColor: 'rgba(34,197,94,0.5)' }}
        className="h-px"
      />

      <View className="flex-row items-start justify-between px-4 pb-1 pt-4">
        <View className="min-w-0 flex-1 pr-2">
          <Text
            className="font-display text-[15px] font-semibold text-foreground"
            numberOfLines={1}
          >
            {widget.title}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
              {widget.indicator}
            </Text>
            <Text className="text-[10px] text-muted-foreground">·</Text>
            <Text className="text-[11px] text-muted-foreground">
              {t(CHART_TYPE_LABEL_KEY[widget.chartType])}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            tapLight();
            setMenuOpen(true);
          }}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View className="px-3 pb-4 pt-1">
        <WidgetChart widget={widget} height={210} />
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-8"
          onPress={() => setMenuOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card"
          >
            <View className="border-b border-border px-5 py-3">
              <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {t('dashboard.widget')}
              </Text>
              <Text className="mt-0.5 font-display text-base font-semibold text-foreground" numberOfLines={1}>
                {widget.title}
              </Text>
            </View>
            <MenuItem
              icon="create-outline"
              label={t('dashboard.editWidget')}
              onPress={() => {
                setMenuOpen(false);
                onEdit();
              }}
            />
            <View className="h-px bg-border" />
            <MenuItem
              icon="trash-outline"
              label={t('dashboard.removeWidget')}
              destructive
              onPress={() => {
                setMenuOpen(false);
                onDelete();
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  destructive,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const tint = destructive ? colors.destructive : colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-5 py-3.5 active:bg-muted"
    >
      <Ionicons name={icon} size={18} color={tint} />
      <Text className="text-[15px]" style={{ color: tint }}>
        {label}
      </Text>
    </Pressable>
  );
}

export const WidgetCard = memo(WidgetCardImpl);

