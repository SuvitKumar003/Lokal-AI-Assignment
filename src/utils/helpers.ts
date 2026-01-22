import { Song } from '../types';

export const getImageUrl = (
  images: Array<{ quality: string; link?: string; url?: string }>,
  quality: '50x50' | '150x150' | '500x500' = '500x500'
): string => {
  const image = images.find(img => img.quality === quality) || images[images.length - 1];
  return image?.link || image?.url || '';
};

export const getDownloadUrl = (
  downloadUrls: Array<{ quality: string; link?: string; url?: string }>,
  quality: '320kbps' | '160kbps' | '96kbps' = '320kbps'
): string => {
  const url = downloadUrls.find(u => u.quality === quality) || downloadUrls[downloadUrls.length - 1];
  return url?.link || url?.url || '';
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const extractArtistNames = (song: Song): string => {
  if (song.artists?.primary && song.artists.primary.length > 0) {
    return song.artists.primary.map((artist: { name: string }) => artist.name).join(', ');
  }
  return song.primaryArtists || 'Unknown Artist';
};