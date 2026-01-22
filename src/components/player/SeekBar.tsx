import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/colors';
import { formatDuration } from '../../utils/formatTime';

const { width } = Dimensions.get('window');

export default function SeekBar() {
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { position, duration } = usePlayerStore();

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.timeText, { color: colors.textSecondary }]}>
        {formatDuration(position)}
      </Text>
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: colors.textSecondary, width: (width - 120) * progress },
          ]}
        />
        <View style={[styles.track, { backgroundColor: colors.border }]} />
      </View>
      <Text style={[styles.timeText, { color: colors.textSecondary }]}>
        {formatDuration(duration)}
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
  progressContainer: {
    flex: 1,
    height: 4,
    marginHorizontal: 12,
    position: 'relative',
  },
  track: {
    position: 'absolute',
    height: 4,
    width: '100%',
    borderRadius: 2,
  },
  progressBar: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    zIndex: 1,
  },
  timeText: {
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
});
