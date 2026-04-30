import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AskAIScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-6">
        <Text className="text-2xl font-semibold text-gray-900">Ask AI</Text>
        <Text className="mt-1 text-sm text-gray-500">
          Natural-language queries on the AYO dataset.
        </Text>

        <View className="mt-6 rounded-2xl border border-gray-200 p-6">
          <Text className="text-gray-400">Chat interface wires up next phase.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
