import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme';
import Header from '../components/common/Header';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoControl, setAutoControl] = useState(true);

  const SettingItem = ({ 
    icon, 
    label, 
    value, 
    onToggle, 
    type = 'switch',
    onPress 
  }: { 
    icon: string, 
    label: string, 
    value?: boolean, 
    onToggle?: (val: boolean) => void,
    type?: 'switch' | 'link',
    onPress?: () => void
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
          onValueChange={onToggle}
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
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
              value={darkMode} 
              onToggle={setDarkMode} 
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
              onPress={() => navigation.navigate('Schedules')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem 
              icon="person-outline" 
              label="Profile Information" 
              type="link"
            />
            <View style={styles.divider} />
            <SettingItem 
              icon="lock-closed-outline" 
              label="Security & Password" 
              type="link"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.replace('Login')}
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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.labelCaps,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    ...theme.shadows.level1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    marginLeft: theme.spacing.xxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    marginTop: theme.spacing.lg,
    ...theme.shadows.level1,
  },
  logoutText: {
    ...theme.typography.bodyMd,
    color: theme.colors.tertiary,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  versionText: {
    ...theme.typography.bodySm,
    color: theme.colors.outline,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
});

export default SettingsScreen;
