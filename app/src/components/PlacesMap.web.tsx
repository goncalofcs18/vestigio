import type { Place } from '@/src/lib/queries';

// O react-native-maps não funciona na web. Na versão web mostramos apenas a lista.
export function PlacesMap(_props: { places: Place[]; selectedId?: string | null; onSelect: (id: string | null) => void }) {
  return null;
}

export const mapAvailable = false;
