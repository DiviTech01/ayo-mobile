import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemes } from '@/lib/queries';
import { useThemeColors } from '@/lib/theme-colors';
import { PageHeader } from '@/components/PageHeader';
import { OpenOnWebLink } from '@/components/OpenOnWebLink';
import { webLinks } from '@/lib/web-links';

const ICON_MAP: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  Users2: 'people',
  Users: 'people',
  GraduationCap: 'school',
  Briefcase: 'briefcase',
  Heart: 'heart',
  Vote: 'megaphone',
  Lightbulb: 'bulb',
  Wheat: 'leaf',
  Wallet: 'wallet',
  Leaf: 'leaf',
  Shield: 'shield-checkmark',
  Scale: 'scale',
  Rocket: 'rocket',
};

function iconFor(name?: string | null): React.ComponentProps<typeof Ionicons>['name'] {
  return (name && ICON_MAP[name]) || 'pricetag';
}

export default function ThemesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const q = useThemes();
  const themes = Array.isArray(q.data) ? q.data : [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="pb-2">
        <PageHeader
          title="Thematic Areas"
          description="Explore our core thematic areas of youth development in Africa."
          showBack
        />

        <View className="p-4 gap-3">
        {q.isLoading && themes.length === 0 ? (
          <View className="items-center py-16">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : q.error && themes.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
            <Text className="mt-2 text-sm text-muted-foreground">Couldn&rsquo;t load themes.</Text>
            <Pressable onPress={() => q.refetch()} className="mt-3">
              <Text className="text-sm font-medium text-primary">Try again</Text>
            </Pressable>
          </View>
        ) : (
          themes.map((theme) => {
            const tint = theme.color || '#15803d';
            return (
              <View
                key={theme.id}
                className="rounded-2xl border border-border bg-card border-l-4"
                style={{ borderLeftColor: tint }}
              >
                <View className="p-4">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${tint}1A` }}
                    >
                      <Ionicons name={iconFor(theme.icon)} size={20} color={tint} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-display text-lg font-bold text-foreground">
                        {theme.name}
                      </Text>
                      <Text className="text-[11px] text-muted-foreground">
                        {theme.indicatorCount} indicator{theme.indicatorCount === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </View>

                  {theme.description ? (
                    <Text className="mt-3 text-sm leading-5 text-muted-foreground">
                      {theme.description}
                    </Text>
                  ) : null}

                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <Pressable
                      onPress={() =>
                        router.push(
                          `/(tabs)/explore?theme=${theme.slug}` as unknown as Href,
                        )
                      }
                      className="rounded-lg bg-primary px-3 py-2 active:opacity-80"
                    >
                      <Text className="text-xs font-semibold text-primary-foreground">
                        Explore Data
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        router.push(`/compare?theme=${theme.slug}` as unknown as Href)
                      }
                      className="rounded-lg border border-border bg-card px-3 py-2 active:bg-muted"
                    >
                      <Text className="text-xs font-semibold text-foreground">
                        Compare Countries
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <OpenOnWebLink href={webLinks.themes} />
        <View className="pb-10" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
