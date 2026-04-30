import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PACSDA_URL = 'https://pacsda.org';
const CONTACT_URL = 'https://pacsda.org/contact';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-2 py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1 px-2 py-1.5"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
          <Text className="text-sm font-medium text-gray-900">Settings</Text>
        </Pressable>
        <Text className="text-base font-semibold text-gray-900">About AfYO</Text>
        <View className="w-12" />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-12">
        <View className="items-center pt-8">
          <View className="h-20 w-20 items-center justify-center rounded-2xl bg-pan-blue-50">
            <Ionicons name="globe" size={36} color="#0284c7" />
          </View>
          <Text className="mt-4 text-2xl font-bold text-pan-blue-700">AfYO</Text>
          <Text className="mt-1 text-sm text-gray-500">African Youth Observatory</Text>
          <Text className="mt-0.5 text-xs text-gray-400">v1.0.0</Text>
        </View>

        <View className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <Text className="text-base font-semibold text-gray-900">What we track</Text>
          <Text className="mt-2 text-sm leading-6 text-gray-600">
            AfYO is the mobile companion to the African Youth Observatory — a
            continental data platform tracking 54 African countries on youth
            empowerment outcomes across education, employment, health, civic
            participation, and innovation.
          </Text>
        </View>

        <View className="mt-3 rounded-2xl border border-gray-200 bg-white p-5">
          <Text className="text-base font-semibold text-gray-900">Behind AfYO</Text>
          <Text className="mt-2 text-sm leading-6 text-gray-600">
            Built by PACSDA — the Pan-African Centre for Sustainable Development &
            Accountability. The Observatory aggregates data from World Bank, UN
            agencies, AU member-state statistical offices, NBS, IOM, FAO, RSF, and
            independent civic-tech researchers.
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

        <View className="mt-3 rounded-2xl border border-gray-200 bg-white p-5">
          <Text className="text-base font-semibold text-gray-900">Privacy</Text>
          <Text className="mt-2 text-sm leading-6 text-gray-600">
            Your account is hosted by Supabase. We don't sell or share your
            information. Conversations with the AI are stored locally on your
            device by default. Sign-out clears all local data.
          </Text>
        </View>

        <View className="mt-3 rounded-2xl border border-gray-200 bg-white p-5">
          <Text className="text-base font-semibold text-gray-900">Data licensing</Text>
          <Text className="mt-2 text-sm leading-6 text-gray-600">
            Indicator data is provided for research and policy use. Attribution
            to source institutions is recorded per indicator. Country reports are
            published under PACSDA's standard accountability-data licence.
          </Text>
        </View>

        <Text className="mt-8 text-center text-xs text-gray-400">
          © PACSDA · Built for the African Union ecosystem.
        </Text>
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
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={18} color="#0284c7" />
        <Text className="text-sm font-medium text-pan-blue-700">{label}</Text>
      </View>
      <Ionicons name="open-outline" size={16} color="#9ca3af" />
    </Pressable>
  );
}
