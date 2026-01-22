import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../../store/playerStore';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/colors';

export default function PlayerControls() {
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const {
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    isShuffled,
    repeatMode,
  } = usePlayerStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: colors.card }]}
        onPress={toggleShuffle}
      >
        <Ionicons
          name={isShuffled ? 'shuffle' : 'shuffle-outline'}
          size={24}
          color={isShuffled ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: colors.card }]}
        onPress={playPrevious}
      >
        <Ionicons name="play-skip-back" size={28} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: colors.primary }]}
        onPress={togglePlayPause}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color={Colors.light.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: colors.card }]}
        onPress={playNext}
      >
        <Ionicons name="play-skip-forward" size={28} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: colors.card }]}
        onPress={toggleRepeat}
      >
        <Ionicons
          name={
            repeatMode === 'off'
              ? 'repeat-outline'
              : 'repeat'
          }
          size={24}
          color={repeatMode === 'off' ? colors.textSecondary : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
});
