import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { Colors } from '../constants/colors';
import { storageService } from '../services/storageService';
import { saavnAPI } from '../api/saavn';
import { Song, Artist } from '../types';
import { getImageUrl, extractArtistNames } from '../utils/helpers';
import CustomTabBar from '../components/navigation/CustomTabBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const { playSong } = usePlayerStore();

  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Load recently played from storage
      const recent = await storageService.getRecentlyPlayed();
      setRecentlyPlayed(recent.slice(0, 10));

      // Load popular songs
      const popularSongs = await saavnAPI.searchSongs('trending');
      setMostPlayed(popularSongs.slice(0, 10));

      // Load popular artists
      let artists = await saavnAPI.searchArtists('arijit');
      
      // Remove combined artists (& ,)
      const singleArtists = artists.filter(
        (artist) =>
          !artist.name.includes('&') &&
          !artist.name.includes(',')
      );

      // Remove duplicate artists (same name)
      const uniqueArtistsMap = new Map<string, Artist>();

      singleArtists.forEach((artist) => {
        const key = artist.name.trim().toLowerCase();
        if (!uniqueArtistsMap.has(key)) {
          uniqueArtistsMap.set(key, artist);
        }
      });

      const uniqueArtists = Array.from(uniqueArtistsMap.values());
      setTopArtists(uniqueArtists.slice(0, 10));

    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSongPress = (song: Song, queue: Song[], index: number) => {
    playSong(song, queue, index);
  };

  const handleArtistPress = (artist: Artist) => {
    navigation.navigate('ArtistDetail', {
      artistId: artist.id,
      artistName: artist.name,
    });
  };

  const renderSongItem = (song: Song, queue: Song[], index: number) => (
    <TouchableOpacity
      key={song.id}
      style={[styles.songCard, { backgroundColor: colors.card }]}
      onPress={() => handleSongPress(song, queue, index)}
    >
      <Image
        source={{ uri: getImageUrl(song.image) }}
        style={styles.songImage}
        resizeMode="cover"
      />
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
          {song.name}
        </Text>
        <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>
          {extractArtistNames(song)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: Artist }) => {
    const imageUrl = getImageUrl(item.image);
    const finalImageUrl = imageUrl || 'https://via.placeholder.com/90x90/666666/ffffff?text=Artist';
    
    return (
      <TouchableOpacity
        style={styles.artistCard}
        onPress={() => handleArtistPress(item)}
      >
        <Image
          source={{ uri: finalImageUrl }}
          style={styles.artistImage}
          resizeMode="cover"
        />
        <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🎵 Mume</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <CustomTabBar />

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Played</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Songs' } as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentlyPlayed}
              renderItem={({ item, index }) => renderSongItem(item, recentlyPlayed, index)}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Artists</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Artists' } as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={topArtists}
              renderItem={renderArtistItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Most Played */}
        {mostPlayed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Most Played</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Songs' } as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={mostPlayed}
              renderItem={({ item, index }) => renderSongItem(item, mostPlayed, index)}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 84, // 64px mini player + 20px spacing
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  songCard: {
    width: 140,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 12,
    marginRight: 12,
  },
  songImage: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 12,
  },
  artistCard: {
    alignItems: 'center',
    width: 100,
    marginRight: 20,
  },
  artistImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});