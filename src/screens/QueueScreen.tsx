import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { Colors } from '../constants/colors';
import { Song } from '../types';
import { getImageUrl, extractArtistNames } from '../utils/helpers';
import { formatDuration } from '../utils/formatTime';

export default function QueueScreen() {
  const navigation = useNavigation();
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { queue, currentIndex, reorderQueue, removeFromQueue } = useQueueStore();

  const handleDragEnd = ({ data, from, to }: { data: Song[]; from: number; to: number }) => {
    if (from !== to) {
      reorderQueue(from, to);
    }
  };

  const handleSongPress = (song: Song, index: number) => {
    playSong(song, queue, index);
  };

  const handleRemove = (index: number) => {
    if (queue.length > 1) {
      removeFromQueue(index);
    }
  };

  const renderItem = ({ item, index, drag, isActive }: RenderItemParams<Song>) => {
    const isCurrentSong = index === currentIndex;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.queueItem,
            {
              backgroundColor: isCurrentSong
                ? colors.primary + '20'
                : colors.card,
            },
            isActive && styles.activeItem,
          ]}
        >
          <TouchableOpacity
            style={styles.songContent}
            onPress={() => handleSongPress(item, index)}
          >
            <Image
              source={{ uri: getImageUrl(item.image, '150x150') }}
              style={styles.thumbnail}
            />
            <View style={styles.songDetails}>
              <Text
                style={[
                  styles.songName,
                  { color: isCurrentSong ? colors.primary : colors.text },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[styles.artistName, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {extractArtistNames(item)} • {formatDuration(item.duration)}
              </Text>
            </View>

            {isCurrentSong && isPlaying && (
              <Ionicons name="volume-high" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.dragHandle}
              onPressIn={drag}
            >
              <Ionicons name="reorder-three" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {queue.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemove(index)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Queue</Text>
        <TouchableOpacity onPress={() => useQueueStore.getState().clearQueue()}>
          <Text style={[styles.clearButton, { color: colors.error }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.queueInfo}>
        <Text style={[styles.queueCount, { color: colors.textSecondary }]}>
          {queue.length} {queue.length === 1 ? 'song' : 'songs'} in queue
        </Text>
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
          Long press and drag to reorder
        </Text>
      </View>

      <DraggableFlatList
        data={queue}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onDragEnd={handleDragEnd}
        contentContainerStyle={styles.listContent}
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
  queueInfo: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  queueCount: {
    fontSize: 14,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  activeItem: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  songContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  songDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  songName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dragHandle: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
});