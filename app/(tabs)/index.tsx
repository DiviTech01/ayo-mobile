import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as { name?: string } | undefined;
      setName(meta?.name ?? data.user?.email?.split('@')[0] ?? null);
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-6">
        <Text className="text-sm text-gray-500">Welcome back</Text>
        <Text className="text-2xl font-semibold text-gray-900">{name ?? 'there'} 👋</Text>

        <View className="mt-8 rounded-2xl bg-pan-blue-50 p-5">
          <Text className="text-base font-semibold text-pan-blue-800">
            Africa Youth Empowerment Index
          </Text>
          <Text className="mt-1 text-sm text-pan-blue-700">
            Track 54 countries on education, employment, health, civic, and innovation.
          </Text>
        </View>

        <Text className="mt-8 text-base font-semibold text-gray-900">Quick stats</Text>
        <View className="mt-3 flex-row flex-wrap gap-3">
          <View className="min-w-[45%] flex-1 rounded-xl border border-gray-200 p-4">
            <Text className="text-xs text-gray-500">Countries tracked</Text>
            <Text className="mt-1 text-2xl font-bold text-gray-900">54</Text>
          </View>
          <View className="min-w-[45%] flex-1 rounded-xl border border-gray-200 p-4">
            <Text className="text-xs text-gray-500">Indicators</Text>
            <Text className="mt-1 text-2xl font-bold text-gray-900">120+</Text>
          </View>
          <View className="min-w-[45%] flex-1 rounded-xl border border-gray-200 p-4">
            <Text className="text-xs text-gray-500">Youth (15–35)</Text>
            <Text className="mt-1 text-2xl font-bold text-gray-900">450M+</Text>
          </View>
          <View className="min-w-[45%] flex-1 rounded-xl border border-gray-200 p-4">
            <Text className="text-xs text-gray-500">Themes</Text>
            <Text className="mt-1 text-2xl font-bold text-gray-900">5</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
