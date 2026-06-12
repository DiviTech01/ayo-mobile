import * as SecureStore from 'expo-secure-store';

// Supabase's auth storage interface. We back it with expo-secure-store
// (Keychain on iOS, EncryptedSharedPreferences/Keystore on Android) instead of
// AsyncStorage so the access + refresh tokens are encrypted at rest rather than
// sitting in plaintext that a rooted device or a device backup could read.
//
// SecureStore caps a single value at ~2KB and Supabase sessions can be larger
// than that, so we transparently chunk values across multiple keys. A small
// "<base>.__chunks" marker records how many chunks a value was split into so we
// can reassemble and clean up on read/remove.
const CHUNK_SIZE = 1800; // headroom under the 2048-byte SecureStore limit
const chunkMeta = (key: string) => `${key}.__chunks`;

// SecureStore only allows [A-Za-z0-9._-] in keys. Supabase keys are URL-ish, so
// sanitize while keeping them unique.
function safeKey(key: string): string {
  return key.replace(/[^A-Za-z0-9._-]/g, '_');
}

export const SecureStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    const base = safeKey(key);
    const countRaw = await SecureStore.getItemAsync(chunkMeta(base));
    if (countRaw == null) {
      // Non-chunked value (small) — stored directly under the base key.
      return SecureStore.getItemAsync(base);
    }
    const count = parseInt(countRaw, 10);
    let out = '';
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${base}.${i}`);
      if (part == null) return null; // corrupted/partial — treat as missing
      out += part;
    }
    return out;
  },

  async setItem(key: string, value: string): Promise<void> {
    const base = safeKey(key);
    // Clear any previous representation first so we never mix old chunks in.
    await SecureStorageAdapter.removeItem(key);

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(base, value);
      return;
    }
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      const slice = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await SecureStore.setItemAsync(`${base}.${i}`, slice);
    }
    await SecureStore.setItemAsync(chunkMeta(base), String(count));
  },

  async removeItem(key: string): Promise<void> {
    const base = safeKey(key);
    const countRaw = await SecureStore.getItemAsync(chunkMeta(base));
    if (countRaw != null) {
      const count = parseInt(countRaw, 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${base}.${i}`);
      }
      await SecureStore.deleteItemAsync(chunkMeta(base));
    }
    await SecureStore.deleteItemAsync(base);
  },
};
