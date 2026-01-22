import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { useDownloadStore } from '../store/downloadStore';
import { Colors } from '../constants/colors';
import { Song } from '../types';
import { getImageUrl, extractArtistNames } from '../utils/helpers';
import { formatDuration } from '../utils/formatTime';
import { downloadService } from '../services/downloadService';

export default function DownloadsScreen() {
  const navigation = useNavigation();
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { 
    downloadedSongs, 
    deleteSong, 
    clearAllDownloads, 
    initializeDownloads,
    totalSize 
  } = useDownloadStore();

  useEffect(() => {
    initializeDownloads();
  }, []);

  const handleSongPress = (song: Song, index: number) => {
    playSong(song, downloadedSongs, index);
  };

  const handleDelete = (songId: string, songName: string) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete "${songName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSong(songId),
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (downloadedSongs.length === 0) return;

    Alert.alert(
      'Clear All Downloads',
      `Delete all ${downloadedSongs.length} downloaded songs?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllDownloads,
        },
      ]
    );
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrentSong = currentSong?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.songItem, { backgroundColor: colors.card }]}
        onPress={() => handleSongPress(item, index)}
      >
        <Image
          source={{ uri: getImageUrl(item.image, '150x150') }}
          style={styles.thumbnail}
        />
        
        <View style={styles.songDetails}>
          <View style={styles.songHeader}>
            <Ionicons 
              name="checkmark-circle" 
              size={16} 
              color={colors.success} 
            />
            <Text
              style={[styles.songName, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>
          <Text
            style={[styles.artistName, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {extractArtistNames(item)} • {formatDuration(item.duration)}
          </Text>
        </View>

        {isCurrentSong && isPlaying ? (
          <Ionicons name="volume-high" size={24} color={colors.primary} />
        ) : (
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.name)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="download-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Downloads Yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Download songs to listen offline
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Downloads
        </Text>
        {downloadedSongs.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={[styles.clearButton, { color: colors.error }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {downloadedSongs.length > 0 && (
        <View style={[styles.statsBar, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Ionicons name="musical-notes" size={16} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {downloadedSongs.length} songs
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="albums" size={16} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {downloadService.formatBytes(totalSize)}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={downloadedSongs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          downloadedSongs.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    gap: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  songDetails: {
    flex: 1,
  },
  songHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  artistName: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});