import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/colors';

export default function CustomTabBar() {
  const { isDark } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    { name: 'Home', label: 'Home', icon: 'home' },
    { name: 'Songs', label: 'Songs', icon: 'musical-notes' },
    { name: 'Artists', label: 'Artists', icon: 'people' },
    { name: 'Albums', label: 'Albums', icon: 'disc' },
    { name: 'Settings', label: 'Settings', icon: 'settings' },
  ];

  const currentRoute = route.name;

  return (
    <View style={[styles.container, { backgroundColor: colors.tabBar, borderBottomColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={isActive ? colors.primary : colors.tabBarInactive}
            />
            <Text style={[
              styles.tabLabel,
              { color: isActive ? colors.primary : colors.tabBarInactive }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16, // Add space after navbar
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
});