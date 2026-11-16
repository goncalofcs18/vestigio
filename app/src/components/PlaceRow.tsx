import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors, radius, space, type } from '@/src/theme';
import type { Place } from '@/src/lib/queries';
import { CategoryLabel } from './ui';
import { Icon } from './Icon';

export function PlaceRow({ place, distance }: { place: Pick<Place, 'id' | 'name' | 'category' | 'imageUrl' | 'visited'>; distance?: string }) {
  return (
    <Pressable
      onPress={() => router.push(`/place/${place.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${place.name}${place.visited ? ', visitado' : ''}`}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.azulejoSoft }]}>
      <Image source={place.imageUrl} style={styles.thumb} contentFit="cover" transition={200} />
      <View style={{ flex: 1, gap: 2 }}>
        <CategoryLabel category={place.category} />
        <Text style={[type.body, { fontWeight: '600' }]} numberOfLines={2}>
          {place.name}
        </Text>
        {distance && <Text style={type.small}>{distance}</Text>}
      </View>
      {place.visited && <Icon name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} color={colors.azulejo} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, backgroundColor: colors.surface, borderRadius: radius.md },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.azulejoSoft },
});
