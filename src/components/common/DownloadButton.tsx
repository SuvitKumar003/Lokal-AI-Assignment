import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useDownloadStore } from '../../store/downloadStore';
import { Colors } from '../../constants/colors';
import { Song } from '../../types';

interface DownloadButtonProps {
  song: Song;
  size?: number;
}

export default function DownloadButton({ song, size = 24 }: DownloadButtonProps) {
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { 
    downloadSong, 
    deleteSong, 
    isDownloaded, 
    isDownloadingNow, 
    getProgress 
  } = useDownloadStore();

  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setDownloaded(isDownloaded(song.id));
    setDownloading(isDownloadingNow(song.id));
    setProgress(getProgress(song.id));
  }, [song.id]);

  // Update from store changes
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloaded(isDownloaded(song.id));
      setDownloading(isDownloadingNow(song.id));
      setProgress(getProgress(song.id));
    }, 500);

    return () => clearInterval(interval);
  }, [song.id]);

  const handlePress = () => {
    if (downloaded) {
      deleteSong(song.id);
      setDownloaded(false);
    } else if (!downloading) {
      downloadSong(song);
      setDownloading(true);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.button}
      disabled={downloading}
    >
      {downloading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : downloaded ? (
        <Ionicons 
          name="checkmark-circle" 
          size={size} 
          color={colors.success} 
        />
      ) : (
        <Ionicons 
          name="download-outline" 
          size={size} 
          color={colors.textSecondary} 
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});