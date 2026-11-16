import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const KEY = 'vestigio:device-id';
let cached: string | null = null;

/** Identificador anónimo do visitante. Evita ter login: as visitas ficam associadas a este dispositivo. */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const stored = await AsyncStorage.getItem(KEY);
  if (stored) return (cached = stored);
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(KEY, id);
  return (cached = id);
}
