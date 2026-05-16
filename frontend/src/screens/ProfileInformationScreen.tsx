import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '../components/common/Header';
import { useTheme } from '../theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type StoredUser = {
  email: string;
  fullName: string;
  role: string;
};

type StoredUserData = StoredUser;

const ProfileInformationScreen = () => {
  const { theme } = useTheme();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        scroll: {
          flex: 1,
        },
        scrollContent: {
          padding: theme.spacing.md,
          paddingBottom: 24,
          gap: theme.spacing.md,
        },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness.md,
          ...theme.shadows.level1,
          overflow: 'hidden',
        },
        section: {
          padding: theme.spacing.md,
        },
        sectionTitle: {
          ...theme.typography.labelCaps,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.sm,
        },
        rowLabel: {
          ...theme.typography.bodyMd,
          color: theme.colors.textSecondary,
        },
        rowValue: {
          ...theme.typography.bodyMd,
          color: theme.colors.text,
          fontWeight: '600',
          marginLeft: theme.spacing.md,
          flex: 1,
          textAlign: 'right',
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.outlineVariant,
        },
        actions: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          padding: theme.spacing.md,
        },
        actionButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 12,
          borderRadius: theme.roundness.md,
          backgroundColor: theme.colors.primary,
        },
        actionButtonText: {
          ...theme.typography.bodyMd,
          color: theme.colors.onPrimary,
          fontWeight: '700',
        },
        secondaryActionButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 12,
          borderRadius: theme.roundness.md,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        },
        secondaryActionText: {
          ...theme.typography.bodyMd,
          color: theme.colors.text,
          fontWeight: '700',
        },
        loadingWrap: {
          paddingVertical: theme.spacing.xl,
        },
      }),
    [theme],
  );

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setIsLoading(true);
      try {
        const raw = await AsyncStorage.getItem('user_data');
        if (!raw) {
          if (mounted) setUser(null);
          return;
        }

        const parsed = JSON.parse(raw) as StoredUserData;
        const nextUser = parsed ?? null;

        if (mounted) setUser(nextUser);
      } catch (e) {
        // Keep UI stable if storage has unexpected data
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  const fullName = user?.fullName ?? '';
  const email = user?.email ?? '';
  const role = user?.role ?? '';

  // Backend currently only returns email/fullName/role. Other fields are left blank.
  const phone = '—';
  const workUnit = '—';

  return (
    <View style={styles.container}>
      <Header showBack title="Profile Information" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.section}>
                <View style={styles.row}>
                <Text style={styles.sectionTitle}>Họ & Tên</Text>
                  <Text style={styles.rowValue}>{fullName || '—'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <View style={styles.row}>
                  <Text style={styles.sectionTitle}>Email</Text>
                  <Text style={styles.rowValue}>{email || '—'}</Text>
                </View>
              </View>



              <View style={styles.divider} />

              <View style={styles.section}>
                <View style={styles.row}>
                  <Text style={styles.sectionTitle}>Quyền hạn</Text>
                  <Text style={styles.rowValue}>{role || '—'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // TODO: mở màn hình edit profile nếu có
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="create-outline" size={18} color={theme.colors.onPrimary} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={() => {
                    // TODO: thêm logic thay đổi password nếu muốn
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.text} />
                  <Text style={styles.secondaryActionText}>Security</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ProfileInformationScreen;
