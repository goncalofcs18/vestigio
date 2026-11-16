import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { COLLECTIONS } from '@/src/lib/queries';
import { TileGrid } from '@/src/components/Tile';
import { ErrorState, Loading, Screen } from '@/src/components/ui';
import { colors, radius, space, type } from '@/src/theme';

export default function CollectionsScreen() {
  const { data, loading, error, refetch } = useQuery(COLLECTIONS);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <Screen>
      <FlatList
        data={data?.collections ?? []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: space.lg, gap: space.md }}
        ListHeaderComponent={<Text style={[type.small, { marginBottom: space.xs }]}>Cada lugar visitado pinta um azulejo. Completa os painéis.</Text>}
        renderItem={({ item }) => {
          const done = item.visitedCount === item.total;
          return (
            <Pressable
              onPress={() => router.push(`/collection/${item.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${item.visitedCount} de ${item.total} visitados`}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
              <View style={styles.cardHead}>
                <Text style={type.heading}>{item.name}</Text>
                <Text style={[type.label, done && { color: colors.azulejo }]}>{done ? 'Completa' : `${item.visitedCount} de ${item.total}`}</Text>
              </View>
              <Text style={type.small}>{item.description}</Text>
              <View style={{ marginTop: space.md }}>
                <TileGrid items={item.places} size={32} gap={3} />
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, gap: space.xs },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.sm },
});
