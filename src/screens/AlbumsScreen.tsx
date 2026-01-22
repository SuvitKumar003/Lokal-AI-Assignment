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
import { Album } from '../types';
import { getImageUrl } from '../utils/helpers';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import CustomTabBar from '../components/navigation/CustomTabBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AlbumsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const results = await saavnAPI.searchAlbums('bollywood albums');
      setAlbums(results);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('AlbumDetail', {
      albumId: album.id,
      albumName: album.name,
    });
  };

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.albumCard}
      onPress={() => handleAlbumPress(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.image) }}
        style={styles.albumImage}
        resizeMode="cover"
      />
      <Text style={[styles.albumName, { color: colors.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.albumYear, { color: colors.textSecondary }]}>
        {item.year}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
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
        <Text style={[styles.albumCount, { color: colors.textSecondary }]}>
          {albums.length} albums
        </Text>
      </View>

      <FlatList
        data={albums}
        renderItem={renderAlbumItem}
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
  albumCount: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  albumCard: {
    width: '48%',
    marginBottom: 20,
  },
  albumImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  albumYear: {
    fontSize: 12,
  },
});