import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerTitle: () => (
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#1a365d',
            fontFamily: 'System',
          }}>
            BlackoutTracker
          </Text>
        ),
        headerTitleAlign: 'center',
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Panorama',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="localizacao"
        options={{
          title: 'Localização',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="map-marker" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tempo"
        options={{
          title: 'Tempo',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="prejuizos"
        options={{
          title: 'Prejuízos',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="exclamation-triangle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="recomendacaos"
        options={{
          title: 'Recomendações',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="info-circle" color={color} />,
        }}
      />
    <Tabs.Screen
  name="+not-found"
  options={{
    title: 'Error',
    tabBarIcon: ({ focused }) => (
      <FontAwesome 
        name="bug" 
        size={28}
        color={focused ? '#e53e3e' : '#777'}
      />
    ),
    tabBarActiveTintColor: '#e53e3e',
    tabBarInactiveTintColor: '#777'
  }}
/>
    </Tabs>
  );
}