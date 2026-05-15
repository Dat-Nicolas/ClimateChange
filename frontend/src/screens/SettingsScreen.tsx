import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { theme as lightTheme, useTheme } from '../theme';
import Header from '../components/common/Header';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { authService } from '../services/api';

type NavigationProp = StackNavigationProp<RootStackParamList, 'SettingsStack'>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeMode, setThemeMode } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [autoControl, setAutoControl] = useState(true);

  const SettingItem = ({
    icon,
    label,
    value,
    onToggle,
    type = 'switch',
    onPress,
  }: {
    icon: string;
    label: string;
    value?: boolean;
    onToggle?: (val: boolean) => void;
    type?: 'switch' | 'link';
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={type === 'switch' && !onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={22} color={theme.colors.primary} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={(v) => onToggle?.(v)}
          trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.outline} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Settings" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="notifications-outline"
              label="Push Notifications"
              value={notifications}
              onToggle={setNotifications}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="moon-outline"
              label="Dark Mode"
              value={themeMode === 'dark'}
              onToggle={(v) => setThemeMode(v ? 'dark' : 'light')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Automation</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="flash-outline"
              label="Eco-Mode Automation"
              value={autoControl}
              onToggle={setAutoControl}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="time-outline"
              label="Schedule Management"
              type="link"
              onPress={() =>
                navigation.getParent()?.navigate('Schedules')
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem icon="person-outline" label="Profile Information" type="link" />
            <View style={styles.divider} />
            <SettingItem icon="lock-closed-outline" label="Security & Password" type="link" />
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await authService.logout();
          }}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.colors.tertiary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0 (Production)</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  scrollContent: {
    padding: lightTheme.spacing.md,
    paddingBottom: 20,
  },
  scroll: {
    flex: 1,
  },
  section: {
    marginBottom: lightTheme.spacing.lg,
  },
  sectionTitle: {
    ...lightTheme.typography.labelCaps,
    color: lightTheme.colors.textSecondary,
    marginBottom: lightTheme.spacing.sm,
    marginLeft: lightTheme.spacing.xs,
  },
  sectionContent: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.roundness.md,
    ...lightTheme.shadows.level1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: lightTheme.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    ...lightTheme.typography.bodyMd,
    color: lightTheme.colors.text,
    marginLeft: lightTheme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: lightTheme.colors.outlineVariant,
    marginLeft: lightTheme.spacing.xxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTheme.colors.surface,
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.roundness.md,
    marginTop: lightTheme.spacing.lg,
    ...lightTheme.shadows.level1,
  },
  logoutText: {
    ...lightTheme.typography.bodyMd,
    color: lightTheme.colors.tertiary,
    fontWeight: '600',
    marginLeft: lightTheme.spacing.sm,
  },
  versionText: {
    ...lightTheme.typography.bodySm,
    color: lightTheme.colors.outline,
    textAlign: 'center',
    marginTop: lightTheme.spacing.xl,
    marginBottom: lightTheme.spacing.xl,
  },
});

export default SettingsScreen;
