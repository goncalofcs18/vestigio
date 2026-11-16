import type { ColorValue } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

type Names = Exclude<SymbolViewProps['name'], string>;

export function Icon({ name, size = 22, color }: { name: Names; size?: number; color: ColorValue }) {
  return <SymbolView name={name} size={size} tintColor={color} />;
}
