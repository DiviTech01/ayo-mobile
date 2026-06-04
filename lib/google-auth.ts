import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// The deep link the OS uses to re-open this app once OAuth completes.
// Used both as the WebBrowser session's "expected return URL" and as the
// target of the web bridge's redirect (afyo://auth-callback#access_token=...).
const DEEP_LINK = Linking.createURL('auth-callback');

// Supabase rejects custom URL schemes (exp://, afyo://) in its OAuth
// redirect_to allowlist and silently falls back to the Site URL. So we
// route OAuth through an HTTPS bridge page on the production web — that
// page reads the tokens from the URL hash and then bounces to `afyo://`
// to wake up Expo Go / the native app. The bridge lives at
// /auth-callback?from=mobile.
//
// Set EXPO_PUBLIC_WEB_URL in .env if your bridge isn't on the prod URL
// (e.g. for a staging deploy). Falls back to the production Cloudflare
// Pages URL otherwise.
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://african-youth-observatory.pages.dev';
const REDIRECT_URI = `${WEB_URL}/auth-callback?from=mobile`;

// Diagnostics — only emit in __DEV__ so prod builds stay quiet.
const debug = (...args: unknown[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[google-auth]', ...args);
  }
};

debug('DEEP_LINK =', DEEP_LINK);
debug('REDIRECT_URI (HTTPS bridge) =', REDIRECT_URI);

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
  // Step 1 — ask Supabase to build the Google OAuth URL with our redirect.
  debug('STEP 1: requesting Supabase OAuth URL with redirectTo =', REDIRECT_URI);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URI,
      skipBrowserRedirect: true,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) {
    debug('STEP 1 FAILED — Supabase error:', error.message);
    return { ok: false, error: error.message };
  }
  if (!data.url) {
    debug('STEP 1 FAILED — Supabase returned no URL');
    return { ok: false, error: 'No OAuth URL returned' };
  }
  debug('STEP 1 OK — Google consent URL from Supabase:', data.url);

  // Step 2 — open the consent page in a system browser. We tell WebBrowser
  // to watch for the DEEP_LINK return URL — the HTTPS bridge page (loaded
  // first as REDIRECT_URI) re-redirects to `afyo://auth-callback#...`,
  // which fires the OS intent that closes the browser tab and returns here.
  debug('STEP 2: opening browser session, expecting return to', DEEP_LINK);
  const result = await WebBrowser.openAuthSessionAsync(data.url, DEEP_LINK, {
    showInRecents: false,
  });
  debug('STEP 2 returned — type:', result.type, '| url:', (result as any).url);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    debug('user cancelled / dismissed');
    return { ok: false, cancelled: true };
  }
  if (result.type !== 'success') {
    debug('STEP 2 unexpected type:', result.type);
    return { ok: false, error: 'Sign-in did not complete' };
  }

  // Step 3 — parse tokens from the URL fragment/query.
  const { accessToken, refreshToken, error: cbError } = parseTokensFromUrl(result.url);
  debug('STEP 3: parsed tokens — access?', !!accessToken, '| refresh?', !!refreshToken, '| error:', cbError);
  if (cbError) return { ok: false, error: cbError };
  if (!accessToken || !refreshToken) {
    return { ok: false, error: 'Missing tokens in OAuth callback' };
  }

  // Step 4 — install the Supabase session.
  debug('STEP 4: setSession on Supabase client');
  const { error: setErr } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (setErr) {
    debug('STEP 4 FAILED:', setErr.message);
    return { ok: false, error: setErr.message };
  }
  debug('STEP 4 OK — signed in');
  return { ok: true };
}

export const GOOGLE_REDIRECT_URI = REDIRECT_URI;
