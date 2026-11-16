import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { COLLECTION } from '@/src/lib/queries';
import { TileGrid } from '@/src/components/Tile';
import { PlaceRow } from '@/src/components/PlaceRow';
import { ErrorState, Loading, ProgressBar, Screen } from '@/src/components/ui';
import { colors, radius, space, type } from '@/src/theme';

export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error, refetch } = useQuery(COLLECTION, { variables: { id } });

  if (loading && !data) return <Loading />;
  if (error || !data?.collection) return <ErrorState onRetry={() => refetch()} />;
  const c = data.collection;

  return (
    <Screen>
      <Stack.Screen options={{ title: c.name }} />
      <FlatList
        data={c.places}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: space.lg, gap: space.sm }}
        ListHeaderComponent={
          <View style={styles.head}>
            <Text style={type.body}>{c.description}</Text>
            <TileGrid items={c.places} size={40} gap={4} />
            <View style={{ gap: space.xs }}>
              <ProgressBar value={c.visitedCount} total={c.total} />
              <Text style={type.small}>
                {c.visitedCount === c.total ? 'Coleção completa.' : `${c.visitedCount} de ${c.total} lugares visitados`}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <PlaceRow place={item} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, gap: space.lg, marginBottom: space.sm },
});
