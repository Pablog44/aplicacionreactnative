import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#2f95dc',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Juega',
          tabBarIcon: ({ color, focused }) => (
            <Icon name="gamepad" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, focused }) => (
            <Icon name="trophy" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="iniciar"
        options={{
          title: 'Iniciar Sesión',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'log-in' : 'log-in-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
