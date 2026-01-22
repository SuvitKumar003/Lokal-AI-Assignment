import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../constants/colors';
import { TabScreenProps } from '../navigation/types';
import CustomTabBar from '../components/navigation/CustomTabBar';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useThemeStore();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            🎵 Mume
          </Text>
        </View>

        <CustomTabBar />

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="moon"
                size={20}
                color={colors.text}
              />
              <Text
                style={[styles.settingText, { color: colors.text }]}
              >
                Dark Mode
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
            />
          </View>
        </View>

        {/* Playback Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PLAYBACK
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: colors.card },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="musical-notes"
                size={20}
                color={colors.text}
              />
              <Text
                style={[styles.settingText, { color: colors.text }]}
              >
                Audio Quality
              </Text>
            </View>

            <View style={styles.settingRight}>
              <Text
                style={[styles.settingValue, { color: colors.textSecondary }]}
              >
                High
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: colors.card },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.text}
              />
              <Text
                style={[styles.settingText, { color: colors.text }]}
              >
                About App
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="code-slash"
                size={20}
                color={colors.text}
              />
              <Text
                style={[styles.settingText, { color: colors.text }]}
              >
                Version
              </Text>
            </View>

            <Text
              style={[styles.settingValue, { color: colors.textSecondary }]}
            >
              1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingText: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
});
