import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { roomService, acService } from '../services/api';
import { useTheme } from '../theme/ThemeProvider';

type NavigationProp = StackNavigationProp<RootStackParamList, 'RoomDetail'>;
type RoomDetailRouteProp = RouteProp<RootStackParamList, 'RoomDetail'>;

type AcItem = {
  id: string;
  name: string;
  status: 'ON' | 'OFF';
  currentTemp: number;
  mode: 'COOL' | 'DRY' | 'FAN' | 'AUTO' | 'HEAT';
};

type RoomDetailData = {
  id: string;
  name: string;
  currentTemperature: number;
  currentPeople: number;
  autoMode: boolean;
  airConditioners: AcItem[];
};

const fallbackRoom = (roomId: string, roomName: string): RoomDetailData => ({
  id: roomId,
  name: roomName,
  currentTemperature: 24,
  currentPeople: 12,
  autoMode: true,
  airConditioners: [
    { id: `${roomId}-ac-1`, name: 'AC #1', status: 'ON', currentTemp: 22, mode: 'COOL' },
    { id: `${roomId}-ac-2`, name: 'AC #2', status: 'ON', currentTemp: 22, mode: 'COOL' },
    { id: `${roomId}-ac-3`, name: 'AC #3', status: 'OFF', currentTemp: 25, mode: 'AUTO' },
  ],
});

const RoomDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoomDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const { roomId, roomName, userId } = route.params || { roomId: '', roomName: 'A401', userId: '' };
  const { theme, themeMode } = useTheme();

  const [room, setRoom] = useState<RoomDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [selectedAcIndex, setSelectedAcIndex] = useState(0);

  const currentAc = room?.airConditioners?.[selectedAcIndex] ?? null;

  const styles = useMemo(() => {
    const isDark = themeMode === 'dark';

    const cardBg = theme.colors.surface;
    const border = theme.colors.outlineVariant;
    const mutedText = theme.colors.textSecondary;

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },

      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },

      topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 8,
      },

      topTitle: {
        flex: 1,
        textAlign: 'left',
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.text,
        marginLeft: 4,
      },

      iconBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
      },

      avatarBtn: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceVariant,
        borderWidth: 1,
        borderColor: border,
      },

      rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
      },

      emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
      },

      emptyText: {
        fontSize: 14,
        color: mutedText,
      },

      errorText: {
        fontSize: 14,
        color: theme.colors.error,
        textAlign: 'center',
        marginTop: 8,
      },

      retryButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: theme.colors.success,
        borderRadius: 8,
      },

      retryText: {
        color: theme.colors.textInverse,
        fontWeight: '600',
      },

      scrollContent: {
        paddingHorizontal: 8,
        paddingBottom: 20,
      },

      scroll: {
        flex: 1,
      },

      sectionTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 8,
        paddingHorizontal: 2,
      },

      cameraCard: {
        height: 205,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: isDark ? theme.colors.surfaceVariant : '#415161',
        marginBottom: 8,
        overflow: 'hidden',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 8,
      },

      recBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.45)',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
      },

      recDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FB2D2D',
      },

      recText: {
        color: theme.colors.textInverse,
        fontSize: 10,
        fontWeight: '700',
      },

      timeText: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 10,
        color: isDark ? theme.colors.textSecondary : '#E8EEF6',
        fontWeight: '600',
      },

      playButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.28)',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 28,
      },

      cameraFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
      },

      cameraMeta: {
        fontSize: 10,
        color: isDark ? theme.colors.textSecondary : '#D4DFEA',
        fontWeight: '600',
      },

      metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 8,
      },

      metricCard: {
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        paddingHorizontal: 10,
        paddingVertical: 10,
      },

      metricHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
      },

      metricTitle: {
        fontSize: 10,
        letterSpacing: 0.3,
        fontWeight: '700',
        color: mutedText,
      },

      metricValue: {
        fontSize: 39,
        lineHeight: 42,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 4,
      },

      metricSub: {
        fontSize: 10,
        color: mutedText,
        fontWeight: '500',
      },

      controlCard: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 8,
      },

      controlHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      },

      controlTitle: {
        fontSize: 29,
        lineHeight: 31,
        fontWeight: '800',
        color: theme.colors.text,
      },

      controlSubtitle: {
        fontSize: 10,
        color: mutedText,
        marginTop: 2,
        fontWeight: '500',
      },

      statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: isDark ? theme.colors.surfaceVariant : '#E6FBEF',
        borderWidth: 1,
        borderColor: isDark ? border : '#ADEBC7',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
      },

      statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.success,
      },

      statusChipText: {
        fontSize: 10,
        color: theme.colors.success,
        fontWeight: '700',
      },

      ringWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 8,
      },

      ringOuter: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 8,
        borderColor: theme.colors.success,
        backgroundColor: isDark ? theme.colors.surfaceVariant : '#EAF1FA',
        alignItems: 'center',
        justifyContent: 'center',
      },

      ringInner: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: cardBg,
        alignItems: 'center',
        justifyContent: 'center',
      },

      ringTemp: {
        fontSize: 47,
        lineHeight: 47,
        color: theme.colors.text,
        fontWeight: '800',
      },

      ringTempUnit: {
        fontSize: 20,
        color: mutedText,
        fontWeight: '600',
      },

      adjustBtn: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: border,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      },

      adjustTop: {
        top: -2,
      },

      adjustBottom: {
        bottom: -2,
      },

      acSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      },

      acSummaryLabel: {
        fontSize: 12,
        color: mutedText,
        fontWeight: '600',
      },

      acSummaryValue: {
        fontSize: 13,
        color: theme.colors.success,
        fontWeight: '700',
      },

      acPillRow: {
        flexDirection: 'row',
        gap: 8,
      },

      acPill: {
        flex: 1,
        height: 30,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: border,
      },

      acPillRunning: {
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.20)' : '#66EA9E',
        borderColor: isDark ? theme.colors.success : '#4BDA89',
      },

      acPillStopped: {
        backgroundColor: isDark ? theme.colors.surfaceVariant : '#E5EBF4',
        borderColor: isDark ? theme.colors.outline : '#D1DCE8',
      },

      acPillSelected: {
        borderColor: theme.colors.success,
      },

      autoCard: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        padding: 10,
      },

      autoTitle: {
        fontSize: 27,
        lineHeight: 30,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 8,
      },

      ruleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: border,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginBottom: 8,
        backgroundColor: isDark ? theme.colors.surfaceVariant : '#F8FBFF',
      },

      ruleBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.20)' : '#EAF2FC',
        marginRight: 8,
      },

      ruleBadgeAlt: {
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.14)' : '#DEF9EA',
      },

      ruleBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.textSecondary,
      },

      ruleInfo: {
        flex: 1,
      },

      ruleMain: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.text,
      },

      ruleSub: {
        fontSize: 10,
        color: mutedText,
        marginTop: 1,
      },
    });
  }, [theme, themeMode]);

  const fetchRoomDetail = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await roomService.getRoomDetail(roomId, roomName, userId);

      if (!data) {
        throw new Error('Không có dữ liệu phòng');
      }

      const mapped: RoomDetailData = {
        id: data?.id ?? roomId,
        name: data?.name ?? roomName,
        currentTemperature: Number(data?.currentTemperature ?? (data as any)?.currentTemperatures ?? 24),
        currentPeople: Number(data?.currentPeople ?? (data as any)?.currentPeopleCount ?? 0),
        autoMode: Boolean(data?.autoMode ?? true),
        airConditioners: Array.isArray((data as any)?.airConditioners)
          ? (data as any).airConditioners.map((ac: any) => ({
              id: String(ac.id || ac._id),
              name: ac.name ?? 'AC',
              status: ac.status === 'ON' ? 'ON' : 'OFF',
              currentTemp: Number(ac.currentTemp ?? ac.temperature ?? 24),
              mode: (ac.mode ?? 'AUTO') as AcItem['mode'],
            }))
          : [],
      };

      setIsFallbackData(false);
      if (!mapped.airConditioners.length) {
        mapped.airConditioners = fallbackRoom(roomId, roomName).airConditioners;
        setIsFallbackData(true);
      }
      setRoom(mapped);
    } catch (error: any) {
      console.error('Fetch room detail error:', error);
      setError(error?.message || 'Không thể tải chi tiết phòng');
      setRoom(fallbackRoom(roomId, roomName));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomDetail();
    }
  }, [roomId, roomName, userId]);

  const handleControl = async (
    command: Partial<{ status: 'ON' | 'OFF'; mode: AcItem['mode']; temperature: number }>,
  ) => {
    if (!room || !currentAc) {
      return;
    }

    const buildLocalAc = (baseAc: AcItem): AcItem => ({
      ...baseAc,
      status: command.status ?? baseAc.status,
      mode: command.mode ?? baseAc.mode,
      currentTemp: typeof command.temperature === 'number' ? command.temperature : baseAc.currentTemp,
    });

    try {
      const result = await acService.controlAC(currentAc.id, command);
      const updatedAc: AcItem = result?.ac
        ? {
            ...currentAc,
            status: result.ac.status === 'ON' ? 'ON' : 'OFF',
            mode: (result.ac.mode ?? currentAc.mode) as AcItem['mode'],
            currentTemp: Number(result.ac.currentTemp ?? currentAc.currentTemp),
          }
        : buildLocalAc(currentAc);

      const cloned = [...room.airConditioners];
      cloned[selectedAcIndex] = updatedAc;
      setRoom({ ...room, airConditioners: cloned });
    } catch (error: any) {
      const cloned = [...room.airConditioners];
      cloned[selectedAcIndex] = buildLocalAc(currentAc);
      setRoom({ ...room, airConditioners: cloned });
      Alert.alert(
        'Thông báo',
        error?.message || 'Không thể gửi lệnh tới thiết bị, đã cập nhật tạm UI',
      );
    }
  };

  const activeAcCount = useMemo(
    () => room?.airConditioners.filter((ac) => ac.status === 'ON').length ?? 0,
    [room],
  );

  if (isLoading && !room) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Phòng {roomName}</Text>
          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={16} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.success} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !room) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Phòng {roomName}</Text>
          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={16} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.emptyWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchRoomDetail()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!room || !currentAc) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Phòng {roomName}</Text>
          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={16} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Đang tải chi tiết phòng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Phòng {room.name}</Text>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={16} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('SettingsStack')}
          >
            <Ionicons name="person" size={12} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Camera Trực Tiếp</Text>

        <View style={styles.cameraCard}>
          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>REC</Text>
          </View>

          <Text style={styles.timeText}>2024-05-15 10:32:45</Text>

          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color={theme.colors.textInverse} />
          </View>

          <View style={styles.cameraFooter}>
            <Text style={styles.cameraMeta}>CAM 01</Text>
            <Text style={styles.cameraMeta}>14 MB/s</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricHead}>
              <MaterialCommunityIcons
                name="thermometer-lines"
                size={14}
                color={theme.colors.success}
              />
              <Text style={styles.metricTitle}>NHIỆT ĐỘ</Text>
            </View>
            <Text style={styles.metricValue}>{room.currentTemperature.toFixed(0)}°C</Text>
            <Text style={styles.metricSub}>Ổn định - Có xu hướng giảm</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHead}>
              <Ionicons name="people-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metricTitle}>SỐ NGƯỜI</Text>
            </View>
            <Text style={styles.metricValue}>{room.currentPeople} người</Text>
            <Text style={styles.metricSub}>Mức tải: Bình thường</Text>
          </View>
        </View>

        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View>
              <Text style={styles.controlTitle}>Điều Khiển Điều Hòa</Text>
              <Text style={styles.controlSubtitle}>Chế độ: Làm mát tự động</Text>
            </View>

            <View style={styles.statusChip}>
              <View style={styles.statusDot} />
              <Text style={styles.statusChipText}>Đang chạy</Text>
            </View>
          </View>

          <View style={styles.ringWrap}>
            <TouchableOpacity
              style={[styles.adjustBtn, styles.adjustTop]}
              onPress={() => handleControl({ temperature: Math.min(currentAc.currentTemp + 1, 30) })}
            >
              <Ionicons name="add" size={16} color={theme.colors.success} />
            </TouchableOpacity>

            <View style={styles.ringOuter}>
              <View style={styles.ringInner}>
                <Text style={styles.ringTemp}>{currentAc.currentTemp}</Text>
                <Text style={styles.ringTempUnit}>°C</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.adjustBtn, styles.adjustBottom]}
              onPress={() => handleControl({ temperature: Math.max(currentAc.currentTemp - 1, 16) })}
            >
              <Ionicons name="remove" size={16} color={theme.colors.success} />
            </TouchableOpacity>
          </View>

          <View style={styles.acSummaryRow}>
            <Text style={styles.acSummaryLabel}>Dàn / AC hoạt động</Text>
            <Text style={styles.acSummaryValue}>
              {activeAcCount}/{room.airConditioners.length}
            </Text>
          </View>

          <View style={styles.acPillRow}>
            {room.airConditioners.slice(0, 3).map((ac, idx) => {
              const selected = idx === selectedAcIndex;
              const running = ac.status === 'ON';
              return (
                <TouchableOpacity
                  key={ac.id}
                  onPress={() => setSelectedAcIndex(idx)}
                  style={[
                    styles.acPill,
                    running ? styles.acPillRunning : styles.acPillStopped,
                    selected && styles.acPillSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={running ? 'snowflake' : 'fan-off'}
                    size={13}
                    color={running ? theme.colors.success : theme.colors.outline}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.autoCard}>
          <Text style={styles.autoTitle}>Cài Đặt Tự Động</Text>

          <View style={styles.ruleRow}>
            <View style={styles.ruleBadge}>
              <Text style={styles.ruleBadgeText}>10</Text>
            </View>
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleMain}>Trên 10 người</Text>
              <Text style={styles.ruleSub}>Kích hoạt làm lạnh</Text>
            </View>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
          </View>

          <View style={styles.ruleRow}>
            <View style={[styles.ruleBadge, styles.ruleBadgeAlt]}>
              <Text style={styles.ruleBadgeText}>20</Text>
            </View>
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleMain}>Trên 20 người</Text>
              <Text style={styles.ruleSub}>Giảm thêm 1°C</Text>
            </View>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoomDetailScreen;
