import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client/react';
import { PLACES } from '@/src/lib/queries';
import { distanceMeters, formatDistance, useUserLocation } from '@/src/lib/location';
import { PlacesMap, mapAvailable } from '@/src/components/PlacesMap';
import { PlaceRow } from '@/src/components/PlaceRow';
import { Chip, ErrorState, Loading, Screen } from '@/src/components/ui';
import { categories, colors, radius, space, type, type Category } from '@/src/theme';

type Mode = 'mapa' | 'lista';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch } = useQuery(PLACES);
  const { coords } = useUserLocation();
  const [filter, setFilter] = useState<Category | null>(null);
  const [mode, setMode] = useState<Mode>(mapAvailable ? 'mapa' : 'lista');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const places = useMemo(() => {
    const all = (data?.places ?? []).filter((p) => !filter || p.category === filter);
    if (!coords) return all;
    return [...all].sort((a, b) => distanceMeters(coords, a) - distanceMeters(coords, b));
  }, [data, filter, coords]);

  const selected = places.find((p) => p.id === selectedId);
  const dist = (p: { latitude: number; longitude: number }) => (coords ? formatDistance(distanceMeters(coords, p)) : undefined);

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <View style={styles.titleRow}>
          <Text style={type.hero}>Aveiro</Text>
          {mapAvailable && (
            <View style={styles.toggle} accessibilityRole="tablist">
              {(['mapa', 'lista'] as const).map((m) => (
                <Pressable key={m} onPress={() => setMode(m)} accessibilityRole="tab" accessibilityState={{ selected: mode === m }} style={[styles.toggleItem, mode === m && styles.toggleActive]}>
                  <Text style={[type.label, { color: mode === m ? colors.ink : colors.inkSoft }]}>{m === 'mapa' ? 'Mapa' : 'Lista'}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }} style={{ marginHorizontal: -space.lg }}>
          <Chip label="Tudo" active={!filter} onPress={() => setFilter(null)} />
          {(Object.keys(categories) as Category[]).map((c) => (
            <Chip key={c} label={categories[c].label} color={categories[c].color} active={filter === c} onPress={() => setFilter(filter === c ? null : c)} />
          ))}
        </ScrollView>
      </View>

      {loading && !data ? (
        <Loading />
      ) : error && !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : mode === 'mapa' ? (
        <View style={{ flex: 1 }}>
          <PlacesMap places={places} selectedId={selectedId} onSelect={setSelectedId} />
          {selected && (
            <View style={styles.floating}>
              <PlaceRow place={selected} distance={dist(selected)} />
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: space.lg, gap: space.sm }}
          ListHeaderComponent={<Text style={[type.small, { marginBottom: space.xs }]}>{places.length} lugares{coords ? ', do mais perto para o mais longe' : ''}</Text>}
          renderItem={({ item }) => <PlaceRow place={item} distance={dist(item)} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.md, backgroundColor: colors.cal },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { flexDirection: 'row', backgroundColor: colors.line, borderRadius: 18, padding: 3 },
  toggleItem: { paddingHorizontal: 14, height: 30, justifyContent: 'center', borderRadius: 15 },
  toggleActive: { backgroundColor: colors.surface },
  floating: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    bottom: space.lg,
    borderRadius: radius.md,
    shadowColor: colors.ink,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
