import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../constants/colors';
import { saavnAPI } from '../api/saavn';
import { Artist } from '../types';
import { getImageUrl } from '../utils/helpers';
import { TabScreenProps } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import CustomTabBar from '../components/navigation/CustomTabBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ArtistsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      // Load popular artists
      const results = await saavnAPI.searchArtists('popular artists');
      setArtists(results);
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistPress = (artist: Artist) => {
    navigation.navigate('ArtistDetail', {
      artistId: artist.id,
      artistName: artist.name,
    });
  };

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={styles.artistCard}
      onPress={() => handleArtistPress(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.image) }}
        style={styles.artistImage}
        resizeMode="cover"
      />
      <View style={styles.artistInfo}>
        <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.followerCount && (
          <Text style={[styles.followerCount, { color: colors.textSecondary }]}>
            {item.followerCount} followers
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={[styles.artistCount, { color: colors.textSecondary }]}>{artists.length} artists</Text>
      </View>

      <FlatList
        data={artists}
        renderItem={renderArtistItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  artistCount: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  artistCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  artistInfo: {
    alignItems: 'center',
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  followerCount: {
    fontSize: 12,
  },
});