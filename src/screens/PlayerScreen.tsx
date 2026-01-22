import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { Colors } from '../constants/colors';
import { getImageUrl, extractArtistNames } from '../utils/helpers';
import { formatDuration } from '../utils/formatTime';
import PlayerControls from '../components/player/PlayerControls';
import SeekBar from '../components/player/SeekBar';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PlayerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    isShuffled,
    repeatMode,
  } = usePlayerStore();
  const { queue, currentIndex } = useQueueStore();

  const [showQueue, setShowQueue] = useState(false);

  if (!currentSong) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No song selected
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderQueueItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.queueItem,
        { backgroundColor: index === currentIndex ? colors.primary + '20' : 'transparent' },
      ]}
      onPress={() => {
        // Handle queue item press
        setShowQueue(false);
      }}
    >
      <Image
        source={{ uri: getImageUrl(item.image, '150x150') }}
        style={styles.queueItemImage}
      />
      <View style={styles.queueItemDetails}>
        <Text
          style={[
            styles.queueItemTitle,
            { color: index === currentIndex ? colors.primary : colors.text },
          ]}
        >
          {item.name}
        </Text>
        <Text style={[styles.queueItemArtist, { color: colors.textSecondary }]}>
          {extractArtistNames(item)}
        </Text>
      </View>
      {index === currentIndex && isPlaying && (
        <Ionicons name="volume-high" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Now Playing</Text>
          <TouchableOpacity onPress={() => setShowQueue(true)}>
            <Ionicons name="list" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Album Art */}
        <View style={styles.albumArtContainer}>
          <Image
            source={{ uri: getImageUrl(currentSong.image, '500x500') }}
            style={styles.albumArt}
          />
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, { color: colors.text }]}>{currentSong.name}</Text>
          <Text style={[styles.artistName, { color: colors.textSecondary }]}>
            {extractArtistNames(currentSong)}
          </Text>
        </View>

        {/* Seek Bar */}
        <SeekBar />

        {/* Controls */}
        <PlayerControls />

        {/* Queue Modal */}
        <Modal
          visible={showQueue}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowQueue(false)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowQueue(false)}>
                <Ionicons name="chevron-down" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Queue</Text>
              <View style={{ width: 28 }} />
            </View>

            <FlatList
              data={queue}
              renderItem={renderQueueItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.queueList}
            />
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  albumArtContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 16,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  queueList: {
    padding: 20,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  queueItemImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  queueItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  queueItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  queueItemArtist: {
    fontSize: 14,
  },
});