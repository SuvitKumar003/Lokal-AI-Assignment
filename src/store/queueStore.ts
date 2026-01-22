import { create } from 'zustand';
import { Song } from '../types';
import { storageService } from '../services/storageService';

interface QueueState {
  queue: Song[];
  currentIndex: number;
  isLoading: boolean;
  originalQueue: Song[]; // Store original order for shuffle toggle
  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  playNext: (song: Song) => void;
  setCurrentIndex: (index: number) => void;
  initializeQueue: () => Promise<void>;
  saveOriginalQueue: () => void;
  restoreOriginalQueue: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isLoading: true,
  originalQueue: [],

  initializeQueue: async () => {
    try {
      const queue = await storageService.getQueue();
      const currentIndex = await storageService.getCurrentIndex();
      set({ queue, currentIndex, originalQueue: queue, isLoading: false });
    } catch (error) {
      console.error('Error loading queue:', error);
      set({ isLoading: false });
    }
  },

  setQueue: (songs, startIndex = 0) => {
    set({ queue: songs, currentIndex: startIndex, originalQueue: songs });
    storageService.saveQueue(songs);
    storageService.saveCurrentIndex(startIndex);
  },

  addToQueue: (song) => {
    const newQueue = [...get().queue, song];
    set({ queue: newQueue });
    storageService.saveQueue(newQueue);
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    
    let newIndex = currentIndex;
    
    // If removed song is before current, adjust index
    if (index < currentIndex) {
      newIndex = Math.max(0, currentIndex - 1);
    }
    // If removed song is current song
    else if (index === currentIndex) {
      // Keep same index unless it's now out of bounds
      if (newIndex >= newQueue.length) {
        newIndex = Math.max(0, newQueue.length - 1);
      }
    }
    
    set({ queue: newQueue, currentIndex: newIndex });
    storageService.saveQueue(newQueue);
    storageService.saveCurrentIndex(newIndex);
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    const [removed] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, removed);
    
    // Adjust current index if needed
    let newIndex = currentIndex;
    if (fromIndex === currentIndex) {
      newIndex = toIndex;
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      newIndex = currentIndex - 1;
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      newIndex = currentIndex + 1;
    }
    
    set({ queue: newQueue, currentIndex: newIndex });
    storageService.saveQueue(newQueue);
    storageService.saveCurrentIndex(newIndex);
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: 0, originalQueue: [] });
    storageService.saveQueue([]);
    storageService.saveCurrentIndex(0);
  },

  playNext: (song) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, song);
    set({ queue: newQueue });
    storageService.saveQueue(newQueue);
  },

  setCurrentIndex: (index) => {
    set({ currentIndex: index });
    storageService.saveCurrentIndex(index);
  },

  saveOriginalQueue: () => {
    const { queue } = get();
    set({ originalQueue: [...queue] });
  },

  restoreOriginalQueue: () => {
    const { originalQueue, currentIndex, queue } = get();
    const currentSong = queue[currentIndex];
    const newIndex = originalQueue.findIndex(s => s.id === currentSong?.id);
    set({ 
      queue: [...originalQueue], 
      currentIndex: newIndex >= 0 ? newIndex : 0 
    });
    storageService.saveQueue(originalQueue);
  },
}));