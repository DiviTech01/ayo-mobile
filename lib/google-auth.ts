import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = Linking.createURL('auth-callback');

function parseTokensFromUrl(url: string) {
  let fragment = '';
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) fragment = url.slice(hashIndex + 1);
  else {
    const qIndex = url.indexOf('?');
    if (qIndex !== -1) fragment = url.slice(qIndex + 1);
  }
  const params = new URLSearchParams(fragment);
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    error: params.get('error_description') ?? params.get('error'),
  };
}

export async function signInWithGoogle(): Promise<{
  ok: boolean;
  cancelled?: boolean;
  error?: string;
}> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URI,
      skipBrowserRedirect: true,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) return { ok: false, error: error.message };
  if (!data.url) return { ok: false, error: 'No OAuth URL returned' };

  const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI, {
    showInRecents: false,
  });

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { ok: false, cancelled: true };
  }
  if (result.type !== 'success') {
    return { ok: false, error: 'Sign-in did not complete' };
  }

  const { accessToken, refreshToken, error: cbError } = parseTokensFromUrl(result.url);
  if (cbError) return { ok: false, error: cbError };
  if (!accessToken || !refreshToken) {
    return { ok: false, error: 'Missing tokens in OAuth callback' };
  }

  const { error: setErr } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (setErr) return { ok: false, error: setErr.message };

  return { ok: true };
}

export const GOOGLE_REDIRECT_URI = REDIRECT_URI;
