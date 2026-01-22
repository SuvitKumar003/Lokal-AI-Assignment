import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../../store/themeStore';
import { usePlayerStore } from '../../store/playerStore';
import { Colors } from '../../constants/colors';
import { getImageUrl, extractArtistNames } from '../../utils/helpers';
import { RootStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MiniPlayer() {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;

  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    position,
    duration,
  } = usePlayerStore();

  if (!currentSong) return null;

  const progress =
    duration > 0 ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('Player')}
      activeOpacity={0.9}
    >
      {/* Main Content */}
      <View style={styles.content}>
        {/* Artwork */}
        <Image
          source={{ uri: getImageUrl(currentSong.image) }}
          style={styles.artwork}
        />

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text
            style={[styles.songName, { color: colors.text }]}
            numberOfLines={1}
          >
            {currentSong.name}
          </Text>
          <Text
            style={[styles.artistName, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {extractArtistNames(currentSong)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            style={styles.controlButton}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              playNext();
            }}
            style={styles.controlButton}
          >
            <Ionicons
              name="play-skip-forward"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.primary,
              width: `${progress}%`,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10, // Increased elevation for better z-index
    zIndex: 10, // Ensure it appears above other content
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 63,
    paddingHorizontal: 12,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  songName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    padding: 4,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressBar: {
    height: 1,
  },
});
