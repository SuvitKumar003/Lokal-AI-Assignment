export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  tabBar: string;
  tabBarInactive: string;
  success: string;
  error: string;
}

export const Colors: Record<string, ThemeColors> = {
  light: {
    primary: '#FF6B00',
    background: '#FFFFFF',
    card: '#F8F8F8',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    tabBar: '#FFFFFF',
    tabBarInactive: '#999999',
    success: '#4CAF50',
    error: '#F44336',
  },
  dark: {
    primary: '#FF6B00',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    border: '#2A2A2A',
    tabBar: '#1E1E1E',
    tabBarInactive: '#666666',
    success: '#4CAF50',
    error: '#F44336',
  },
};