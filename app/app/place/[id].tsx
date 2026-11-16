import { useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useMutation, useQuery } from '@apollo/client/react';
import { CHECK_IN, PLACE, type Achievement } from '@/src/lib/queries';
import { distanceMeters, formatDistance, getPreciseLocation, useUserLocation } from '@/src/lib/location';
import { Tile } from '@/src/components/Tile';
import { Icon } from '@/src/components/Icon';
import { Button, CategoryLabel, ErrorState, Loading, Screen } from '@/src/components/ui';
import { colors, radius, space, type } from '@/src/theme';

export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error, refetch } = useQuery(PLACE, { variables: { id } });
  const { coords } = useUserLocation();
  const [checkIn, { loading: checking }] = useMutation(CHECK_IN, { refetchQueries: ['Me', 'Collections', 'Collection'] });
  const [message, setMessage] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<Achievement[] | null>(null);

  if (loading && !data) return <Loading />;
  if (error || !data?.place) return <ErrorState onRetry={() => refetch()} />;
  const place = data.place;
  const distance = coords ? formatDistance(distanceMeters(coords, place)) : null;

  async function handleCheckIn() {
    setMessage(null);
    try {
      const here = await getPreciseLocation();
      const { data: res } = await checkIn({ variables: { placeId: place.id, ...here } });
      if (!res) return;
      if (res.checkIn.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setCelebration(res.checkIn.newAchievements);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        setMessage(res.checkIn.message);
      }
    } catch (e) {
      setMessage(e instanceof Error && e.message.includes('localização') ? e.message : 'Não foi possível fazer check-in. Tenta outra vez.');
    }
  }

  function openDirections() {
    const { latitude: lat, longitude: lng } = place;
    const url = Platform.OS === 'ios' ? `http://maps.apple.com/?daddr=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        <Image source={place.imageUrl} style={styles.hero} contentFit="cover" transition={250} accessibilityIgnoresInvertColors />
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <CategoryLabel category={place.category} />
            {distance && <Text style={type.small}>{distance}</Text>}
          </View>
          <Text style={type.hero}>{place.name}</Text>
          <Text style={type.body}>{place.description}</Text>
          {place.imageCredit && <Text style={[type.small, { fontSize: 12 }]}>Imagem: {place.imageCredit}</Text>}

          {celebration ? (
            <Animated.View entering={FadeIn.duration(250)} style={styles.celebration}>
              <Animated.View entering={ZoomIn.springify().damping(9)}>
                <Tile visited size={72} />
              </Animated.View>
              <Text style={type.title}>Lugar visitado</Text>
              <Text style={[type.small, { textAlign: 'center' }]}>Pintaste mais um azulejo do teu painel.</Text>
              {celebration.map((a) => (
                <Animated.View key={a.id} entering={FadeIn.delay(350)} style={styles.newAchievement}>
                  <Icon name={{ ios: 'rosette', android: 'workspace_premium', web: 'workspace_premium' }} color={colors.azulejo} />
                  <View style={{ flex: 1 }}>
                    <Text style={[type.body, { fontWeight: '600' }]}>Nova conquista: {a.title}</Text>
                    <Text style={type.small}>{a.description}</Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          ) : place.visited ? (
            <View style={styles.visited}>
              <Icon name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} color={colors.azulejo} />
              <Text style={[type.body, { fontWeight: '600', color: colors.azulejo }]}>Já visitaste este lugar</Text>
            </View>
          ) : (
            <View style={{ gap: space.sm }}>
              <Button label="Fazer check-in" onPress={handleCheckIn} loading={checking} />
              {message && (
                <Animated.Text entering={FadeIn} style={[type.small, { color: colors.danger, textAlign: 'center' }]} accessibilityLiveRegion="polite">
                  {message}
                </Animated.Text>
              )}
            </View>
          )}
          <Button label="Como chegar" variant="secondary" onPress={openDirections} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 320, backgroundColor: colors.azulejoSoft },
  body: { padding: space.lg, gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  visited: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, height: 52, borderRadius: radius.md, backgroundColor: colors.azulejoSoft },
  celebration: { alignItems: 'center', gap: space.sm, padding: space.xl, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.azulejoSoft },
  newAchievement: { flexDirection: 'row', alignItems: 'center', gap: space.md, alignSelf: 'stretch', marginTop: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.azulejoSoft },
});
