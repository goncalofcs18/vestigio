import { useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { categories } from '@/src/theme';
import type { Place } from '@/src/lib/queries';

export const AVEIRO = { latitude: 40.6415, longitude: -8.6525, latitudeDelta: 0.018, longitudeDelta: 0.018 };

interface Props {
  places: Place[];
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
}

export function PlacesMap({ places, selectedId, onSelect }: Props) {
  const ref = useRef<MapView>(null);
  return (
    <MapView ref={ref} style={{ flex: 1 }} initialRegion={AVEIRO} showsUserLocation onPress={() => onSelect(null)}>
      {places.map((p) => (
        <Marker
          key={`${p.id}-${p.visited}-${p.id === selectedId}`}
          coordinate={{ latitude: p.latitude, longitude: p.longitude }}
          pinColor={categories[p.category].color}
          opacity={p.id === selectedId || !selectedId ? 1 : 0.6}
          onPress={(e) => {
            e.stopPropagation();
            onSelect(p.id);
          }}
        />
      ))}
    </MapView>
  );
}

export const mapAvailable = true;
