import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { Colors } from '../constants/colors';
import { saavnAPI } from '../api/saavn';
import { Song, Artist, Album } from '../types';
import { getImageUrl, extractArtistNames } from '../utils/helpers';
import { RootStackScreenProps } from '../navigation/types';

type SearchTab = 'Songs' | 'Artists' | 'Albums';

export default function SearchScreen({ navigation }: RootStackScreenProps) {
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { playSong } = usePlayerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('Songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'Ariana Grande',
    'Morgan Wallen',
    'Justin Bieber',
    'Drake',
  ]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      if (activeTab === 'Songs') {
        setSongs(await saavnAPI.searchSongs(query));
      } else if (activeTab === 'Artists') {
        setArtists(await saavnAPI.searchArtists(query));
      } else {
        setAlbums(await saavnAPI.searchAlbums(query));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- RENDER ITEMS ---------- */

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => {
        playSong(item, songs, index);
        navigation.goBack();
      }}
    >
      <Image
        source={{ uri: getImageUrl(item.image) }}
        style={styles.thumbnail}
      />

      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text
          style={[styles.itemSubtext, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {extractArtistNames(item)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() =>
        navigation.replace('ArtistDetail', {
          artistId: item.id,
          artistName: item.name,
        })
      }
    >
      <Image
        source={{ uri: getImageUrl(item.image) }}
        style={[styles.thumbnail, styles.roundThumbnail]}
      />

      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() =>
        navigation.replace('AlbumDetail', {
          albumId: item.id,
          albumName: item.name,
        })
      }
    >
      <Image
        source={{ uri: getImageUrl(item.image) }}
        style={styles.thumbnail}
      />

      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.itemSubtext, { color: colors.textSecondary }]}>
          {item.year}
        </Text>
      </View>
    </TouchableOpacity>
  );

  /* ---------- UI ---------- */

  const tabs: SearchTab[] = ['Songs', 'Artists', 'Albums'];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />

          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            autoFocus
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recent */}
      {searchQuery.length === 0 ? (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: colors.text }]}>
              Recent Searches
            </Text>
            <TouchableOpacity onPress={() => setRecentSearches([])}>
              <Text style={[styles.clearAll, { color: colors.primary }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          {recentSearches.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.recentItem}
              onPress={() => {
                setSearchQuery(item);
                handleSearch(item);
              }}
            >
              <Text style={[styles.recentText, { color: colors.text }]}>
                {item}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View style={[styles.tabs, { borderColor: colors.border }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => {
                  setActiveTab(tab);
                  handleSearch(searchQuery);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === tab
                          ? colors.primary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {tab}
                </Text>

                {activeTab === tab && (
                  <View
                    style={[
                      styles.tabIndicator,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList<any>
              data={
                activeTab === 'Songs'
                  ? songs
                  : activeTab === 'Artists'
                  ? artists
                  : albums
              }
              renderItem={
                activeTab === 'Songs'
                  ? (renderSongItem as any)
                  : activeTab === 'Artists'
                  ? (renderArtistItem as any)
                  : (renderAlbumItem as any)
              }
              keyExtractor={(item: any) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>😔</Text>
                  <Ionicons
                    name="search"
                    size={48}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No results found
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tab: { paddingVertical: 12, marginRight: 24 },
  tabText: { fontSize: 16, fontWeight: '500' },
  tabIndicator: { height: 2, marginTop: 6, borderRadius: 1 },
  listContent: { paddingHorizontal: 20, paddingTop: 12 },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  thumbnail: { width: 56, height: 56, borderRadius: 8 },
  roundThumbnail: { borderRadius: 28 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemSubtext: { fontSize: 14 },
  recentContainer: { paddingHorizontal: 20, paddingTop: 20 },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recentTitle: { fontSize: 18, fontWeight: '600' },
  clearAll: { fontSize: 14 },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  recentText: { fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyText: { fontSize: 16, marginTop: 16 },
});
