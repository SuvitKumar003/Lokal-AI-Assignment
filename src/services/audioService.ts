import { create } from 'zustand';
import { Song, RepeatMode } from '../types';
import { audioService } from '../services/audioService';
import { notificationService } from '../services/notificationService';
import { useQueueStore } from './queueStore';
import { storageService } from '../services/storageService';
import { getDownloadUrl, shuffleArray } from '../utils/helpers';
import { AVPlaybackStatus } from 'expo-av';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  volume: number;
}

interface PlayerActions {
  playSong: (song: Song, queue?: Song[], startIndex?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  updatePlaybackStatus: (status: AVPlaybackStatus) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
}

type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  isLoading: false,
  position: 0,
  duration: 0,
  isShuffled: false,
  repeatMode: 'off',
  volume: 1.0,

  playSong: async (song: Song, queue?: Song[], startIndex: number = 0) => {
    try {
      set({ isLoading: true });

      // Initialize services
      await audioService.initialize();
      await notificationService.initialize();

      // Set queue if provided
      if (queue && queue.length > 0) {
        useQueueStore.getState().setQueue(queue, startIndex);
      } else {
        useQueueStore.getState().setQueue([song], 0);
      }

      // Get audio URL
      const audioUrl = getDownloadUrl(song.downloadUrl, '320kbps');
      
      if (!audioUrl) {
        console.error('No audio URL found');
        set({ isLoading: false });
        return;
      }

      // Load and play audio
      await audioService.loadAudio(audioUrl);
      
      // Set playback status update handler
      audioService.setOnPlaybackStatusUpdate((status) => {
        get().updatePlaybackStatus(status);
      });

      await audioService.play();

      set({
        currentSong: song,
        isPlaying: true,
        isLoading: false,
        position: 0,
      });

      // Show notification
      await notificationService.showPlayingNotification(song, true);

      // Add to recently played
      storageService.addToRecentlyPlayed(song);
    } catch (error) {
      console.error('Error playing song:', error);
      set({ isLoading: false, isPlaying: false });
    }
  },

  togglePlayPause: async () => {
    const { isPlaying, currentSong } = get();

    if (!currentSong) return;

    try {
      if (isPlaying) {
        await audioService.pause();
        set({ isPlaying: false });
        await notificationService.showPlayingNotification(currentSong, false);
      } else {
        await audioService.play();
        set({ isPlaying: true });
        await notificationService.showPlayingNotification(currentSong, true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  },

  playNext: async () => {
    const { repeatMode, currentSong } = get();
    const { queue, currentIndex, setCurrentIndex } = useQueueStore.getState();

    // If repeat one, replay current song
    if (repeatMode === 'one' && currentSong) {
      await get().playSong(currentSong);
      return;
    }

    // Get next song
    let nextIndex = currentIndex + 1;

    // If reached end of queue
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0; // Loop back to start
      } else {
        // Stop playback
        await audioService.stop();
        await notificationService.clearNotification();
        set({ isPlaying: false, position: 0 });
        return;
      }
    }

    const nextSong = queue[nextIndex];
    if (nextSong) {
      setCurrentIndex(nextIndex);
      await get().playSong(nextSong);
    }
  },

  playPrevious: async () => {
    const { position } = get();
    const { queue, currentIndex, setCurrentIndex } = useQueueStore.getState();

    // If more than 3 seconds into song, restart it
    if (position > 3000) {
      await audioService.seekTo(0);
      set({ position: 0 });
      return;
    }

    // Otherwise, go to previous song
    const prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      // Go to last song if repeat all is on
      if (get().repeatMode === 'all') {
        const lastIndex = queue.length - 1;
        setCurrentIndex(lastIndex);
        await get().playSong(queue[lastIndex]);
      }
      return;
    }

    const prevSong = queue[prevIndex];
    if (prevSong) {
      setCurrentIndex(prevIndex);
      await get().playSong(prevSong);
    }
  },

  seekTo: async (position: number) => {
    try {
      await audioService.seekTo(position);
      set({ position });
    } catch (error) {
      console.error('Error seeking:', error);
    }
  },

  setVolume: async (volume: number) => {
    try {
      await audioService.setVolume(volume);
      set({ volume });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  },

  toggleShuffle: () => {
    const { isShuffled } = get();
    const { queue, currentIndex, setQueue } = useQueueStore.getState();
    const currentSong = queue[currentIndex];

    if (!isShuffled) {
      // Enable shuffle
      const remainingSongs = queue.slice(currentIndex + 1);
      const shuffled = shuffleArray(remainingSongs);
      const newQueue = [currentSong, ...shuffled];
      setQueue(newQueue, 0);
      set({ isShuffled: true });
    } else {
      // Disable shuffle - would need to restore original order
      // For now, just toggle the flag
      set({ isShuffled: false });
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    set({ repeatMode: nextMode });
  },

  updatePlaybackStatus: (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const { position, duration, isPlaying } = get();

    // Update position
    if (status.positionMillis !== position) {
      set({ position: status.positionMillis });
    }

    // Update duration
    if (status.durationMillis && status.durationMillis !== duration) {
      set({ duration: status.durationMillis });
    }

    // Handle song end
    if (status.didJustFinish) {
      get().playNext();
    }

    // Update playing status
    if (status.isPlaying !== isPlaying) {
      set({ isPlaying: status.isPlaying });
    }
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  setPosition: (position: number) => {
    set({ position });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },
}));