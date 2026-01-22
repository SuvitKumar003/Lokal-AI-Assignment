import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/themeStore';
import { useQueueStore } from './src/store/queueStore';
import { audioService } from './src/services/audioService';

export default function App() {
  const { isDark, initializeTheme } = useThemeStore();
  const { initializeQueue } = useQueueStore();

  useEffect(() => {
    // Initialize stores
    initializeTheme();
    initializeQueue();

    // Initialize audio service
    audioService.initialize();
  }, [initializeTheme, initializeQueue]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}