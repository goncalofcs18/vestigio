import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { ME } from '@/src/lib/queries';
import { TileGrid } from '@/src/components/Tile';
import { Icon } from '@/src/components/Icon';
import { ErrorState, Loading, ProgressBar, Screen } from '@/src/components/ui';
import { colors, radius, space, type } from '@/src/theme';

const COLUMNS = 6;
const GAP = 4;

export default function ProfileScreen() {
  const { data, loading, error, refetch } = useQuery(ME);
  const { width } = useWindowDimensions();

  if (loading && !data) return <Loading />;
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;

  const { me, places } = data;
  const contentWidth = Math.min(width, 520) - space.lg * 2 - space.lg * 2;
  const tileSize = Math.floor((contentWidth - GAP * (COLUMNS - 1)) / COLUMNS);
  const unlocked = me.achievements.filter((a) => a.unlocked).length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={type.title}>
            {me.visitedCount} de {me.totalPlaces} lugares
          </Text>
          <Text style={[type.small, { marginBottom: space.md }]}>
            {me.visitedCount === 0 ? 'Faz o primeiro check-in para pintar o teu primeiro azulejo.' : 'O teu painel de Aveiro vai ficando completo a cada visita.'}
          </Text>
          <TileGrid items={places} size={tileSize} gap={GAP} />
          <View style={{ marginTop: space.lg }}>
            <ProgressBar value={me.visitedCount} total={me.totalPlaces} />
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={type.heading}>Conquistas</Text>
          <Text style={type.label}>
            {unlocked} de {me.achievements.length}
          </Text>
        </View>
        <View style={styles.card}>
          {me.achievements.map((a, i) => (
            <View key={a.id} style={[styles.achievement, i > 0 && styles.divider]}>
              <View style={[styles.badge, { backgroundColor: a.unlocked ? colors.azulejo : colors.cal }]}>
                <Icon
                  name={a.unlocked ? { ios: 'rosette', android: 'workspace_premium', web: 'workspace_premium' } : { ios: 'lock.fill', android: 'lock', web: 'lock' }}
                  color={a.unlocked ? '#fff' : colors.inkSoft}
                  size={20}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.body, { fontWeight: '600', color: a.unlocked ? colors.ink : colors.inkSoft }]}>{a.title}</Text>
                <Text style={type.small}>{a.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {me.visits.length > 0 && (
          <>
            <Text style={[type.heading, styles.sectionHead]}>Últimas visitas</Text>
            <View style={styles.card}>
              {me.visits.slice(0, 5).map((v, i) => (
                <View key={v.place.id} style={[styles.visit, i > 0 && styles.divider]}>
                  <Text style={[type.body, { flex: 1 }]} numberOfLines={1}>
                    {v.place.name}
                  </Text>
                  <Text style={type.small}>{new Date(v.visitedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.sm, maxWidth: 520, width: '100%', alignSelf: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: space.lg },
  achievement: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  divider: { borderTopWidth: 1, borderTopColor: colors.line },
  visit: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
});
