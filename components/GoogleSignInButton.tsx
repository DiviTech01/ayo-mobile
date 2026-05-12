import { useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle } from '@/lib/google-auth';
import { useThemeColors } from '@/lib/theme-colors';

type Props = {
  onError?: (msg: string) => void;
  onSuccess?: () => void;
  label?: string;
};

export function GoogleSignInButton({ onError, onSuccess, label = 'Continue with Google' }: Props) {
  const colors = useThemeColors();
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
      className="flex-row items-center justify-center gap-2.5 rounded-xl border border-border bg-card py-3.5 disabled:opacity-50 active:opacity-80"
    >
      {busy ? (
        <ActivityIndicator color={colors.mutedForeground} />
      ) : (
        <>
          <Ionicons name="logo-google" size={18} color={colors.foreground} />
          <Text className="text-base font-semibold text-foreground">{label}</Text>
        </>
      )}
    </Pressable>
  );
}
