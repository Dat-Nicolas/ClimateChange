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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
  const [isAdjustingTemp, setIsAdjustingTemp] = useState(false);
  const [showMinPeopleSheet, setShowMinPeopleSheet] = useState(false);
  const [newMinPeople, setNewMinPeople] = useState<string>("6");
  const [isUpdatingMinPeople, setIsUpdatingMinPeople] = useState(false);

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
        gap: 8,
        justifyContent: "space-between",
        alignItems: "center",
      },

      acListAndPowerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        marginTop: 4,
      },

      acListColumn: {
        flex: 1,
        flexDirection: "row",
      },

      powerColumn: {
        width: 110,
        alignItems: "flex-end",
        paddingTop: 4,
      },

      cpntrolonoff: {
        flexDirection: "row",
        justifyContent: "space-between",
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

      sourceControlCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        padding: 14,
        marginTop: 12,
        marginBottom: 10,
      },

      sourceControlRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      },

      sourceControlTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: theme.colors.text,
      },

      sourceControlSubtitle: {
        fontSize: 10,
        color: mutedText,
        marginTop: 4,
      },

      sourceBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: theme.colors.surfaceVariant,
      },

      sourceBtnOn: {
        borderColor: theme.colors.success,
      },

      sourceBtnText: {
        fontSize: 12,
        fontWeight: "800",
        color: theme.colors.text,
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

      const data = await roomService.getRoomDetail(roomId);

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
      setRoom(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!room || !room.acAutoControlEnabled) return;

    const shouldAllBeOn = room.currentPeople >= room.minPeopleToTurnOn;
    console.log("Current People:", room.currentPeople);
    console.log("Min People to Turn On:", room.minPeopleToTurnOn);
    console.log("Should All Be On:", shouldAllBeOn);

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
      const isTurningPower = command.status === "ON" || command.status === "OFF";

      // Nếu đang auto, nút nguồn sẽ bị ghi đè -> yêu cầu tắt auto trước
      if (isTurningPower && room.acAutoControlEnabled) {
        Alert.alert(
          "Tắt chế độ tự động",
          "Đang bật Auto Control. Hãy tắt chế độ tự động để điều khiển nguồn (bật/tắt).",
        );
        return;
      }

      setIsAdjustingTemp(true);

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
        setIsAdjustingTemp(false);
        return;
      }

      // Tự động bật/tắt dựa trên số người
      const shouldAllBeOn = room.currentPeople >= room.minPeopleToTurnOn;

      const autoStatus: "ON" | "OFF" = (() => {
        if (room.acAutoControlEnabled) return shouldAllBeOn ? "ON" : "OFF";

        const statusFromCommand = command.status;
        if (statusFromCommand === "ON" || statusFromCommand === "OFF") {
          return statusFromCommand;
        }

        const statusFromRoom = room.airConditioners[0]?.status;
        if (statusFromRoom === "ON" || statusFromRoom === "OFF") {
          return statusFromRoom;
        }

        return shouldAllBeOn ? "ON" : "OFF";
      })();

      // Cập nhật tất cả AC với trạng thái auto + nhiệt độ mới
      const acUpdates = room.airConditioners.map((ac) => ({
        ...ac,
        status: autoStatus,
        currentTemp: isTemperatureAdjustment
          ? (command.temperature as number)
          : ac.currentTemp,
        mode: command.mode ?? ac.mode,
      }));

      // Gửi request cập nhật cho từng AC
      await Promise.all(
        room.airConditioners.map((ac) =>
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
    } finally {
      setIsAdjustingTemp(false);
    }
  };

  const handleUpdateMinPeople = async () => {
    if (!room) return;

    const minPeopleNum = parseInt(newMinPeople, 10);

    if (isNaN(minPeopleNum) || minPeopleNum < 1) {
      Alert.alert("Lỗi", "Vui lòng nhập số người hợp lệ (≥ 1)");
      return;
    }

    try {
      setIsUpdatingMinPeople(true);

      await roomService.updateRoom(room.id, {
        minPeopleToTurnOn: minPeopleNum,
      });

      setRoom({
        ...room,
        minPeopleToTurnOn: minPeopleNum,
      });

      Alert.alert("Thành công", "Cập nhật số người tối thiểu thành công");
      setShowMinPeopleSheet(false);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể cập nhật");
    } finally {
      setIsUpdatingMinPeople(false);
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

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => {
              setNewMinPeople(room.minPeopleToTurnOn.toString());
              setShowMinPeopleSheet(true);
            }}
          >
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

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
                gap: 4,
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={12}
                color={theme.colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: 9,
                  color: theme.colors.textSecondary,
                  fontWeight: "600",
                }}
              >
                Chỉnh sửa
              </Text>
            </View>
          </TouchableOpacity>
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





          <View style={styles.acListAndPowerRow}>
            <View style={styles.acListColumn}>
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

            <View style={styles.powerColumn}>
              <TouchableOpacity
                style={[
                  styles.sourceBtn,
                  currentAc.status === "ON" ? styles.sourceBtnOn : undefined,
                ]}
                onPress={async () => {
                  const nextStatus: "ON" | "OFF" =
                    currentAc.status === "ON" ? "OFF" : "ON";

                  // Nếu đang auto, nút nguồn sẽ bị ghi đè -> yêu cầu tắt auto trước
                  // if (room?.acAutoControlEnabled) {
                  //   Alert.alert(
                  //     "Tắt chế độ tự động",
                  //     "Đang bật Auto Control. Hãy tắt chế độ tự động để điều khiển nguồn (bật/tắt).",
                  //   );
                  //   return;
                  // }

                  try {
                    setIsAdjustingTemp(true);

                    await Promise.all(
                      room.airConditioners.map((ac) =>
                        acService.controlAC(ac.id, {
                          status: nextStatus,
                          temperature: ac.currentTemp,
                          mode: ac.mode,
                        }),
                      ),
                    );

                    setRoom((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        airConditioners: prev.airConditioners.map((ac) => ({
                          ...ac,
                          status: nextStatus,
                        })),
                      };
                    });
                  } catch (error: any) {
                    Alert.alert(
                      "Thông báo",
                      error?.message || "Không thể điều khiển AC",
                    );
                  } finally {
                    setIsAdjustingTemp(false);
                  }
                }}
                disabled={isAdjustingTemp}
              >
                <Ionicons
                  name={currentAc.status === "ON" ? "power" : "power-outline"}
                  size={18}
                  color={
                    currentAc.status === "ON"
                      ? theme.colors.success
                      : theme.colors.textSecondary
                  }
                />
                <Text style={styles.sourceBtnText}>
                  {currentAc.status === "ON" ? "Tắt" : "Bật"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          

          <View style={styles.ringWrap}>
            <TouchableOpacity
              style={[
                styles.adjustBtn,
                styles.adjustTop,
                (isAdjustingTemp) && { opacity: 0.5 },
                currentAc.currentTemp >= 30 && { opacity: 0.5 },
              ]}
              onPress={() => {
                if (currentAc.currentTemp >= 30) return;
                handleControl({
                  temperature: Math.min(currentAc.currentTemp + 1, 30),
                });
              }}
              disabled={isAdjustingTemp || currentAc.currentTemp >= 30}
            >
              {isAdjustingTemp ? (
                <ActivityIndicator
                  size="small"
                  color={
                    room.currentPeople < 6 ? "#999" : theme.colors.success
                  }
                />
              ) : (
                <Ionicons
                  name="add"
                  size={18}
                  color={currentAc.currentTemp >= 30 || room.currentPeople < 6 ? "#999" : theme.colors.success}
                />
              )}
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
                (isAdjustingTemp) && { opacity: 0.5 },
                currentAc.currentTemp <= 17 && { opacity: 0.5 },
              ]}
              onPress={() => {
                if (currentAc.currentTemp <= 17) return;
                handleControl({
                  temperature: Math.max(currentAc.currentTemp - 1, 17),
                });
              }}
              disabled={isAdjustingTemp || currentAc.currentTemp <= 17}
            >
              {isAdjustingTemp ? (
                <ActivityIndicator
                  size="small"
                  color={
                    room.currentPeople < 6 ? "#999" : theme.colors.success
                  }
                />
              ) : (
                <Ionicons
                  name="remove"
                  size={18}
                  color={currentAc.currentTemp <= 17 || room.currentPeople < 6 ? "#999" : theme.colors.success}
                />
              )}
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

      <Modal
        visible={showMinPeopleSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMinPeopleSheet(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                paddingBottom: 30,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: theme.colors.text,
                  }}
                >
                  Cập Nhật Số Người Tối Thiểu
                </Text>

                <TouchableOpacity
                  onPress={() => setShowMinPeopleSheet(false)}
                  disabled={isUpdatingMinPeople}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  marginBottom: 16,
                }}
              >
                Nhập số người tối thiểu để tự động bật điều hòa
              </Text>

              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Tối thiểu để tự động bật
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderWidth: 1,
                    borderColor: theme.colors.outlineVariant,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    backgroundColor: theme.colors.background,
                    gap: 10,
                  }}
                >
                  {/* Minus */}
                  <TouchableOpacity
                    onPress={() => {
                      if (isUpdatingMinPeople) return;
                      const current = parseInt(newMinPeople, 10);
                      const next = Number.isNaN(current) ? 1 : Math.max(1, current - 1);
                      setNewMinPeople(next.toString());
                    }}
                    disabled={isUpdatingMinPeople}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.colors.outlineVariant,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isUpdatingMinPeople ? 0.6 : 1,
                      backgroundColor: theme.colors.surfaceVariant,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "800",
                        color: theme.colors.text,
                        lineHeight: 22,
                      }}
                    >
                      -
                    </Text>
                  </TouchableOpacity>

                  {/* Center: Icon + value */}
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Ionicons
                      name="person"
                      size={22}
                      color={theme.colors.textSecondary}
                    />
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 20,
                        fontWeight: "800",
                        color: theme.colors.text,
                      }}
                    >
                      {newMinPeople}
                    </Text>
                    <Text
                      style={{
                        marginTop: 2,
                        fontSize: 10,
                        color: theme.colors.textSecondary,
                        fontWeight: "700",
                      }}
                    >
                      người
                    </Text>
                  </View>

                  {/* Plus */}
                  <TouchableOpacity
                    onPress={() => {
                      if (isUpdatingMinPeople) return;
                      const current = parseInt(newMinPeople, 10);
                      const safeCurrent = Number.isNaN(current) ? 1 : current;
                      const next = safeCurrent + 1;
                      setNewMinPeople(next.toString());
                    }}
                    disabled={isUpdatingMinPeople}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.colors.success,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isUpdatingMinPeople ? 0.6 : 1,
                      backgroundColor: theme.colors.surfaceVariant,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "800",
                        color: theme.colors.success,
                        lineHeight: 22,
                      }}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.outlineVariant,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => setShowMinPeopleSheet(false)}
                  disabled={isUpdatingMinPeople}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Hủy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: theme.colors.success,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isUpdatingMinPeople ? 0.7 : 1,
                  }}
                  onPress={handleUpdateMinPeople}
                  disabled={isUpdatingMinPeople}
                >
                  {isUpdatingMinPeople ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      Cập Nhật
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default RoomDetailScreen;
