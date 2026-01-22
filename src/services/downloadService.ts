import * as FileSystem from 'expo-file-system';
import { Song } from '../types';
import { getDownloadUrl } from '../utils/helpers';

export interface DownloadProgress {
  songId: string;
  progress: number;
  isDownloading: boolean;
  isDownloaded: boolean;
}

class DownloadService {
  private downloadDir = `${FileSystem.documentDirectory}downloads/`;
  private downloadCallbacks: Map<string, (progress: number) => void> = new Map();

  async initialize() {
    // Create downloads directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(this.downloadDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.downloadDir, { intermediates: true });
    }
  }

  async downloadSong(
    song: Song,
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    try {
      await this.initialize();

      const audioUrl = getDownloadUrl(song.downloadUrl, '320kbps');
      if (!audioUrl) {
        throw new Error('No audio URL found');
      }

      const fileName = `${song.id}.mp4`;
      const fileUri = `${this.downloadDir}${fileName}`;

      // Check if already downloaded
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        console.log('Song already downloaded:', fileName);
        return fileUri;
      }

      // Store callback for this download
      if (onProgress) {
        this.downloadCallbacks.set(song.id, onProgress);
      }

      // Download with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        audioUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          
          const callback = this.downloadCallbacks.get(song.id);
          if (callback) {
            callback(progress);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      // Clean up callback
      this.downloadCallbacks.delete(song.id);

      if (result) {
        console.log('Download complete:', result.uri);
        return result.uri;
      }

      return null;
    } catch (error) {
      console.error('Error downloading song:', error);
      this.downloadCallbacks.delete(song.id);
      return null;
    }
  }

  async isDownloaded(songId: string): Promise<boolean> {
    try {
      const fileName = `${songId}.mp4`;
      const fileUri = `${this.downloadDir}${fileName}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking download status:', error);
      return false;
    }
  }

  async getLocalUri(songId: string): Promise<string | null> {
    try {
      const fileName = `${songId}.mp4`;
      const fileUri = `${this.downloadDir}${fileName}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (fileInfo.exists) {
        return fileUri;
      }
      return null;
    } catch (error) {
      console.error('Error getting local URI:', error);
      return null;
    }
  }

  async deleteSong(songId: string): Promise<boolean> {
    try {
      const fileName = `${songId}.mp4`;
      const fileUri = `${this.downloadDir}${fileName}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        console.log('Deleted song:', fileName);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting song:', error);
      return false;
    }
  }

  async getAllDownloadedSongs(): Promise<string[]> {
    try {
      await this.initialize();
      const files = await FileSystem.readDirectoryAsync(this.downloadDir);
      return files
        .filter(file => file.endsWith('.mp4'))
        .map(file => file.replace('.mp4', ''));
    } catch (error) {
      console.error('Error getting downloaded songs:', error);
      return [];
    }
  }

  async getDownloadedSize(): Promise<number> {
    try {
      await this.initialize();
      const files = await FileSystem.readDirectoryAsync(this.downloadDir);
      let totalSize = 0;

      for (const file of files) {
        const fileUri = `${this.downloadDir}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size || 0;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating download size:', error);
      return 0;
    }
  }

  async clearAllDownloads(): Promise<void> {
    try {
      await FileSystem.deleteAsync(this.downloadDir, { idempotent: true });
      await this.initialize();
      console.log('Cleared all downloads');
    } catch (error) {
      console.error('Error clearing downloads:', error);
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const downloadService = new DownloadService();