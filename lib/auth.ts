import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from './supabase';

const PIN_KEY = 'afyo.pin.v1';
const BIOMETRIC_KEY = 'afyo.biometric.enabled.v1';

export async function setPin(pin: string) {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be 4 digits');
  await SecureStore.setItemAsync(PIN_KEY, pin, {
    requireAuthentication: false,
  });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  return stored !== null && stored === pin;
}

export async function hasPin(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  return stored !== null;
}

export async function clearPin() {
  await SecureStore.deleteItemAsync(PIN_KEY);
  await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
}

export async function setBiometricEnabled(enabled: boolean) {
  if (enabled) {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, '1');
  } else {
    await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(BIOMETRIC_KEY);
  return v === '1';
}

export async function biometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock AfYO',
    fallbackLabel: 'Use PIN',
    cancelLabel: 'Cancel',
  });
  return result.success;
}

export async function signOut() {
  await supabase.auth.signOut();
  await clearPin();
}
