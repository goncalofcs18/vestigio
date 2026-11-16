import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { colors, space, type } from '@/src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
        <Text style={type.title}>Este ecrã não existe.</Text>
        <Link href="/" style={[type.body, { color: colors.azulejo }]}>
          Voltar ao mapa
        </Link>
      </View>
    </>
  );
}
