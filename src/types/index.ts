export interface Song {
  id: string;
  name: string;
  duration: number;
  language: string;
  album: {
    id: string;
    name: string;
    url?: string;
  };
  year?: string;
  releaseDate?: string | null;
  label?: string;
  primaryArtists: string;
  primaryArtistsId: string;
  explicitContent?: number;
  playCount?: string;
  hasLyrics?: string;
  url?: string;
  copyright?: string;
  image: any[];
  downloadUrl: any[];
  artists?: {
    primary: any[];
  };
}

export interface Artist {
  id: string;
  name: string;
  image: any[];
  followerCount?: string;
  fanCount?: string;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: string;
}

export interface Album {
  id: string;
  name: string;
  year: string;
  type?: string;
  playCount?: string;
  language?: string;
  explicitContent?: boolean;
  songCount?: number;
  image: any[];
  artists?: {
    primary: any[];
  };
}

export interface SearchResponse {
  status: string;
  data: {
    results: Song[];
    total: number;
    start: number;
  };
}

export type RepeatMode = 'off' | 'all' | 'one';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
  ArtistDetail: { artistId: string };
  AlbumDetail: { albumId: string };
  Search: undefined;
};

export type TabParamList = {
  Home: undefined;
  Songs: undefined;
  Artists: undefined;
  Albums: undefined;
  Settings: undefined;
};