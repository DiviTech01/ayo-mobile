import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PinPad } from '@/components/PinPad';
import { setPin as savePin } from '@/lib/auth';
import { useThemeColors } from '@/lib/theme-colors';

export default function PinSetupScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [first, setFirst] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step === 'create' && first.length === 4) {
      setStep('confirm');
    }
  }, [first, step]);

  useEffect(() => {
    if (step === 'confirm' && confirm.length === 4) {
      if (confirm === first) {
        savePin(first).then(() => router.back());
      } else {
        setError('PINs did not match. Try again.');
        setFirst('');
        setConfirm('');
        setStep('create');
      }
    }
  }, [confirm, first, step, router]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="ml-2 font-display text-base font-semibold text-foreground">
          Set a PIN
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 font-display text-lg font-medium text-foreground">
          {step === 'create' ? 'Choose a 4-digit PIN' : 'Confirm your PIN'}
        </Text>
        <Text className="mb-10 text-sm text-muted-foreground">
          {step === 'create'
            ? "You'll use this to open AfYO."
            : 'Re-enter the PIN to confirm.'}
        </Text>

        {error && <Text className="mb-4 text-sm text-destructive">{error}</Text>}

        <PinPad
          value={step === 'create' ? first : confirm}
          onChange={step === 'create' ? setFirst : setConfirm}
        />
      </View>
    </SafeAreaView>
  );
}
