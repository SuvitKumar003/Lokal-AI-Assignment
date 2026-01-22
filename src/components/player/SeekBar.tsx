import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../../store/playerStore';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/colors';
import { formatDuration } from '../../utils/formatTime';

export default function SeekBar() {
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { position, duration, seekTo } = usePlayerStore();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleValueChange = (value: number) => {
    setSeekPosition(value);
  };

  const handleSlidingComplete = async (value: number) => {
    await seekTo(value);
    setIsSeeking(false);
  };

  const displayPosition = isSeeking ? seekPosition : position;

  return (
    <View style={styles.container}>
      <Text style={[styles.timeText, { color: colors.textSecondary }]}>
        {formatDuration(Math.floor(displayPosition / 1000))}
      </Text>
      
      <Slider
        style={styles.slider}
        value={displayPosition}
        minimumValue={0}
        maximumValue={duration || 1}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        onSlidingStart={handleSlidingStart}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
      />
      
      <Text style={[styles.timeText, { color: colors.textSecondary }]}>
        {formatDuration(Math.floor(duration / 1000))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  timeText: {
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
});