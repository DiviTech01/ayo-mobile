import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { signInWithGoogle } from '@/lib/google-auth';

type Props = {
  onError?: (msg: string) => void;
  onSuccess?: () => void;
  label?: string;
};

export function GoogleSignInButton({ onError, onSuccess, label = 'Continue with Google' }: Props) {
  const [busy, setBusy] = useState(false);

  const onPress = async () => {
    setBusy(true);
    const result = await signInWithGoogle();
    setBusy(false);
    if (result.cancelled) return;
    if (!result.ok) {
      onError?.(result.error ?? 'Google sign-in failed');
      return;
    }
    onSuccess?.();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      className="flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-3 disabled:opacity-50"
    >
      {busy ? (
        <ActivityIndicator color="#6b7280" />
      ) : (
        <>
          <View className="mr-2.5">
            <GoogleGlyph />
          </View>
          <Text className="text-base font-medium text-gray-800">{label}</Text>
        </>
      )}
    </Pressable>
  );
}

function GoogleGlyph() {
  return (
    <View className="h-5 w-5 items-center justify-center">
      <Text className="text-base font-bold" style={{ color: '#4285F4' }}>
        G
      </Text>
    </View>
  );
}
