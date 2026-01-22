import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/themeStore';
import { useQueueStore } from './src/store/queueStore';
import { useDownloadStore } from './src/store/downloadStore';
import { audioService } from './src/services/audioService';
import { notificationService } from './src/services/notificationService';

export default function App() {
  const { isDark, initializeTheme } = useThemeStore();
  const { initializeQueue } = useQueueStore();
  const { initializeDownloads } = useDownloadStore();

  useEffect(() => {
    // Initialize stores
    initializeTheme();
    initializeQueue();
    initializeDownloads();

    // Initialize services
    audioService.initialize();
    notificationService.initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}