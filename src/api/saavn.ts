import { Song, Artist, Album, SearchResponse } from '../types';

const BASE_URL = 'https://saavn.sumit.co';

interface ApiResponse<T> {
  status?: string;
  success?: boolean;
  data: T;
}

export const saavnAPI = {
  // Search endpoints
  searchSongs: async (query: string): Promise<Song[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/search/songs?query=${encodeURIComponent(query)}`);
      const data: SearchResponse = await response.json();
      return data.data.results;
    } catch (error: unknown) {
      console.error('Error searching songs:', error);
      return [];
    }
  },

  searchArtists: async (query: string): Promise<Artist[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/search/artists?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      console.log('Artists API response:', data);
      return data.data?.results || [];
    } catch (error: unknown) {
      console.error('Error searching artists:', error);
      return [];
    }
  },

  searchAlbums: async (query: string): Promise<Album[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/search/albums?query=${encodeURIComponent(query)}`);
      const data: ApiResponse<{ results: Album[] }> = await response.json();
      return data.data.results;
    } catch (error: unknown) {
      console.error('Error searching albums:', error);
      return [];
    }
  },

  // Song endpoints
  getSongById: async (id: string): Promise<Song | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/songs/${id}`);
      const data: ApiResponse<Song[]> = await response.json();
      return data.data[0] || null;
    } catch (error: unknown) {
      console.error('Error fetching song:', error);
      return null;
    }
  },

  getSongSuggestions: async (id: string): Promise<Song[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/songs/${id}/suggestions`);
      const data: ApiResponse<Song[]> = await response.json();
      return data.data;
    } catch (error: unknown) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  },

  // Artist endpoints
  getArtistById: async (id: string): Promise<Artist | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/artists/${id}`);
      const data: ApiResponse<Artist> = await response.json();
      return data.data;
    } catch (error: unknown) {
      console.error('Error fetching artist:', error);
      return null;
    }
  },

  getArtistSongs: async (id: string): Promise<Song[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/artists/${id}/songs`);
      const data: ApiResponse<{ songs: Song[] }> = await response.json();
      return data.data.songs;
    } catch (error: unknown) {
      console.error('Error fetching artist songs:', error);
      return [];
    }
  },

  getArtistAlbums: async (id: string): Promise<Album[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/artists/${id}/albums`);
      const data: ApiResponse<{ albums: Album[] }> = await response.json();
      return data.data.albums;
    } catch (error: unknown) {
      console.error('Error fetching artist albums:', error);
      return [];
    }
  },
};