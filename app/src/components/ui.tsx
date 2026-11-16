import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { categories, colors, radius, space, type, type Category } from '@/src/theme';

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flex: 1, backgroundColor: colors.cal }, style]}>{children}</View>;
}

export function CategoryLabel({ category }: { category: Category }) {
  const c = categories[category];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.color }} />
      <Text style={[type.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

export function Chip({ label, color, active, onPress }: { label: string; color?: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
      {color && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />}
      <Text style={[type.label, { color: active ? '#fff' : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: value }}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

export function Button({ label, onPress, disabled, loading, variant = 'primary' }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; variant?: 'primary' | 'secondary' }) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        primary ? { backgroundColor: colors.azulejo } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}>
      {loading ? <ActivityIndicator color={primary ? '#fff' : colors.ink} /> : <Text style={[styles.buttonText, { color: primary ? '#fff' : colors.ink }]}>{label}</Text>}
    </Pressable>
  );
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.azulejo} />
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={[type.heading, { textAlign: 'center' }]}>Não foi possível carregar</Text>
      <Text style={[type.small, { textAlign: 'center', marginTop: space.sm, marginBottom: space.lg }]}>
        Verifica a ligação à internet e tenta outra vez.
      </Text>
      <Button label="Tentar outra vez" variant="secondary" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.azulejoSoft, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.azulejo, borderRadius: 3 },
  button: { height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  buttonText: { fontSize: 16, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
});
