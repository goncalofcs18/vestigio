import { Tabs } from 'expo-router';
import { Icon } from '@/src/components/Icon';
import { colors, fonts } from '@/src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.azulejo,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        headerStyle: { backgroundColor: colors.cal },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
        headerTitleAlign: 'left',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name={{ ios: 'map', android: 'map', web: 'map' }} color={color} />,
        }}
      />
      <Tabs.Screen
        name="colecoes"
        options={{
          title: 'Coleções',
          tabBarIcon: ({ color }) => <Icon name={{ ios: 'square.grid.3x3', android: 'grid_view', web: 'grid_view' }} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'O teu painel',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Icon name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }} color={color} />,
        }}
      />
    </Tabs>
  );
}
