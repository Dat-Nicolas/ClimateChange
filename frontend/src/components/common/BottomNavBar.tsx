import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

export type TabKey = 'DashboardStack' | 'Schedules' | 'ActivityLogStack' | 'SettingsStack';

interface BottomNavBarProps {
  activeTab: TabKey;
  navigation: any;
}

const tabs: Array<{ key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'DashboardStack', label: 'Dashboard', icon: 'grid-outline' },
  { key: 'Schedules', label: 'Đặt lịch', icon: 'calendar-outline' },
  { key: 'ActivityLogStack', label: 'Nhật ký', icon: 'document-text-outline' },
  { key: 'SettingsStack', label: 'Cài đặt', icon: 'settings-outline' },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleNavigation = useCallback(
    (tabKey: TabKey) => {
      if (tabKey !== activeTab) {
        navigation.navigate(tabKey);
      }
    },
    [navigation, activeTab],
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          shadowColor: '#000',
        },
      ]}
    >
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                isActive && {
                  backgroundColor:
                    theme.colors.background === '#F8F9FF'
                      ? 'rgba(16, 185, 129, 0.20)'
                      : 'rgba(16, 185, 129, 0.30)',
                  borderWidth: 1,
                  borderColor: 'rgba(16, 185, 129, 0.55)',
                },
              ]}
              activeOpacity={0.85}
              onPress={() => handleNavigation(tab.key)}
              accessibilityLabel={`Đi đến ${tab.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? theme.colors.success : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? theme.colors.text : theme.colors.textSecondary,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default BottomNavBar;
