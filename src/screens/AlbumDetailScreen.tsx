import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { Colors } from '../constants/colors';
import { saavnAPI } from '../api/saavn';
import { Song } from '../types';
import { getImageUrl, extractArtistNames } from '../utils/helpers';
import { formatDuration } from '../utils/formatTime';
import { RootStackScreenProps } from '../navigation/types';

export default function AlbumDetailScreen({
  route,
  navigation,
}: RootStackScreenProps<'AlbumDetail'>) {
  const { albumId, albumName } = route.params;
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { playSong } = usePlayerStore();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbumSongs();
  }, [albumId]);

  const loadAlbumSongs = async () => {
    try {
      const results = await saavnAPI.searchSongs(albumName);
      setSongs(results.slice(0, 15));
    } catch (error) {
      console.error('Error loading album:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  const handleSongPress = (song: Song, index: number) => {
    playSong(song, songs, index);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const albumImage = songs[0]?.image;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.background]}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {albumImage && (
            <Image
              source={{ uri: getImageUrl(albumImage) }}
              style={styles.albumImage}
            />
          )}

          <Text style={[styles.albumName, { color: '#fff' }]}>
            {albumName}
          </Text>

          <Text style={[styles.songCount, { color: '#fff' }]}>
            {songs.length} songs
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.shuffleButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handlePlayAll}
            >
              <Ionicons name="shuffle" size={20} color="#fff" />
              <Text style={styles.shuffleText}>Shuffle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.playButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handlePlayAll}
            >
              <Ionicons name="play" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Songs */}
        <View style={styles.songsSection}>
          <Text style={[styles.songsTitle, { color: colors.text }]}>
            Songs
          </Text>

          {songs.map((song, index) => (
            <TouchableOpacity
              key={song.id}
              style={styles.songItem}
              onPress={() => handleSongPress(song, index)}
            >
              <Text
                style={[styles.songNumber, { color: colors.textSecondary }]}
              >
                {index + 1}
              </Text>

              <View style={styles.songInfo}>
                <Text
                  style={[styles.songName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {song.name}
                </Text>
                <Text
                  style={[styles.artistName, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {extractArtistNames(song)}
                </Text>
              </View>

              <Text
                style={[styles.duration, { color: colors.textSecondary }]}
              >
                {formatDuration(song.duration)}
              </Text>

              <Ionicons
                name="ellipsis-vertical"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  albumImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  albumName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  songCount: {
    fontSize: 14,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  shuffleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  songsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  songNumber: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
  },
  duration: {
    fontSize: 14,
  },
});
