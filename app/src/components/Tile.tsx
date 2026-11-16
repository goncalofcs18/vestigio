import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { colors } from '@/src/theme';

interface Props {
  visited: boolean;
  size?: number;
  /** anima quando passa a visitado (ex.: logo após um check-in) */
  animate?: boolean;
}

/**
 * Um azulejo. Por visitar fica só o desenho em linha; visitado fica pintado de azul,
 * como um painel de azulejos que se vai completando.
 */
export function Tile({ visited, size = 44, animate = false }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (animate && visited) {
      scale.value = withSequence(withTiming(0.6, { duration: 0 }), withSpring(1, { damping: 7, stiffness: 160 }));
    }
  }, [animate, visited, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const fg = visited ? '#FFFFFF' : colors.tileLine;
  const bg = visited ? colors.azulejo : colors.surface;
  const inner = size * 0.5;
  const corner = size * 0.42;

  return (
    <Animated.View style={[styles.tile, { width: size, height: size, backgroundColor: bg, borderColor: visited ? colors.azulejo : colors.tileLine }, style]}>
      {/* cantos: quartos de círculo que, juntando azulejos, formam círculos */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <View
          key={c}
          style={{
            position: 'absolute',
            width: corner,
            height: corner,
            borderRadius: corner / 2,
            borderWidth: 1.5,
            borderColor: fg,
            top: c[0] === 't' ? -corner / 2 : undefined,
            bottom: c[0] === 'b' ? -corner / 2 : undefined,
            left: c[1] === 'l' ? -corner / 2 : undefined,
            right: c[1] === 'r' ? -corner / 2 : undefined,
          }}
        />
      ))}
      <View style={{ width: inner, height: inner, borderWidth: 1.5, borderColor: fg, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: inner * 0.3, height: inner * 0.3, borderRadius: inner, backgroundColor: fg }} />
      </View>
    </Animated.View>
  );
}

export function TileGrid({ items, size = 44, gap = 4, highlightId }: { items: { id: string; visited: boolean }[]; size?: number; gap?: number; highlightId?: string }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {items.map((i) => (
        <Tile key={i.id} visited={i.visited} size={size} animate={i.id === highlightId} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
});
