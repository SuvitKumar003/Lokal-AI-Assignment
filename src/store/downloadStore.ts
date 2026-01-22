import { create } from 'zustand';
import { Song } from '../types';
import { downloadService } from '../services/downloadService';
import { storageService } from '../services/storageService';

interface DownloadState {
  downloadedSongs: Song[];
  downloadProgress: Map<string, number>;
  isDownloading: Map<string, boolean>;
  totalSize: number;
}

interface DownloadActions {
  initializeDownloads: () => Promise<void>;
  downloadSong: (song: Song) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
  isDownloaded: (songId: string) => boolean;
  getProgress: (songId: string) => number;
  isDownloadingNow: (songId: string) => boolean;
  clearAllDownloads: () => Promise<void>;
  updateTotalSize: () => Promise<void>;
}

type DownloadStore = DownloadState & DownloadActions;

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  downloadedSongs: [],
  downloadProgress: new Map(),
  isDownloading: new Map(),
  totalSize: 0,

  initializeDownloads: async () => {
    try {
      const downloadedSongIds = await downloadService.getAllDownloadedSongs();
      const downloadedSongs = await storageService.getDownloadedSongs();
      const totalSize = await downloadService.getDownloadedSize();
      
      // Filter only songs that actually have files
      const validSongs = downloadedSongs.filter(song => 
        downloadedSongIds.includes(song.id)
      );

      set({ 
        downloadedSongs: validSongs,
        totalSize 
      });
    } catch (error) {
      console.error('Error initializing downloads:', error);
    }
  },

  downloadSong: async (song: Song) => {
    const { isDownloading, downloadProgress } = get();

    // Check if already downloading
    if (isDownloading.get(song.id)) {
      console.log('Song is already being downloaded');
      return;
    }

    // Check if already downloaded
    if (await downloadService.isDownloaded(song.id)) {
      console.log('Song is already downloaded');
      return;
    }

    try {
      // Mark as downloading
      const newIsDownloading = new Map(isDownloading);
      newIsDownloading.set(song.id, true);
      set({ isDownloading: newIsDownloading });

      // Start download
      const localUri = await downloadService.downloadSong(song, (progress) => {
        const newProgress = new Map(get().downloadProgress);
        newProgress.set(song.id, progress);
        set({ downloadProgress: newProgress });
      });

      if (localUri) {
        // Save to storage
        await storageService.addDownloadedSong(song);
        
        // Update state
        const newDownloadedSongs = [...get().downloadedSongs, song];
        const newIsDownloading = new Map(get().isDownloading);
        newIsDownloading.delete(song.id);
        
        const newProgress = new Map(get().downloadProgress);
        newProgress.delete(song.id);

        set({ 
          downloadedSongs: newDownloadedSongs,
          isDownloading: newIsDownloading,
          downloadProgress: newProgress
        });

        await get().updateTotalSize();
        console.log('Download successful:', song.name);
      }
    } catch (error) {
      console.error('Error in downloadSong:', error);
      
      // Clean up on error
      const newIsDownloading = new Map(get().isDownloading);
      newIsDownloading.delete(song.id);
      
      const newProgress = new Map(get().downloadProgress);
      newProgress.delete(song.id);
      
      set({ 
        isDownloading: newIsDownloading,
        downloadProgress: newProgress
      });
    }
  },

  deleteSong: async (songId: string) => {
    try {
      const success = await downloadService.deleteSong(songId);
      
      if (success) {
        await storageService.removeDownloadedSong(songId);
        
        const newDownloadedSongs = get().downloadedSongs.filter(
          song => song.id !== songId
        );
        
        set({ downloadedSongs: newDownloadedSongs });
        await get().updateTotalSize();
        console.log('Song deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  },

  isDownloaded: (songId: string) => {
    return get().downloadedSongs.some(song => song.id === songId);
  },

  getProgress: (songId: string) => {
    return get().downloadProgress.get(songId) || 0;
  },

  isDownloadingNow: (songId: string) => {
    return get().isDownloading.get(songId) || false;
  },

  clearAllDownloads: async () => {
    try {
      await downloadService.clearAllDownloads();
      await storageService.clearDownloadedSongs();
      
      set({ 
        downloadedSongs: [],
        downloadProgress: new Map(),
        isDownloading: new Map(),
        totalSize: 0
      });
      
      console.log('All downloads cleared');
    } catch (error) {
      console.error('Error clearing downloads:', error);
    }
  },

  updateTotalSize: async () => {
    const totalSize = await downloadService.getDownloadedSize();
    set({ totalSize });
  },
}));