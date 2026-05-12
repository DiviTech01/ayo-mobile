import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { PageHeader } from '@/components/PageHeader';

const PACSDA_URL = 'https://pacsda.org';
const CONTACT_URL = 'https://pacsda.org/contact';

export default function AboutScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerClassName="pb-12">
        <PageHeader
          title="About AfYO"
          description="The mobile companion to the African Youth Observatory — built by PACSDA for the African Union ecosystem."
          icon="information-circle"
          showBack
        />

        <View className="px-5">
        <View className="items-center pt-8">
          <View className="h-20 w-20 items-center justify-center rounded-2xl bg-accent/15">
            <Ionicons name="globe" size={36} color={colors.accent} />
          </View>
          <Text className="mt-4 font-display text-2xl font-bold text-foreground">AfYO</Text>
          <Text className="mt-1 text-sm text-muted-foreground">African Youth Observatory</Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">v1.0.0</Text>
        </View>

        <View className="mt-8 rounded-2xl border border-border bg-card p-5">
          <Text className="font-display text-base font-semibold text-foreground">What we track</Text>
          <Text className="mt-2 text-sm leading-6 text-muted-foreground">
            AfYO is the mobile companion to the African Youth Observatory — a continental
            data platform tracking 54 African countries on youth empowerment outcomes
            across education, employment, health, civic participation, and innovation.
          </Text>
        </View>

        <View className="mt-3 rounded-2xl border border-border bg-card p-5">
          <Text className="font-display text-base font-semibold text-foreground">Behind AfYO</Text>
          <Text className="mt-2 text-sm leading-6 text-muted-foreground">
            Built by PACSDA — the Pan-African Centre for Sustainable Development &
            Accountability. The Observatory aggregates data from World Bank, UN agencies,
            AU member-state statistical offices, NBS, IOM, FAO, RSF, and independent
            civic-tech researchers.
          </Text>
          <View className="mt-4 gap-2">
            <ExternalLinkRow
              icon="globe-outline"
              label="pacsda.org"
              onPress={() => Linking.openURL(PACSDA_URL)}
            />
            <ExternalLinkRow
              icon="mail-outline"
              label="Contact PACSDA"
              onPress={() => Linking.openURL(CONTACT_URL)}
            />
          </View>
        </View>

        <View className="mt-3 rounded-2xl border border-border bg-card p-5">
          <Text className="font-display text-base font-semibold text-foreground">Privacy</Text>
          <Text className="mt-2 text-sm leading-6 text-muted-foreground">
            Your account is hosted by Supabase. We don&rsquo;t sell or share your information.
            Conversations with the AI are stored locally on your device by default. Sign-out
            clears all local data.
          </Text>
        </View>

        <View className="mt-3 rounded-2xl border border-border bg-card p-5">
          <Text className="font-display text-base font-semibold text-foreground">
            Data licensing
          </Text>
          <Text className="mt-2 text-sm leading-6 text-muted-foreground">
            Indicator data is provided for research and policy use. Attribution to source
            institutions is recorded per indicator. Country reports are published under
            PACSDA&rsquo;s standard accountability-data licence.
          </Text>
        </View>

        <Text className="mt-8 text-center text-xs text-muted-foreground">
          © PACSDA · Built for the African Union ecosystem.
        </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExternalLinkRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl bg-muted px-4 py-3 active:opacity-80"
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={18} color={colors.accent} />
        <Text className="text-sm font-medium text-accent">{label}</Text>
      </View>
      <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}
