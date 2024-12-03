import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFD700', // Dorado oscuro para el ícono seleccionado
        tabBarInactiveTintColor: '#888888', // Gris para los íconos inactivos
        tabBarStyle: {
          backgroundColor: '#121212', // Fondo oscuro para la barra de navegación
          borderTopColor: '#FFD700', // Borde dorado oscuro para la barra
          borderTopWidth: 1, // Asegura que el borde superior sea visible
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Juega',
          tabBarIcon: ({ color }) => (
            <Icon name="gamepad" size={24} color={color} />
          ),
        }}
      />
                  <Tabs.Screen
        name="aisnake"
        options={{
          title: 'contra',
          tabBarIcon: ({ color }) => (
            <Ionicons name="play" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Records',
          tabBarIcon: ({ color }) => (
            <Icon name="trophy" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="iniciar"
        options={{
          title: 'Iniciar Sesión',
          tabBarIcon: ({ color }) => (
            <Ionicons name="log-in-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
