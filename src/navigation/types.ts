import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
  ArtistDetail: { artistId: string; artistName: string };
  AlbumDetail: { albumId: string; albumName: string };
  Search: undefined;
};

export type TabParamList = {
  Home: undefined;
  Songs: undefined;
  Artists: undefined;
  Albums: undefined;
  Settings: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList = keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList = keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}