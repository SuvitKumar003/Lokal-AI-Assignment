import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

class AudioService {
  private sound: Sound | null = null;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  async loadAudio(uri: string): Promise<void> {
    try {
      // Unload previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, progressUpdateIntervalMillis: 1000 },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  async pause(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.pauseAsync();
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  async stop(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.stopAsync();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.setVolumeAsync(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (!this.sound) return null;
    try {
      return await this.sound.getStatusAsync();
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }

  setOnPlaybackStatusUpdate(callback: (status: AVPlaybackStatus) => void): void {
    if (!this.sound) return;
    this.sound.setOnPlaybackStatusUpdate(callback);
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus): void => {
    // This will be overridden by the player store
  };

  async unload(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.unloadAsync();
      this.sound = null;
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  }

  getSound(): Sound | null {
    return this.sound;
  }
}

export const audioService = new AudioService();