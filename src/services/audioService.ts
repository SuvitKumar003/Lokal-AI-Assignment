import { Audio, AVPlaybackStatus } from 'expo-av';

class AudioService {
  private sound: Audio.Sound | null = null;
  private onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  async loadAudio(uri: string) {
    try {
      // Unload previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        this.handlePlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  async play() {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  async seekTo(position: number) {
    if (this.sound) {
      await this.sound.setPositionAsync(position);
    }
  }

  async setVolume(volume: number) {
    if (this.sound) {
      await this.sound.setVolumeAsync(volume);
    }
  }

  setOnPlaybackStatusUpdate(callback: (status: AVPlaybackStatus) => void) {
    this.onPlaybackStatusUpdate = callback;
  }

  private handlePlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (this.onPlaybackStatusUpdate) {
      this.onPlaybackStatusUpdate(status);
    }
  }

  async getStatus(): Promise<AVPlaybackStatus> {
    if (this.sound) {
      return await this.sound.getStatusAsync();
    }
    return { isLoaded: false } as AVPlaybackStatus;
  }
}

export const audioService = new AudioService();