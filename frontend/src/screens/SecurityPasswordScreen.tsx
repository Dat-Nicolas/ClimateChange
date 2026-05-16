import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import { useTheme } from '../theme/ThemeProvider';

const SecurityPasswordScreen = () => {
  const { theme } = useTheme();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

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
          paddingBottom: theme.spacing.xl,
          gap: theme.spacing.md,
        },
        sectionTitle: {
          ...theme.typography.labelCaps,
          color: theme.colors.textSecondary,
          marginHorizontal: theme.spacing.xs,
          marginBottom: theme.spacing.xs,
        },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          ...theme.shadows.level1,
          overflow: 'hidden',
        },
        cardRow: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.md,
        },
        iconBox: {
          width: 72,
          height: 72,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        iconBoxPrimary: {
          backgroundColor: '#02545C',
        },
        iconBoxSuccess: {
          backgroundColor: '#D7F3E5',
        },
        iconBoxAlt: {
          backgroundColor: '#01545D',
        },
        rowBody: {
          flex: 1,
        },
        rowTitle: {
          ...theme.typography.bodyLg,
          color: theme.colors.text,
          fontWeight: '700',
          marginBottom: 2,
        },
        rowSubtitle: {
          ...theme.typography.bodyMd,
          color: theme.colors.textSecondary,
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.outlineVariant,
        },
        deviceRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        },
        deviceIconWrap: {
          width: 54,
          alignItems: 'center',
          justifyContent: 'center',
        },
        deviceTextWrap: {
          flex: 1,
        },
        deviceTitleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 2,
        },
        deviceTitle: {
          ...theme.typography.bodyLg,
          color: theme.colors.text,
          fontWeight: '700',
        },
        currentBadge: {
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: theme.roundness.full,
          backgroundColor: '#66EA9E',
        },
        currentBadgeText: {
          ...theme.typography.bodySm,
          color: '#05603A',
          fontWeight: '800',
        },
        deviceSubtitle: {
          ...theme.typography.bodyMd,
          color: theme.colors.textSecondary,
        },
        logoutAllButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.spacing.md,
          gap: 10,
        },
        logoutAllText: {
          ...theme.typography.bodyLg,
          color: '#C81E1E',
          fontWeight: '700',
        },
        statusCard: {
          height: 180,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          overflow: 'hidden',
          backgroundColor: '#0A2C43',
          ...theme.shadows.level2,
          padding: 18,
          justifyContent: 'center',
        },
        statusOverlayOne: {
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          right: -80,
          top: -40,
        },
        statusOverlayTwo: {
          position: 'absolute',
          width: 190,
          height: 190,
          borderRadius: 95,
          backgroundColor: 'rgba(16, 185, 129, 0.14)',
          right: -35,
          bottom: -45,
        },
        statusSmall: {
          ...theme.typography.labelCaps,
          color: '#B2D8E9',
          marginBottom: 8,
        },
        statusTitle: {
          fontSize: 46,
          lineHeight: 46,
          color: '#D6F2FF',
          marginBottom: 6,
        },
        statusText: {
          ...theme.typography.h2,
          color: '#FFFFFF',
          maxWidth: 230,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.container}>
      <Header
        showBack
        title="Bảo mật & Mật khẩu"
        rightElement={
          <TouchableOpacity
            onPress={() => Alert.alert('Thông tin', 'Quản lý bảo mật tài khoản và thiết bị đăng nhập')}
          >
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View>
          <Text style={styles.sectionTitle}>MẬT KHẨU</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardRow}
              activeOpacity={0.86}
              onPress={() => Alert.alert('Đổi mật khẩu', 'Tính năng đổi mật khẩu sẽ được cập nhật sau')}
            >
              <View style={[styles.iconBox, styles.iconBoxPrimary]}>
                <Ionicons name="lock-closed-outline" size={28} color="#D6F2FF" />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Đổi mật khẩu</Text>
                <Text style={styles.rowSubtitle}>Thay đổi lần cuối 3 tháng trước</Text>
              </View>
              <Ionicons name="chevron-forward" size={26} color={theme.colors.outline} />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>XÁC THỰC HAI LỚP</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, styles.iconBoxSuccess]}>
                <Ionicons name="shield-checkmark-outline" size={30} color="#00703C" />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Xác thực 2 yếu tố</Text>
                <Text style={styles.rowSubtitle}>Bảo vệ tài khoản bằng mã SMS hoặc Email</Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: '#C2CAD1', true: '#01803F' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>SINH TRẮC HỌC</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, styles.iconBoxAlt]}>
                <MaterialCommunityIcons name="fingerprint" size={30} color="#D6F2FF" />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Sử dụng FaceID/Vân tay</Text>
                <Text style={styles.rowSubtitle}>Đăng nhập nhanh chóng và bảo mật</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#C2CAD1', true: '#01803F' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>THIẾT BỊ ĐÃ ĐĂNG NHẬP</Text>
          <View style={styles.card}>
            <View style={styles.deviceRow}>
              <View style={styles.deviceIconWrap}>
                <Ionicons name="phone-portrait-outline" size={36} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.deviceTextWrap}>
                <View style={styles.deviceTitleRow}>
                  <Text style={styles.deviceTitle}>iPhone 15 Pro</Text>
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>HIỆN TẠI</Text>
                  </View>
                </View>
                <Text style={styles.deviceSubtitle}>Hà Nội, Việt Nam • 2 giờ trước</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Thiết bị', 'Đã mở tùy chọn thiết bị')}>
                <Ionicons name="log-out-outline" size={24} color="#C81E1E" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.deviceRow}>
              <View style={styles.deviceIconWrap}>
                <Ionicons name="laptop-outline" size={34} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.deviceTextWrap}>
                <Text style={styles.deviceTitle}>Chrome trên Windows</Text>
                <Text style={styles.deviceSubtitle}>Hồ Chí Minh, Việt Nam • Hôm qua</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Thiết bị', 'Đã mở tùy chọn thiết bị')}>
                <Ionicons name="log-out-outline" size={24} color="#C81E1E" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.logoutAllButton}
              activeOpacity={0.86}
              onPress={() => Alert.alert('Đăng xuất', 'Đã gửi yêu cầu đăng xuất khỏi tất cả thiết bị')}
            >
              <Ionicons name="power-outline" size={28} color="#C81E1E" />
              <Text style={styles.logoutAllText}>Đăng xuất khỏi tất cả thiết bị</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusOverlayOne} />
          <View style={styles.statusOverlayTwo} />
          <Text style={styles.statusSmall}>TRẠNG THÁI HỆ THỐNG</Text>
          <Ionicons name="lock-closed-outline" size={52} color="#90E8FF" />
          <Text style={styles.statusText}>Tài khoản của bạn an toàn</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default SecurityPasswordScreen;
