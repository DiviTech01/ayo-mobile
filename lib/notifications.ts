import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { http } from './api';

const STORAGE_KEY = 'afyo.notification_prefs.v1';

export type NotificationCategory =
  | 'myCountry'
  | 'favorites'
  | 'reports'
  | 'indexPolicyNews';

export type NotificationPrefs = {
  /** Master switch — when false, nothing is delivered regardless of categories. */
  enabled: boolean;
  myCountry: boolean;
  favorites: boolean;
  reports: boolean;
  indexPolicyNews: boolean;
};

// Notifications are ON by default for every user.
const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  myCountry: true,
  favorites: true,
  reports: true,
  indexPolicyNews: true,
};

export const CATEGORY_META: {
  key: NotificationCategory;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    key: 'myCountry',
    title: 'My country activity',
    description:
      'New PKPB report, Youth Index rank change, policy update or new data for the country you picked.',
    icon: 'flag',
  },
  {
    key: 'favorites',
    title: 'Favorite countries',
    description: 'The same updates for every country you’ve starred as a favorite.',
    icon: 'star',
  },
  {
    key: 'reports',
    title: 'New reports & data',
    description: 'Any new PKPB / country report published, and major new data uploads.',
    icon: 'document-text',
  },
  {
    key: 'indexPolicyNews',
    title: 'Index, Policy & news',
    description:
      'Youth Index refreshes, Policy Monitor & AYC changes, platform news and the monthly briefing.',
    icon: 'megaphone',
  },
];

/* ── Shared store (mirrors lib/userPreferences pattern) ───────────────── */

let current: NotificationPrefs = DEFAULT_PREFS;
let hydrated = false;
let hydrating: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function loadFromDisk(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
      myCountry: typeof parsed.myCountry === 'boolean' ? parsed.myCountry : true,
      favorites: typeof parsed.favorites === 'boolean' ? parsed.favorites : true,
      reports: typeof parsed.reports === 'boolean' ? parsed.reports : true,
      indexPolicyNews:
        typeof parsed.indexPolicyNews === 'boolean' ? parsed.indexPolicyNews : true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function ensureHydrated() {
  if (hydrated || hydrating) return;
  hydrating = loadFromDisk().then((p) => {
    current = p;
    hydrated = true;
    hydrating = null;
    notify();
  });
}

function write(next: NotificationPrefs) {
  current = next;
  notify();
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  // Best-effort: keep the backend in sync so server-sent pushes respect the
  // user's choices. Silently ignored until the endpoint ships.
  http.post('/notifications/preferences', next).catch(() => undefined);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureHydrated();
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return current;
}

export function useNotificationPrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    ensureHydrated();
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    write({ ...current, enabled });
    if (enabled) {
      // Turning the master switch on triggers the OS permission + token flow.
      ensurePushRegistered().catch(() => undefined);
    }
  }, []);

  const setCategory = useCallback(
    (key: NotificationCategory, value: boolean) => {
      write({ ...current, [key]: value });
    },
    [],
  );

  return { prefs, hydrated, setEnabled, setCategory };
}

/* ── Permissions, token, handler ──────────────────────────────────────── */

let handlerConfigured = false;

export function configureNotificationHandler() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type PushStatus = {
  granted: boolean;
  token: string | null;
  /** True when remote push can't work yet (no EAS projectId / Expo Go). */
  remoteUnavailable: boolean;
};

function resolveProjectId(): string | null {
  const fromExpo = Constants.expoConfig?.extra?.eas?.projectId;
  const fromEas = (Constants as { easConfig?: { projectId?: string } }).easConfig
    ?.projectId;
  const id = fromExpo || fromEas || '';
  return id ? id : null;
}

export async function getPermissionStatus(): Promise<
  Notifications.PermissionStatus
> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}

/**
 * Requests notification permission (if needed), sets the Android channel, and
 * — when an EAS projectId is configured — fetches the Expo push token and
 * best-effort registers it with the backend. Local/scheduled notifications
 * work without a token; remote push needs the token + a dev/EAS build.
 */
export async function ensurePushRegistered(): Promise<PushStatus> {
  configureNotificationHandler();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'AfYO updates',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#0ea5e9',
    }).catch(() => undefined);
  }

  let status = await getPermissionStatus();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') {
    return { granted: false, token: null, remoteUnavailable: true };
  }

  if (!Device.isDevice) {
    return { granted: true, token: null, remoteUnavailable: true };
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    // No EAS project yet → remote push can't be delivered. Local notifications
    // still work; we surface this so the UI can explain it.
    return { granted: true, token: null, remoteUnavailable: true };
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    if (token) {
      http
        .post('/notifications/register', {
          token,
          platform: Platform.OS,
        })
        .catch(() => undefined);
    }
    return { granted: true, token: token ?? null, remoteUnavailable: !token };
  } catch {
    return { granted: true, token: null, remoteUnavailable: true };
  }
}

/** Fires a local notification ~2s out so the user can verify delivery. */
export async function sendTestNotification(): Promise<boolean> {
  const status = await getPermissionStatus();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') return false;
  }
  configureNotificationHandler();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'AfYO',
      body: "Notifications are on — you'll get youth-data updates here.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      repeats: false,
    },
  });
  return true;
}

/** Called once on app start: configure handler and register if prefs allow. */
export async function initNotifications(): Promise<void> {
  configureNotificationHandler();
  const prefs = await loadFromDisk();
  current = prefs;
  hydrated = true;
  notify();
  if (prefs.enabled) {
    ensurePushRegistered().catch(() => undefined);
  }
}
