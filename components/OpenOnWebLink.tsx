import { Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';

type Props = {
  href: string;
  label?: string;
};

export function OpenOnWebLink({ href, label }: Props) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const text = label ?? t('common.openOnWeb');

  const onPress = () => {
    tapLight();
    Linking.openURL(href).catch(() => undefined);
  };

  return (
    <View className="mt-6 items-center px-4">
      <Pressable
        onPress={onPress}
        hitSlop={8}
        className="flex-row items-center gap-1.5 active:opacity-60"
      >
        <Ionicons name="open-outline" size={11} color={colors.mutedForeground} />
        <Text className="text-[11px] leading-4 text-muted-foreground" numberOfLines={2}>
          {text}
        </Text>
      </Pressable>
    </View>
  );
}
