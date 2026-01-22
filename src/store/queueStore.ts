import { create } from 'zustand';
import { Song } from '../types';
import { storageService } from '../services/storageService';

interface QueueState {
  queue: Song[];
  currentIndex: number;
  isLoading: boolean;
  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  playNext: (song: Song) => void;
  setCurrentIndex: (index: number) => void;
  initializeQueue: () => Promise<void>;
}

// Type the store with QueueState to fix implicit 'any' and 'unknown' errors
export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isLoading: true,

  initializeQueue: async () => {
    try {
      const queue = await storageService.getQueue();
      set({ queue, isLoading: false });
    } catch (error) {
      console.error('Error loading queue:', error);
      set({ isLoading: false });
    }
  },

  setQueue: (songs, startIndex = 0) => {
    set({ queue: songs, currentIndex: startIndex });
    storageService.saveQueue(songs);
  },

  addToQueue: (song) => {
    const newQueue = [...get().queue, song];
    set({ queue: newQueue });
    storageService.saveQueue(newQueue);
  },

  removeFromQueue: (index) => {
    const newQueue = get().queue.filter((_, i) => i !== index);
    let newIndex = get().currentIndex;
    if (index < newIndex) newIndex--;
    if (index === newIndex && newIndex >= newQueue.length) newIndex = 0;
    set({ queue: newQueue, currentIndex: newIndex });
    storageService.saveQueue(newQueue);
  },

  reorderQueue: (fromIndex, toIndex) => {
    const newQueue = [...get().queue];
    const [removed] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, removed);
    set({ queue: newQueue });
    storageService.saveQueue(newQueue);
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: 0 });
    storageService.saveQueue([]);
  },

  playNext: (song) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, song);
    set({ queue: newQueue });
    storageService.saveQueue(newQueue);
  },

  setCurrentIndex: (index) => set({ currentIndex: index }),
}));