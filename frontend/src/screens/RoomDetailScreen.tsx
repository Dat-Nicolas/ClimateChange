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

type BrandItem = {
  id: string;
  name: string;
  irProtocol: string;
  createdAt: string;
};

type AcItem = {
  id: string;
  name: string;
  status: string;
  currentTemp: number;
  mode: string;
  brandId: string;
  roomId: string;
  brand: BrandItem;
  createdAt: string;
  updatedAt: string;
};

type ScheduleItem = {
  id: string;
  roomId: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type RoomDetailData = {
  id: string;
  name: string;
  location: string;
  currentTemperature: number;
  currentPeople: number;
  minPeopleToTurnOn: number;
  minTempToTurnOn: number;
  roomTemperature: number | null;
  peoplePerAC: number;
  autoMode: boolean;
  startTime: string;
  endTime: string;
  acAutoControlEnabled: boolean;
  userId: string;
  airConditioners: AcItem[];
  schedules: ScheduleItem[];
  createdAt: string;
  updatedAt: string;
};

const fallbackRoom = (roomId: string, roomName: string): RoomDetailData => ({
  id: roomId,
  name: roomName,
  location: "Không xác định",
  currentTemperature: 24,
  currentPeople: 12,
  minPeopleToTurnOn: 6,
  minTempToTurnOn: 25,
  roomTemperature: null,
  peoplePerAC: 10,
  autoMode: true,
  startTime: "08:00",
  endTime: "18:00",
  acAutoControlEnabled: true,
  userId: "",
  airConditioners: [
    {
      id: `${roomId}-ac-1`,
      name: "AC #1",
      status: "ON",
      currentTemp: 22,
      mode: "COOL",
      brandId: "",
      roomId: roomId,
      brand: { id: "", name: "Unknown", irProtocol: "", createdAt: "" },
      createdAt: "",
      updatedAt: "",
    },
  ],
  schedules: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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

  // ✅ Nếu số người >= minPeopleToTurnOn thì bật tất cả AC
  const requiredAcCount = useMemo(() => {
    if (!room) return 0;
    return room.currentPeople >= room.minPeopleToTurnOn
      ? room.airConditioners.length
      : 0;
  }, [
    room?.currentPeople,
    room?.minPeopleToTurnOn,
    room?.airConditioners.length,
  ]);

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
        location: data?.location ?? "Không xác định",
        currentTemperature: Number(data?.currentTemperature ?? 24),
        currentPeople: Number(data?.currentPeople ?? 0),
        minPeopleToTurnOn: Number(data?.minPeopleToTurnOn ?? 6),
        minTempToTurnOn: Number(data?.minTempToTurnOn ?? 25),
        roomTemperature: data?.roomTemperature ?? null,
        peoplePerAC: Number(data?.peoplePerAC ?? 10),
        autoMode: Boolean(data?.autoMode ?? true),
        startTime: data?.startTime ?? "08:00",
        endTime: data?.endTime ?? "18:00",
        acAutoControlEnabled: Boolean(data?.acAutoControlEnabled ?? true),
        userId: data?.userId ?? userId ?? "",
        airConditioners: Array.isArray(data?.airConditioners)
          ? data.airConditioners.map((ac: any) => ({
              id: ac.id,
              name: ac.name,
              status: ac.status,
              currentTemp: Number(ac.currentTemp),
              mode: ac.mode,
              brandId: ac.brandId,
              roomId: ac.roomId,
              brand: ac.brand ?? {
                id: "",
                name: "Unknown",
                irProtocol: "",
                createdAt: "",
              },
              createdAt: ac.createdAt,
              updatedAt: ac.updatedAt,
            }))
          : [],
        schedules: Array.isArray(data?.schedules)
          ? data.schedules.map((s: any) => ({
              id: s.id,
              roomId: s.roomId,
              startTime: s.startTime,
              endTime: s.endTime,
              isActive: Boolean(s.isActive),
              createdAt: s.createdAt,
              updatedAt: s.updatedAt,
            }))
          : [],
        createdAt: data?.createdAt ?? new Date().toISOString(),
        updatedAt: data?.updatedAt ?? new Date().toISOString(),
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
    if (!room || !room.acAutoControlEnabled) return;

    const shouldAllBeOn = room.currentPeople >= room.minPeopleToTurnOn;

    const newStatus: "ON" | "OFF" = shouldAllBeOn ? "ON" : "OFF";

    const needUpdate = room.airConditioners.some(
      (ac) => ac.status !== newStatus,
    );

    if (!needUpdate) return;

    const updateACs = async () => {
      try {
        await Promise.all(
          room.airConditioners.map((ac) =>
            acService.controlAC(ac.id, {
              status: newStatus,
              temperature: ac.currentTemp,
              mode: ac.mode,
            }),
          ),
        );

        setRoom((prev) =>
          prev
            ? {
                ...prev,
                airConditioners: prev.airConditioners.map((ac) => ({
                  ...ac,
                  status: newStatus,
                })),
              }
            : prev,
        );
      } catch (err) {
        console.error("Auto control error:", err);
      }
    };

    updateACs();
  }, [room?.currentPeople, room?.minPeopleToTurnOn]);

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
    if (!room) return;

    try {
      // Nếu điều chỉnh nhiệt độ, tập hợp tất cả AC
      const isTemperatureAdjustment = typeof command.temperature === "number";

      // ✅ Kiểm tra nếu điều chỉnh nhiệt độ cần >= ${room.minPeopleToTurnOn} người
      if (
        isTemperatureAdjustment &&
        room.currentPeople < room.minPeopleToTurnOn
      ) {
        Alert.alert(
          "Không được phép",
          `Cần ít nhất ${room.minPeopleToTurnOn} người để điều chỉnh nhiệt độ. Hiện tại có ${room.currentPeople} người.`,
        );
        return;
      }

      // Tự động bật/tắt dựa trên số người
      const shouldAllBeOn = room.currentPeople >= room.minPeopleToTurnOn;
      const autoStatus = room.acAutoControlEnabled
        ? shouldAllBeOn
          ? "ON"
          : "OFF"
        : command.status;

      // Cập nhật tất cả AC với trạng thái auto + nhiệt độ mới
      const acUpdates = room.airConditioners.map((ac) => ({
        ...ac,
        status: autoStatus,
        currentTemp: isTemperatureAdjustment
          ? command.temperature
          : ac.currentTemp,
        mode: command.mode ?? ac.mode,
      }));

      // Gửi request cập nhật cho từng AC
      await Promise.all(
        room.airConditioners.map((ac, idx) =>
          acService.controlAC(ac.id, {
            status: autoStatus,
            temperature: isTemperatureAdjustment
              ? command.temperature
              : ac.currentTemp,
            mode: command.mode ?? ac.mode,
          }),
        ),
      );

      setRoom({
        ...room,
        airConditioners: acUpdates,
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

          <Text style={styles.timeText}>
            {new Date().toLocaleString("vi-VN")}
          </Text>

          <View style={styles.playButton}>
            <Ionicons name="play" size={28} color="#fff" />
          </View>

          <View style={styles.cameraFooter}>
            <Text style={styles.cameraMeta}>CAM 01</Text>
            <Text style={styles.cameraMeta}>Phòng {room.name}</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricHead}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.metricTitle}>VỊ TRÍ</Text>
            </View>

            <Text style={styles.metricValue} numberOfLines={2}>
              {room.location}
            </Text>

            <Text style={styles.metricSub}>
              ID: {room.id.substring(0, 8)}...
            </Text>
          </View>

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
              {room.currentTemperature.toFixed(1)}°C
            </Text>

            <Text style={styles.metricSub}>
              Mục tiêu: {room.minTempToTurnOn}°C
            </Text>
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

            <Text style={styles.metricSub}>
              Tối thiểu: {room.minPeopleToTurnOn}
            </Text>
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

          <Text
            style={[styles.acSummaryLabel, { marginTop: 12, marginBottom: 8 }]}
          >
            Danh sách điều hòa ({room.airConditioners.length})
          </Text>

          <View style={styles.acPillRow}>
            {room.airConditioners.map((ac, index) => (
              <TouchableOpacity
                key={ac.id}
                style={[
                  styles.acPill,
                  ac.status === "ON"
                    ? styles.acPillRunning
                    : styles.acPillStopped,
                  selectedAcIndex === index && styles.acPillSelected,
                ]}
                onPress={() => setSelectedAcIndex(index)}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: ac.status === "ON" ? "#000" : theme.colors.text,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {ac.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.ringWrap}>
            <TouchableOpacity
              style={[
                styles.adjustBtn,
                styles.adjustTop,
                room.currentPeople < 6 && { opacity: 0.5 },
              ]}
              onPress={() =>
                handleControl({
                  temperature: Math.min(currentAc.currentTemp + 1, 30),
                })
              }
              disabled={room.currentPeople < 6}
            >
              <Ionicons
                name="add"
                size={18}
                color={room.currentPeople < 6 ? "#999" : theme.colors.success}
              />
            </TouchableOpacity>

            <View style={styles.ringOuter}>
              <View style={styles.ringInner}>
                <Text style={styles.ringTemp}>{currentAc.currentTemp}</Text>

                <Text style={styles.ringTempUnit}>°C</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.adjustBtn,
                styles.adjustBottom,
                room.currentPeople < 6 && { opacity: 0.5 },
              ]}
              onPress={() =>
                handleControl({
                  temperature: Math.max(currentAc.currentTemp - 1, 16),
                })
              }
              disabled={room.currentPeople < 6}
            >
              <Ionicons
                name="remove"
                size={18}
                color={room.currentPeople < 6 ? "#999" : theme.colors.success}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.acSummaryRow}>
            <Text style={styles.acSummaryLabel}>Thương hiệu</Text>
            <Text style={styles.acSummaryValue}>{currentAc.brand.name}</Text>
          </View>

          <View style={styles.acSummaryRow}>
            <Text style={styles.acSummaryLabel}>Giao thức IR</Text>
            <Text style={styles.acSummaryValue}>
              {currentAc.brand.irProtocol}
            </Text>
          </View>
        </View>

        <View style={styles.autoCard}>
          <Text style={styles.autoTitle}>Cài Đặt Tự Động</Text>

          <View style={styles.ruleRow}>
            <View style={styles.ruleBadge}>
              <MaterialCommunityIcons
                name="account-multiple"
                size={14}
                color={theme.colors.success}
              />
            </View>

            <View style={styles.ruleInfo}>
              <Text style={styles.ruleMain}>
                Tối thiểu {room.minPeopleToTurnOn} người
              </Text>

              <Text style={styles.ruleSub}>Bật tất cả điều hòa</Text>
            </View>

            <Ionicons
              name={
                room.acAutoControlEnabled ? "checkmark-circle" : "close-circle"
              }
              size={18}
              color={
                room.acAutoControlEnabled
                  ? theme.colors.success
                  : theme.colors.textSecondary
              }
            />
          </View>

          <View style={styles.ruleRow}>
            <View style={styles.ruleBadge}>
              <Text
                style={[styles.ruleBadgeText, { color: theme.colors.success }]}
              >
                {requiredAcCount}
              </Text>
            </View>

            <View style={styles.ruleInfo}>
              <Text style={styles.ruleMain}>AC cần thiết hiện tại</Text>

              <Text style={styles.ruleSub}>
                AC chạy: {activeAcCount}/{room.airConditioners.length}
              </Text>
            </View>

            <Ionicons name="flash" size={18} color={theme.colors.success} />
          </View>

          {room.schedules.length > 0 && (
            <View style={styles.ruleRow}>
              <View style={styles.ruleBadge}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={theme.colors.success}
                />
              </View>

              <View style={styles.ruleInfo}>
                <Text style={styles.ruleMain}>
                  {room.schedules[0].startTime} - {room.schedules[0].endTime}
                </Text>

                <Text style={styles.ruleSub}>
                  {room.schedules[0].isActive
                    ? "Lịch trình hoạt động"
                    : "Lịch trình không hoạt động"}
                </Text>
              </View>

              <Ionicons
                name={
                  room.schedules[0].isActive
                    ? "checkmark-circle"
                    : "pause-circle"
                }
                size={18}
                color={
                  room.schedules[0].isActive
                    ? theme.colors.success
                    : theme.colors.textSecondary
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoomDetailScreen;
