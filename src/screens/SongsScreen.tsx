import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { Colors } from '../constants/colors';
import { saavnAPI } from '../api/saavn';
import { Song } from '../types';
import { getImageUrl, extractArtistNames } from '../utils/helpers';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import CustomTabBar from '../components/navigation/CustomTabBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SortField = 'name' | 'artist' | 'album' | 'year';
type SortOrder = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  label: string;
  icon: string;
}

const ITEMS_PER_PAGE = 20;

export default function SongsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showSortModal, setShowSortModal] = useState(false);

  const sortOptions: SortOption[] = [
    { field: 'name', label: 'Song Name', icon: 'musical-note' },
    { field: 'artist', label: 'Artist', icon: 'people' },
    { field: 'album', label: 'Album', icon: 'disc' },
    { field: 'year', label: 'Year', icon: 'calendar' },
  ];

  const sortedSongs = useMemo(() => {
    return [...allSongs].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'artist':
          aValue = extractArtistNames(a).toLowerCase();
          bValue = extractArtistNames(b).toLowerCase();
          break;
        case 'album':
          aValue = a.album.name.toLowerCase();
          bValue = b.album.name.toLowerCase();
          break;
        case 'year':
          aValue = parseInt(a.year || '0') || 0;
          bValue = parseInt(b.year || '0') || 0;
          break;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [allSongs, sortField, sortOrder]);

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    const paginated = sortedSongs.slice(0, currentPage * ITEMS_PER_PAGE);
    setDisplayedSongs(paginated);
  }, [sortedSongs, currentPage]);

  const loadSongs = async () => {
    try {
      const results = await saavnAPI.searchSongs('latest hindi songs');
      setAllSongs(results);
      setDisplayedSongs(results.slice(0, ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (loadingMore || displayedSongs.length >= sortedSongs.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const newSongs = sortedSongs.slice(0, nextPage * ITEMS_PER_PAGE);
      setDisplayedSongs(newSongs);
      setCurrentPage(nextPage);
      setLoadingMore(false);
    }, 500);
  };

  const handleSongPress = (song: Song, index: number) => {
    playSong(song, sortedSongs, index);
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Loading more...
        </Text>
      </View>
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
          <Text style={[styles.songName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.artistName, { color: colors.textSecondary }]}>
            {extractArtistNames(item)} • {item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : '0:00'}
          </Text>
        </View>
        {isCurrentSong && isPlaying ? (
          <Ionicons name="volume-high" size={24} color={colors.primary} />
        ) : (
          <Ionicons name="play" size={24} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>🎵 Mume</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <CustomTabBar />

      <View style={styles.subHeader}>
        <Text style={[styles.songCount, { color: colors.textSecondary }]}>
          {displayedSongs.length} of {sortedSongs.length} songs
        </Text>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
          <Ionicons name="swap-vertical" size={16} color={colors.textSecondary} />
          <Text style={[styles.sortText, { color: colors.textSecondary }]}>
            {sortOptions.find(opt => opt.field === sortField)?.label} {sortOrder === 'asc' ? '↑' : '↓'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedSongs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sort Songs</Text>
            
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sort by</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.field}
                style={[styles.sortOption, sortField === option.field && { backgroundColor: colors.primary + '20' }]}
                onPress={() => setSortField(option.field)}
              >
                <Ionicons name={option.icon as any} size={20} color={sortField === option.field ? colors.primary : colors.textSecondary} />
                <Text style={[styles.sortOptionText, { color: sortField === option.field ? colors.primary : colors.text }]}>
                  {option.label}
                </Text>
                {sortField === option.field && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 20 }]}>Order</Text>
            <View style={styles.orderOptions}>
              <TouchableOpacity
                style={[styles.orderOption, sortOrder === 'asc' && { backgroundColor: colors.primary + '20' }]}
                onPress={() => setSortOrder('asc')}
              >
                <Ionicons name="arrow-up" size={16} color={sortOrder === 'asc' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.orderOptionText, { color: sortOrder === 'asc' ? colors.primary : colors.text }]}>
                  A → Z
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.orderOption, sortOrder === 'desc' && { backgroundColor: colors.primary + '20' }]}
                onPress={() => setSortOrder('desc')}
              >
                <Ionicons name="arrow-down" size={16} color={sortOrder === 'desc' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.orderOptionText, { color: sortOrder === 'desc' ? colors.primary : colors.text }]}>
                  Z → A
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  songCount: {
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 84, // 64px mini player + 20px spacing
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
  songName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    gap: 12,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
  },
  orderOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  orderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  orderOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});