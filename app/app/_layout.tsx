import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, YoungSerif_400Regular } from '@expo-google-fonts/young-serif';
import { ApolloProvider } from '@apollo/client/react';
import 'react-native-reanimated';
import { client } from '@/src/lib/apollo';
import { colors, fonts } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ YoungSerif_400Regular });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ApolloProvider client={client}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.cal },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 18 },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.cal },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="place/[id]" options={{ title: '', headerTransparent: true }} />
        <Stack.Screen name="collection/[id]" options={{ title: '' }} />
      </Stack>
    </ApolloProvider>
  );
}
