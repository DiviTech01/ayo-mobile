import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

type Status = 'idle' | 'loading' | 'success' | 'error';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://african-youth-observatory.onrender.com/api';

export function NewsletterSignup({
  heading = 'Get monthly youth-data briefings',
  subtitle = 'Be the first to know when new countries publish AYIMS reports, when the Youth Index updates, and when policy monitor flags new reforms across the continent.',
  source = 'mobile-home',
}: {
  heading?: string;
  subtitle?: string;
  source?: string;
}) {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || status === 'loading') return;
    setStatus('loading');
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('success');
      setEmail('');
      tapLight();
    } catch {
      setStatus('error');
      setErrorMsg('Could not subscribe right now. Please try again in a moment.');
    }
  };

  return (
    <View className="-mx-4 bg-black px-4 py-12">
      <View
        style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        className="rounded-2xl border border-border/60 p-5"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="mail" size={16} color={colors.primary} />
          <Text className="text-sm font-semibold text-foreground">{heading}</Text>
        </View>

        <Text className="mt-2 text-xs leading-5 text-muted-foreground">{subtitle}</Text>

        {status === 'success' ? (
          <View className="mt-4 flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={16} color={colors.aydGreen} />
            <Text className="text-sm" style={{ color: colors.aydGreen }}>
              You&apos;re subscribed. Watch your inbox.
            </Text>
          </View>
        ) : (
          <View className="mt-4 gap-2">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={status !== 'loading'}
              className="h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            />
            <Pressable
              onPress={submit}
              disabled={status === 'loading'}
              className="h-11 flex-row items-center justify-center gap-2 rounded-md bg-primary active:opacity-80"
              style={status === 'loading' ? { opacity: 0.7 } : undefined}
            >
              <Text className="text-sm font-semibold text-primary-foreground">
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </Text>
              {status !== 'loading' ? (
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={colors.primaryForeground}
                />
              ) : null}
            </Pressable>
          </View>
        )}

        {errorMsg && status === 'error' ? (
          <Text className="mt-2 text-xs text-destructive">{errorMsg}</Text>
        ) : null}
      </View>
    </View>
  );
}
