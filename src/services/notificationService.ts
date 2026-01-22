import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Song } from '../types';
import { extractArtistNames } from '../utils/helpers';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private notificationId: string | null = null;

  async initialize() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('music-playback', {
        name: 'Music Playback',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        vibrationPattern: null,
        enableVibrate: false,
      });
    }

    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }
  }

  async showPlayingNotification(song: Song, isPlaying: boolean) {
    try {
      const artistName = extractArtistNames(song);

      const content = {
        title: song.name,
        body: artistName,
        data: { songId: song.id },
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.LOW,
      };

      if (this.notificationId) {
        await Notifications.dismissNotificationAsync(this.notificationId);
      }

      this.notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async clearNotification() {
    if (this.notificationId) {
      await Notifications.dismissNotificationAsync(this.notificationId);
      this.notificationId = null;
    }
  }
}

export const notificationService = new NotificationService();