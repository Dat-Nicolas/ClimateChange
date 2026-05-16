import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { roomService, acService } from "../services/api";
import { useTheme } from "../theme/ThemeProvider";

type NavigationProp = StackNavigationProp<RootStackParamList, "RoomDetail">;
type RoomDetailRouteProp = RouteProp<RootStackParamList, "RoomDetail">;

type AcItem = {
  id: string;
  name: string;
  status: "ON" | "OFF";
  currentTemp: number;
  mode: "COOL" | "DRY" | "FAN" | "AUTO" | "HEAT";
};

type RoomDetailData = {
  id: string;
  name: string;
  location?: string;
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
    {
      id: `${roomId}-ac-1`,
      name: "AC #1",
      status: "ON",
      currentTemp: 22,
      mode: "COOL",
    },
    {
      id: `${roomId}-ac-2`,
      name: "AC #2",
      status: "ON",
      currentTemp: 22,
      mode: "COOL",
    },
    {
      id: `${roomId}-ac-3`,
      name: "AC #3",
      status: "OFF",
      currentTemp: 25,
      mode: "AUTO",
    },
    {
      id: `${roomId}-ac-4`,
      name: "AC #4",
      status: "OFF",
      currentTemp: 25,
      mode: "AUTO",
    },
    {
      id: `${roomId}-ac-5`,
      name: "AC #5",
      status: "OFF",
      currentTemp: 25,
      mode: "AUTO",
    },
  ],
});

const RoomDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoomDetailRouteProp>();

  const { roomId, roomName, userId } = route.params || {
    roomId: "",
    roomName: "A401",
    userId: "",
  };

  const { theme, themeMode } = useTheme();

  const [room, setRoom] = useState<RoomDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAcIndex, setSelectedAcIndex] = useState(0);

  const currentAc = room?.airConditioners?.[selectedAcIndex] ?? null;

  const activeAcCount = useMemo(
    () => room?.airConditioners.filter((ac) => ac.status === "ON").length ?? 0,
    [room],
  );

  // ✅ mỗi 10 người = 1 AC
  const requiredAcCount = useMemo(() => {
    if (!room) return 0;
    return Math.max(1, Math.ceil(room.currentPeople / 10));
  }, [room]);

  // ✅ auto bật/tắt theo số người
  useEffect(() => {
    if (!room) return;

    const updated = room.airConditioners.map((ac, index) => ({
      ...ac,
      status: index < requiredAcCount ? "ON" : "OFF",
    }));

    setRoom((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        airConditioners: prev.airConditioners.map((ac) => ({
          ...ac,
          status: ac.status === "ON" ? "OFF" : "ON",
        })),
      };
    });
  }, [room?.currentPeople]);

  const styles = useMemo(() => {
    const isDark = themeMode === "dark";

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
        justifyContent: "center",
        alignItems: "center",
      },

      topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 10,
      },

      topTitle: {
        flex: 1,
        textAlign: "left",
        fontSize: 18,
        fontWeight: "700",
        color: theme.colors.text,
        marginLeft: 6,
      },

      iconBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
      },

      avatarBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.surfaceVariant,
      },

      rightActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      },

      scrollContent: {
        paddingHorizontal: 10,
        paddingBottom: 30,
      },

      sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: theme.colors.text,
        marginBottom: 10,
      },

      cameraCard: {
        height: 210,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: isDark ? "#27303A" : "#415161",
        marginBottom: 10,
        overflow: "hidden",
        justifyContent: "space-between",
        padding: 12,
      },

      recBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(0,0,0,0.4)",
        alignSelf: "flex-start",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
      },

      recDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "red",
      },

      recText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
      },

      timeText: {
        position: "absolute",
        top: 10,
        right: 10,
        fontSize: 10,
        color: "#fff",
      },

      playButton: {
        width: 55,
        height: 55,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
      },

      cameraFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
      },

      cameraMeta: {
        color: "#fff",
        fontSize: 10,
      },

      metricsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
      },

      metricCard: {
        flex: 1,
        backgroundColor: cardBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: border,
        padding: 12,
      },

      metricHead: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
      },

      metricTitle: {
        fontSize: 10,
        color: mutedText,
        fontWeight: "700",
      },

      metricValue: {
        fontSize: 24,
        fontWeight: "700",
        color: theme.colors.text,
        marginTop: 8,
      },

      metricSub: {
        fontSize: 10,
        color: mutedText,
        marginTop: 4,
      },

      controlCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        padding: 14,
        marginBottom: 10,
      },

      controlHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
      },

      controlTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: theme.colors.text,
      },

      controlSubtitle: {
        fontSize: 10,
        color: mutedText,
        marginTop: 4,
      },

      statusChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        backgroundColor: "#DDF8E7",
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
        fontWeight: "700",
      },

      ringWrap: {
        alignItems: "center",
        marginVertical: 18,
      },

      ringOuter: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 8,
        borderColor: theme.colors.success,
        justifyContent: "center",
        alignItems: "center",
      },

      ringInner: {
        width: 126,
        height: 126,
        borderRadius: 63,
        backgroundColor: cardBg,
        justifyContent: "center",
        alignItems: "center",
      },

      ringTemp: {
        fontSize: 34,
        fontWeight: "700",
        color: theme.colors.text,
      },

      ringTempUnit: {
        fontSize: 14,
        color: mutedText,
      },

      adjustBtn: {
        position: "absolute",
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: border,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10, 
        elevation: 10, 
      },

      adjustTop: {
        top: -5,
      },

      adjustBottom: {
        bottom: -5,
      },

      acSummaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
      },

      acSummaryLabel: {
        fontSize: 12,
        color: mutedText,
      },

      acSummaryValue: {
        fontSize: 13,
        fontWeight: "700",
        color: theme.colors.success,
      },

      acPillRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
      },

      acPill: {
        width: 52,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: border,
      },

      acPillRunning: {
        backgroundColor: "#67E8A5",
      },

      acPillStopped: {
        backgroundColor: isDark ? "#2B3440" : "#E5EBF4",
      },

      acPillSelected: {
        borderColor: theme.colors.success,
        borderWidth: 2,
      },

      autoCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        padding: 14,
      },

      autoTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: theme.colors.text,
        marginBottom: 12,
      },

      ruleRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: border,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
      },

      ruleBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EAF2FC",
        marginRight: 10,
      },

      ruleBadgeText: {
        fontSize: 10,
        fontWeight: "700",
      },

      ruleInfo: {
        flex: 1,
      },

      ruleMain: {
        fontSize: 12,
        fontWeight: "700",
        color: theme.colors.text,
      },

      ruleSub: {
        fontSize: 10,
        color: mutedText,
        marginTop: 2,
      },
    });
  }, [theme, themeMode]);

  const fetchRoomDetail = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const data = await roomService.getRoomDetail(roomId, roomName, userId);

      if (!data) {
        throw new Error("Không có dữ liệu phòng");
      }

      const mapped: RoomDetailData = {
        id: data?.id ?? roomId,
        name: data?.name ?? roomName,
        currentTemperature: Number(data?.currentTemperature ?? 24),
        currentPeople: Number(data?.currentPeople ?? 0),
        autoMode: Boolean(data?.autoMode ?? true),
        airConditioners: Array.isArray(data?.airConditioners)
          ? data.airConditioners
          : fallbackRoom(roomId, roomName).airConditioners,
      };

      setRoom(mapped);
    } catch (error: any) {
      console.error(error);
      setError(error?.message || "Không thể tải dữ liệu");
      setRoom(fallbackRoom(roomId, roomName));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomDetail();
    }
  }, [roomId]);

  const handleControl = async (
    command: Partial<{
      status: "ON" | "OFF";
      mode: AcItem["mode"];
      temperature: number;
    }>,
  ) => {
    if (!room || !currentAc) return;

    try {
      await acService.controlAC(currentAc.id, command);

      const updated = room.airConditioners.map((ac, idx) =>
        idx === selectedAcIndex
          ? {
              ...ac,
              status: command.status ?? ac.status,
              mode: command.mode ?? ac.mode,
              currentTemp:
                typeof command.temperature === "number"
                  ? command.temperature
                  : ac.currentTemp,
            }
          : ac,
      );

      setRoom({
        ...room,
        airConditioners: updated,
      });
    } catch (error: any) {
      Alert.alert("Thông báo", error?.message || "Không thể điều khiển AC");
    }
  };

  if (isLoading && !room) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.success} />
      </SafeAreaView>
    );
  }

  if (!room || !currentAc) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Phòng {room.name}</Text>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons
              name="notifications-outline"
              size={18}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate("SettingsStack")}
          >
            <Ionicons name="person" size={13} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Camera Trực Tiếp</Text>

        <View style={styles.cameraCard}>
          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>REC</Text>
          </View>

          <Text style={styles.timeText}>2026-05-16 10:32:45</Text>

          <View style={styles.playButton}>
            <Ionicons name="play" size={28} color="#fff" />
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

            <Text style={styles.metricValue}>
              {room.currentTemperature.toFixed(0)}°C
            </Text>

            <Text style={styles.metricSub}>Ổn định - Có xu hướng giảm</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHead}>
              <Ionicons
                name="people-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.metricTitle}>SỐ NGƯỜI</Text>
            </View>

            <Text style={styles.metricValue}>{room.currentPeople}</Text>

            <Text style={styles.metricSub}>Mức tải: Bình thường</Text>
          </View>
        </View>

        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View>
              <Text style={styles.controlTitle}>Điều Khiển Điều Hòa</Text>

              <Text style={styles.controlSubtitle}>
                Chế độ: {currentAc.mode}
              </Text>
            </View>

            <View style={styles.statusChip}>
              <View style={styles.statusDot} />
              <Text style={styles.statusChipText}>
                {currentAc.status === "ON" ? "Đang chạy" : "Đã tắt"}
              </Text>
            </View>
          </View>

          <View style={styles.ringWrap}>
            <TouchableOpacity
              style={[styles.adjustBtn, styles.adjustTop]}
              onPress={() =>
                handleControl({
                  temperature: Math.min(currentAc.currentTemp + 1, 30),
                })
              }
            >
              <Ionicons name="add" size={18} color={theme.colors.success} />
            </TouchableOpacity>

            <View style={styles.ringOuter}>
              <View style={styles.ringInner}>
                <Text style={styles.ringTemp}>{currentAc.currentTemp}</Text>

                <Text style={styles.ringTempUnit}>°C</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.adjustBtn, styles.adjustBottom]}
              onPress={() =>
                handleControl({
                  temperature: Math.max(currentAc.currentTemp - 1, 16),
                })
              }
            >
              <Ionicons name="remove" size={18} color={theme.colors.success} />
            </TouchableOpacity>
          </View>

          <View style={styles.acSummaryRow}>
            <Text style={styles.acSummaryLabel}>Dàn / AC hoạt động</Text>

            <Text style={styles.acSummaryValue}>
              {activeAcCount}/{requiredAcCount}
            </Text>
          </View>

          <View style={styles.acPillRow}>
            {room.airConditioners.map((ac, idx) => {
              const selected = idx === selectedAcIndex;
              const running = ac.status === "ON";

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
                    name={running ? "snowflake" : "fan-off"}
                    size={16}
                    color={
                      running ? theme.colors.success : theme.colors.outline
                    }
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
              <Text style={styles.ruleMain}>Mỗi 10 người</Text>

              <Text style={styles.ruleSub}>Tăng thêm 1 điều hòa</Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={18}
              color={theme.colors.success}
            />
          </View>

          <View style={styles.ruleRow}>
            <View style={styles.ruleBadge}>
              <Text style={styles.ruleBadgeText}>{requiredAcCount}</Text>
            </View>

            <View style={styles.ruleInfo}>
              <Text style={styles.ruleMain}>AC cần thiết hiện tại</Text>

              <Text style={styles.ruleSub}>Tự động tính theo số người</Text>
            </View>

            <Ionicons name="flash" size={18} color={theme.colors.success} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoomDetailScreen;
