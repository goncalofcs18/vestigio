import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

let lastKnown: Coords | null = null;

/** Pede a localização uma vez e partilha o último valor entre ecrãs. */
export function useUserLocation() {
  const [coords, setCoords] = useState<Coords | null>(lastKnown);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (active) setDenied(true);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      lastKnown = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      if (active) setCoords(lastKnown);
    })().catch(() => active && setDenied(true));
    return () => {
      active = false;
    };
  }, []);

  return { coords, denied };
}

/** Pede uma localização precisa no momento do check-in. */
export async function getPreciseLocation(): Promise<Coords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Ativa a localização para fazer check-in.');
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  lastKnown = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  return lastKnown;
}

export function distanceMeters(a: Coords, b: Coords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(m)} m`;
}
