import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../constants/colors';
import { RootStackParamList, TabParamList } from './types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SongsScreen from '../screens/SongsScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import AlbumsScreen from '../screens/AlbumsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import PlayerScreen from '../screens/PlayerScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import QueueScreen from '../screens/QueueScreen';
import DownloadsScreen from '../screens/DownloadsScreen';

// Components
import MiniPlayer from '../components/player/MiniPlayer';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          display: 'none', // Hide the default tab bar
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Songs"
        component={SongsScreen}
        options={{
          tabBarLabel: 'Songs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Artists"
        component={ArtistsScreen}
        options={{
          tabBarLabel: 'Artists',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Albums"
        component={AlbumsScreen}
        options={{
          tabBarLabel: 'Albums',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="disc" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Player" component={PlayerScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
        <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
        <Stack.Screen name="Queue" component={QueueScreen} />
        <Stack.Screen name="Downloads" component={DownloadsScreen} />
      </Stack.Navigator>
      <MiniPlayer />
    </NavigationContainer>
  );
}