import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import Header from '../components/common/Header';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/MainTabs';
import { authService } from '../services/api';

type NavigationProp = StackNavigationProp<MainStackParamList, 'SettingsStack'>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeMode, setThemeMode } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [autoControl, setAutoControl] = useState(true);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        scrollContent: {
          padding: theme.spacing.md,
          paddingBottom: 20,
        },
        scroll: {
          flex: 1,
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
      }),
    [theme],
  );

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
        <Ionicons
          name={icon as any}
          size={22}
          color={theme.colors.primary}
        />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={(v) => onToggle?.(v)}
          trackColor={{
            false: theme.colors.outlineVariant,
            true: theme.colors.primary,
          }}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.outline}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Cài đặt" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chung</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="notifications-outline"
              label="Thông báo"
              value={notifications}
              onToggle={setNotifications}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="moon-outline"
              label="Chế độ tối"
              value={themeMode === 'dark'}
              onToggle={(v) => setThemeMode(v ? 'dark' : 'light')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tự động hóa</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="flash-outline"
              label="Tự động hóa chế độ Eco"
              value={autoControl}
              onToggle={setAutoControl}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person-outline"
              label="Thông tin hồ sơ"
              type="link"
              onPress={() => navigation.navigate('ProfileInformation')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              label="Bảo mật & Mật khẩu"
              type="link"
              onPress={() => navigation.navigate('SecurityPassword')}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await authService.logout();
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={theme.colors.tertiary}
          />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
