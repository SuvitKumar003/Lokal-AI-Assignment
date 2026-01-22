import { Audio, AVPlaybackStatus } from 'expo-av';

class AudioService {
  private sound: Audio.Sound | null = null;
  private onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Error setting audio mode:', error);
    }
  }

  async loadAudio(uri: string) {
    try {
      // Unload previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      console.log('Loading audio from:', uri);

      // Create and load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { 
          shouldPlay: false,
          progressUpdateIntervalMillis: 500,
        },
        this.onPlaybackStatusUpdate || undefined
      );

      this.sound = sound;
      console.log('Audio loaded successfully');
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  async play() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        console.log('Audio playing');
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  async pause() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        console.log('Audio paused');
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw error;
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        console.log('Audio stopped and unloaded');
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
      throw error;
    }
  }

  async seekTo(position: number) {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(position);
        console.log('Seeked to:', position);
      }
    } catch (error) {
      console.error('Error seeking:', error);
      throw error;
    }
  }

  async setVolume(volume: number) {
    try {
      if (this.sound) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        await this.sound.setVolumeAsync(clampedVolume);
        console.log('Volume set to:', clampedVolume);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
      throw error;
    }
  }

  setOnPlaybackStatusUpdate(callback: (status: AVPlaybackStatus) => void) {
    this.onPlaybackStatusUpdate = callback;
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate(callback);
    }
  }

  async getStatus(): Promise<AVPlaybackStatus | null> {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }
}

export const audioService = new AudioService();