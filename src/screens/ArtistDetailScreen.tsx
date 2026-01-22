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
import { Artist, Song } from '../types';
import { getImageUrl, extractArtistNames } from '../utils/helpers';
import { formatDuration } from '../utils/formatTime';
import { RootStackScreenProps } from '../navigation/types';

export default function ArtistDetailScreen({
  route,
  navigation,
}: RootStackScreenProps<'ArtistDetail'>) {
  const { artistId, artistName } = route.params;
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { playSong } = usePlayerStore();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtistData();
  }, [artistId]);

  const loadArtistData = async () => {
    try {
      const [artistData, artistSongs] = await Promise.all([
        saavnAPI.getArtistById(artistId),
        saavnAPI.getArtistSongs(artistId),
      ]);

      setArtist(artistData);
      setSongs(artistSongs);
    } catch (error) {
      console.error('Error loading artist:', error);
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={['#FF6B00', '#FF8C42']}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {artist && (
            <>
              <Image
                source={{ uri: getImageUrl(artist.image, '500x500') }}
                style={styles.artistImage}
              />
              <Text style={styles.artistName}>
                {artist.name}
              </Text>
              {artist.followerCount && (
                <Text style={styles.followers}>
                  {artist.followerCount} followers
                </Text>
              )}
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.shuffleButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={handlePlayAll}
            >
              <Ionicons name="shuffle" size={20} color="#FFFFFF" />
              <Text style={styles.shuffleText}>Shuffle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: '#FFFFFF' }]}
              onPress={handlePlayAll}
            >
              <Ionicons name="play" size={24} color="#FF6B00" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Songs Section */}
        <View style={styles.songsSection}>
          <View style={styles.songsHeader}>
            <Text style={[styles.songsTitle, { color: colors.text }]}>
              Songs
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {songs.map((song, index) => (
            <TouchableOpacity
              key={song.id}
              style={[styles.songItem, { backgroundColor: colors.card }]}
              onPress={() => handleSongPress(song, index)}
            >
              <Image
                source={{ uri: getImageUrl(song.image, '150x150') }}
                style={styles.songThumbnail}
              />
              <View style={styles.songInfo}>
                <Text style={[styles.songName, { color: colors.text }]}>
                  {song.name}
                </Text>
                <Text style={[styles.songMeta, { color: colors.textSecondary }]}>
                  {formatDuration(song.duration)}
                </Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
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
  artistImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 16,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  followers: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
  songsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  songsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  songThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songMeta: {
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
  },
});
