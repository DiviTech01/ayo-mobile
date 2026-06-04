import { useMemo, useState } from 'react';
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
import { useCountryDirectory } from '@/lib/queries';
import { useUserPreferences } from '@/lib/userPreferences';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight, tapSelection } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';

const GOLD = '#D4A017';

export function CountryPickerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const directory = useCountryDirectory();
  const { preferences, setMyCountry, toggleFavorite } = useUserPreferences();
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...directory.items].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter((c) => c.name.toLowerCase().includes(q));
  }, [directory.items, query]);

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/55" onPress={onClose}>
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
              {t('dashboard.personalize')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.foreground} />
            </Pressable>
          </View>

          <Text className="-mt-1 mb-4 text-xs text-muted-foreground">
            {t('dashboard.pickCountryHelp')}
          </Text>

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
                const isMine = preferences.myCountry === c.name;
                const isFav = preferences.favoriteCountries.includes(c.name);
                return (
                  <View
                    key={c.id}
                    className={`flex-row items-center rounded-xl border px-3 py-2.5 ${
                      isMine ? 'border-primary bg-primary/10' : 'border-border bg-muted'
                    }`}
                  >
                    <Pressable
                      onPress={() => {
                        tapSelection();
                        setMyCountry(isMine ? null : c.name);
                      }}
                      className="flex-1 flex-row items-center gap-3"
                    >
                      <Text className="text-xl">{c.flagEmoji ?? '🏳️'}</Text>
                      <View className="min-w-0 flex-1">
                        <Text
                          className={`text-sm ${
                            isMine ? 'font-semibold text-primary' : 'text-foreground'
                          }`}
                          numberOfLines={1}
                        >
                          {c.name}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                          {c.region}
                        </Text>
                      </View>
                      {isMine ? (
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                      ) : null}
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        tapLight();
                        toggleFavorite(c.name);
                      }}
                      hitSlop={6}
                      className="ml-2 h-8 w-8 items-center justify-center rounded-md active:bg-muted"
                    >
                      <Ionicons
                        name={isFav ? 'star' : 'star-outline'}
                        size={16}
                        color={isFav ? GOLD : colors.mutedForeground}
                      />
                    </Pressable>
                  </View>
                );
              })}
              {items.length === 0 ? (
                <Text className="py-6 text-center text-sm text-muted-foreground">
                  {t('dashboard.noCountryMatch', { query })}
                </Text>
              ) : null}
            </View>
          </ScrollView>

          <Pressable
            onPress={onClose}
            className="mt-3 flex-row items-center justify-center rounded-xl bg-primary py-3.5 active:opacity-80"
          >
            <Text className="text-base font-semibold text-primary-foreground">
              {t('common.done')}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
