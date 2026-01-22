import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

const KEYS = {
  QUEUE: 'queue',
  CURRENT_INDEX: 'current_index',
  RECENTLY_PLAYED: 'recently_played',
  FAVORITES: 'favorites',
  DOWNLOADED_SONGS: 'downloaded_songs',
  THEME: 'theme',
};

export const storageService = {
  // Queue
  saveQueue: async (queue: Song[]) => {
    await AsyncStorage.setItem(KEYS.QUEUE, JSON.stringify(queue));
  },

  getQueue: async (): Promise<Song[]> => {
    const queue = await AsyncStorage.getItem(KEYS.QUEUE);
    return queue ? JSON.parse(queue) : [];
  },

  // Current Index
  saveCurrentIndex: async (index: number) => {
    await AsyncStorage.setItem(KEYS.CURRENT_INDEX, JSON.stringify(index));
  },

  getCurrentIndex: async (): Promise<number> => {
    const index = await AsyncStorage.getItem(KEYS.CURRENT_INDEX);
    return index ? JSON.parse(index) : 0;
  },

  // Recently Played
  addToRecentlyPlayed: async (song: Song) => {
    let recent = await storageService.getRecentlyPlayed();
    recent = recent.filter(s => s.id !== song.id);
    recent.unshift(song);
    recent = recent.slice(0, 20); // Keep only 20 recent songs
    await AsyncStorage.setItem(KEYS.RECENTLY_PLAYED, JSON.stringify(recent));
  },

  getRecentlyPlayed: async (): Promise<Song[]> => {
    const recent = await AsyncStorage.getItem(KEYS.RECENTLY_PLAYED);
    return recent ? JSON.parse(recent) : [];
  },

  // Favorites
  toggleFavorite: async (song: Song): Promise<boolean> => {
    let favorites = await storageService.getFavorites();
    const index = favorites.findIndex(s => s.id === song.id);

    if (index >= 0) {
      favorites.splice(index, 1);
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
      return false;
    } else {
      favorites.unshift(song);
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
  },

  isFavorite: async (songId: string): Promise<boolean> => {
    const favorites = await storageService.getFavorites();
    return favorites.some(s => s.id === songId);
  },

  getFavorites: async (): Promise<Song[]> => {
    const favorites = await AsyncStorage.getItem(KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  },

  // Theme
  saveTheme: async (isDark: boolean) => {
    await AsyncStorage.setItem(KEYS.THEME, JSON.stringify(isDark));
  },

  getTheme: async (): Promise<boolean> => {
    const theme = await AsyncStorage.getItem(KEYS.THEME);
    return theme ? JSON.parse(theme) : false;
  },

  // Downloaded Songs
  addDownloadedSong: async (song: Song) => {
    let downloaded = await storageService.getDownloadedSongs();
    downloaded = downloaded.filter(s => s.id !== song.id);
    downloaded.unshift(song);
    await AsyncStorage.setItem(KEYS.DOWNLOADED_SONGS, JSON.stringify(downloaded));
  },

  removeDownloadedSong: async (songId: string) => {
    let downloaded = await storageService.getDownloadedSongs();
    downloaded = downloaded.filter(s => s.id !== songId);
    await AsyncStorage.setItem(KEYS.DOWNLOADED_SONGS, JSON.stringify(downloaded));
  },

  getDownloadedSongs: async (): Promise<Song[]> => {
    const downloaded = await AsyncStorage.getItem(KEYS.DOWNLOADED_SONGS);
    return downloaded ? JSON.parse(downloaded) : [];
  },

  clearDownloadedSongs: async () => {
    await AsyncStorage.setItem(KEYS.DOWNLOADED_SONGS, JSON.stringify([]));
  },
};