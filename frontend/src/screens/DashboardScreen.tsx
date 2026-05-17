import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  LayoutAnimation,
  Platform,
  UIManager,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../navigation/AppNavigator";
import { roomService, weatherService } from "../services/api";
import { useTheme } from "../theme/ThemeProvider";

type NavigationProp = StackNavigationProp<RootStackParamList, "DashboardStack">;

interface AcSummary {
  id: string;
  status: "ON" | "OFF";
  mode?: string;
}

interface RoomItem {
  id: string;
  name: string;
  currentTemperature: number;
  currentPeople: number;
  minPeopleToTurnOn: number;
  airConditioners?: AcSummary[];
}

type FilterKey = "ALL" | "FLOOR_4" | "FLOOR_5";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = (screenWidth - 48) / 2; // Account for padding and gap
const INITIAL_VISIBLE_ROOMS = 8;
const LOAD_MORE_STEP = 4;

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ROOMS);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null);

  const BOTTOM_NAV_HEIGHT = 70;

  // Enable LayoutAnimation cho Android
  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      const data = await weatherService.getCurrentWeather();
      const temp = data?.current?.temperature_2m ?? null;
      if (temp !== null) {
        setWeatherTemp(Number(temp));
      }
    } catch (e) {
      console.error("Fetch weather error:", e);
      setWeatherTemp(null);
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      setError(null);
      const res = await roomService.getRooms();
      const data = res?.data ?? res;

      if (Array.isArray(data) && data.length > 0) {
        const mapped: RoomItem[] = data.map((room: any) => ({
          id: String(room.id || room._id),
          name: String(room.name ?? "A000"),
          currentTemperature: Number(
            room.currentTemperature ?? room.currentTemperatures ?? 24,
          ),
          currentPeople: Number(
            room.currentPeople ?? room.currentPeopleCount ?? 0,
          ),
          minPeopleToTurnOn: Number(room.minPeopleToTurnOn ?? 6),
          airConditioners: Array.isArray(room.airConditioners)
            ? room.airConditioners.map((ac: any) => {
                const rawStatus = String(ac.status).toUpperCase();

                return {
                  id: String(ac.id || ac._id),
                  status: rawStatus === "ON" ? "ON" : "OFF",
                  mode: ac.mode,
                };
              })
            : [],
        }));
        setRooms(mapped);
      } else {
        setRooms([]);
      }
    } catch (e) {
      console.error("Fetch rooms error:", e);
      setError("Không thể tải danh sách phòng");
      setRooms([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load rooms on mount
  useEffect(() => {
    fetchRooms();
    fetchWeather();
  }, [fetchRooms, fetchWeather]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRooms();
    }, 5000); // 5s

    return () => clearInterval(interval);
  }, [fetchRooms]);

  useEffect(() => {
    let mounted = true;

    const loadUserId = async () => {
      try {
        const rawUser = await AsyncStorage.getItem("user_data");
        if (!rawUser) return;

        const parsedUser = JSON.parse(rawUser);
        const nextUserId = String(parsedUser?.id ?? parsedUser?.userId ?? "");

        if (mounted && nextUserId) {
          setUserId(nextUserId);
        }
      } catch (e) {
        console.error("Load user_data error:", e);
      }
    };

    loadUserId();

    return () => {
      mounted = false;
    };
  }, []);

  // Refresh khi focus vào màn hình
  useFocusEffect(
    useCallback(() => {
      fetchRooms();
      fetchWeather();
    }, [fetchRooms, fetchWeather]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms();
    fetchWeather();
  }, [fetchRooms, fetchWeather]);

  const filteredRooms = useMemo(() => {
    let result = rooms;

    if (activeFilter === "FLOOR_4") {
      result = rooms.filter((room) => room.name.toUpperCase().startsWith("A4"));
    } else if (activeFilter === "FLOOR_5") {
      result = rooms.filter((room) => room.name.toUpperCase().startsWith("A5"));
    }

    // 👉 SORT THEO SỐ PHÒNG
    return result.sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, "")); // A401 -> 401
      const numB = parseInt(b.name.replace(/\D/g, ""));
      return numA - numB;
    });
  }, [rooms, activeFilter]);

  const showEmpty = !isLoading && filteredRooms.length === 0;

  // Reset visible count khi đổi filter
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_ROOMS);
  }, [activeFilter]);

  // Điều chỉnh visible count nếu vượt quá
  useEffect(() => {
    setVisibleCount(Math.min(INITIAL_VISIBLE_ROOMS, filteredRooms.length));
  }, [activeFilter, filteredRooms.length]);

  const visibleRooms = useMemo(
    () => filteredRooms.slice(0, visibleCount),
    [filteredRooms, visibleCount],
  );

  const hasMoreRooms = visibleCount < filteredRooms.length;

  const handleLoadMore = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleCount((prev) =>
      Math.min(prev + LOAD_MORE_STEP, filteredRooms.length),
    );
  }, [filteredRooms.length]);

  const averageTemp = useMemo(() => {
    if (!rooms.length) return 24;
    const total = rooms.reduce((acc, room) => acc + room.currentTemperature, 0);
    return Number((total / rooms.length).toFixed(1));
  }, [rooms]);

  const outsideTemp = useMemo(() => {
    // Nếu có dữ liệu thực từ API thời tiết, sử dụng nó
    if (weatherTemp !== null) {
      return weatherTemp;
    }
    // Nếu không, tính toán từ nhiệt độ trung bình các phòng
    return Number((averageTemp + 8).toFixed(1));
  }, [weatherTemp, averageTemp]);

  const handleRoomPress = useCallback(
    async (roomId: string, roomName: string) => {
      let nextUserId = userId;

      if (!nextUserId) {
        try {
          const rawUser = await AsyncStorage.getItem("user_data");
          if (rawUser) {
            const parsedUser = JSON.parse(rawUser);
            nextUserId = String(parsedUser?.id ?? parsedUser?.userId ?? "");
            if (nextUserId) {
              setUserId(nextUserId);
            }
          }
        } catch (e) {
          console.error("Read user_data on room click error:", e);
        }
      }

      navigation.navigate("RoomDetail", {
        roomId,
        roomName,
        userId: nextUserId,
      });
    },
    [navigation, userId],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        },
        topBar: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          backgroundColor: theme.colors.background,
        },
        brandWrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        logoDot: {
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surfaceVariant,
          alignItems: "center",
          justifyContent: "center",
        },
        brandText: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.text,
        },
        bellBtn: {
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        },
        listContent: {
          paddingHorizontal: 16,
        },
        listContentDefault: {
          paddingBottom: 20,
        },
        listContentWithLoadMore: {
          paddingBottom: 140,
        },
        list: {
          flex: 1,
        },
        systemCard: {
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 16,
          ...theme.shadows.level1,
        },
        systemLabel: {
          fontSize: 10,
          letterSpacing: 0.8,
          fontWeight: "700",
          color: theme.colors.textSecondary,
          marginBottom: 4,
        },
        systemValue: {
          fontSize: 24,
          lineHeight: 30,
          fontWeight: "800",
          color: theme.colors.text,
          marginBottom: 12,
        },
        systemMetricRow: {
          flexDirection: "row",
          gap: 12,
        },
        systemMetric: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          borderRadius: 8,
          backgroundColor: theme.colors.surfaceVariant,
          paddingHorizontal: 10,
          paddingVertical: 8,
        },
        systemMetricIcon: {
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.outlineVariant,
        },
        systemMetricTitle: {
          fontSize: 10,
          color: theme.colors.textSecondary,
          marginBottom: 2,
        },
        systemMetricValue: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.text,
        },
        sectionHeader: {
          marginBottom: 12,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: "800",
          color: theme.colors.text,
          marginBottom: 10,
        },
        filterRow: {
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: 8,
        },
        filterChip: {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        },
        filterChipActive: {
          backgroundColor: "rgba(16, 185, 129, 0.22)",
          borderColor: "rgba(16, 185, 129, 0.4)",
        },
        filterText: {
          fontSize: 12,
          fontWeight: "600",
          color: theme.colors.textSecondary,
        },
        filterTextActive: {
          color: theme.colors.success,
          fontWeight: "700",
        },
        rowGap: {
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        },
        roomCard: {
          flex: 1,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 12,
          paddingVertical: 10,
          ...theme.shadows.level1,
        },
        roomTop: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        roomName: {
          fontSize: 28,
          lineHeight: 32,
          fontWeight: "800",
          color: theme.colors.text,
        },
        roomModeDot: {
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surfaceVariant,
          alignItems: "center",
          justifyContent: "center",
        },
        roomModeDotActive: {
          borderColor: "rgba(158, 229, 195, 0.7)",
          backgroundColor: "rgba(215, 249, 232, 0.12)",
        },
        statusBadge: {
          alignSelf: "flex-start",
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 3,
          marginTop: 6,
          marginBottom: 10,
        },
        statusBadgeCooling: {
          backgroundColor: "rgba(16, 185, 129, 0.26)",
        },
        statusBadgeStandby: {
          backgroundColor: "rgba(110, 135, 175, 0.25)",
        },
        statusText: {
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 0.5,
          color: theme.colors.text,
        },
        statusTextCooling: {
          color: theme.colors.success,
        },
        statusTextStandby: {
          color: theme.colors.textSecondary,
        },
        metricLabel: {
          fontSize: 11,
          color: theme.colors.textSecondary,
          marginBottom: 2,
        },
        metricRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        },
        tempText: {
          fontSize: 26,
          lineHeight: 30,
          fontWeight: "800",
          color: theme.colors.text,
        },
        peopleWrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          marginBottom: 4,
        },
        peopleText: {
          fontSize: 11,
          color: theme.colors.textSecondary,
          fontWeight: "600",
        },
        footerSpacer: {
          height: 12,
        },
        loadMoreWrap: {
          alignItems: "center",
          paddingVertical: 20,
        },
        moreBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: theme.colors.secondary,
          borderRadius: 30,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        },
        moreBtnText: {
          fontSize: 13,
          fontWeight: "700",
          color: theme.colors.onSecondary,
        },
        emptyWrap: {
          alignItems: "center",
          paddingVertical: 40,
        },
        emptyText: {
          fontSize: 14,
          color: theme.colors.textSecondary,
        },
        errorText: {
          fontSize: 14,
          color: theme.colors.error,
          marginTop: 12,
          textAlign: "center",
        },
        retryButton: {
          marginTop: 16,
          paddingHorizontal: 20,
          paddingVertical: 8,
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
        },
        retryText: {
          color: theme.colors.surface,
          fontWeight: "600",
        },
      }),
    [theme],
  );

  const ListHeaderComponent = useCallback(
    () => (
      <>
        <View style={styles.systemCard}>
          <Text style={styles.systemLabel}>TRẠNG THÁI HỆ THỐNG</Text>
          <Text style={styles.systemValue}>Hoạt động ổn định</Text>

          <View style={styles.systemMetricRow}>
            <View style={styles.systemMetric}>
              <View style={styles.systemMetricIcon}>
                <Ionicons
                  name="flash-outline"
                  size={14}
                  color={theme.colors.primary}
                />
              </View>
              <View>
                <Text style={styles.systemMetricTitle}>
                  Nhiệt độ ngoài trời
                </Text>
                <Text style={styles.systemMetricValue}>
                  {weatherTemp !== null
                    ? `${weatherTemp}°C`
                    : `${outsideTemp}°C`}
                </Text>
              </View>
            </View>

            {/* <View style={styles.systemMetric}>
              <View style={styles.systemMetricIcon}>
                <Ionicons
                  name="thermometer-outline"
                  size={14}
                  color={theme.colors.primary}
                />
              </View>
              <View>
                <Text style={styles.systemMetricTitle}>
                  Nhiệt độ trung bình
                </Text>
                <Text style={styles.systemMetricValue}>
                  {averageTemp}°C
                </Text>
              </View>
            </View> */}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh sách phòng học</Text>
          <View style={styles.filterRow}>
            {(["ALL", "FLOOR_4", "FLOOR_5"] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  activeFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter === "ALL"
                    ? "Tất cả"
                    : filter === "FLOOR_4"
                      ? "Tầng 4"
                      : "Tầng 5"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </>
    ),
    [
      styles,
      outsideTemp,
      averageTemp,
      activeFilter,
      theme.colors.primary,
      weatherTemp,
    ],
  );

  const ListEmptyComponent = useCallback(() => {
    if (isLoading || refreshing) return null;

    return (
      <View style={styles.emptyWrap}>
        {error ? (
          <>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.emptyText}>Không có phòng phù hợp bộ lọc</Text>
        )}
      </View>
    );
  }, [error, fetchRooms, isLoading, refreshing, styles, theme.colors.error]);

  const renderRoomItem = useCallback(
    ({ item }: { item: RoomItem }) => {
      const isCooling = item.currentPeople >= item.minPeopleToTurnOn;

      const statusLabel = isCooling ? "COOLING" : "STANDBY";

      return (
        <TouchableOpacity
          style={[styles.roomCard, { width: CARD_WIDTH }]}
          activeOpacity={0.9}
          onPress={() => handleRoomPress(item.id, item.name)}
        >
          <View style={styles.roomTop}>
            <Text style={styles.roomName}>{item.name}</Text>
            <View
              style={[
                styles.roomModeDot,
                isCooling && styles.roomModeDotActive,
              ]}
            >
              <MaterialCommunityIcons
                name={isCooling ? "snowflake" : "fan"}
                size={12}
                color={
                  isCooling ? theme.colors.success : theme.colors.textSecondary
                }
              />
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              isCooling ? styles.statusBadgeCooling : styles.statusBadgeStandby,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCooling ? styles.statusTextCooling : styles.statusTextStandby,
              ]}
            >
              {statusLabel}
            </Text>
          </View>

          <Text style={styles.metricLabel}>Hiện tại</Text>
          <View style={styles.metricRow}>
            <Text style={styles.tempText}>
              {item.currentTemperature.toFixed(0)}°C
            </Text>
            <View style={styles.peopleWrap}>
              <Ionicons
                name="people-outline"
                size={10}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.peopleText}>{item.currentPeople}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleRoomPress, styles, theme.colors.success, theme.colors.textSecondary],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <View style={styles.logoDot}>
            <Ionicons
              name="snow-outline"
              size={14}
              color={theme.colors.success}
            />
          </View>
          <Text style={styles.brandText}>ClimateControl</Text>
        </View>
      </View>

      <FlatList
        data={visibleRooms}
        keyExtractor={(item) => item.id}
        style={styles.list}
        numColumns={2}
        renderItem={renderRoomItem}
        columnWrapperStyle={styles.rowGap}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: BOTTOM_NAV_HEIGHT + 40 + insets.bottom,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.success}
            colors={[theme.colors.success]}
          />
        }
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={
          <>
            <View style={styles.footerSpacer} />
            {hasMoreRooms && (
              <View style={styles.loadMoreWrap}>
                <TouchableOpacity
                  style={styles.moreBtn}
                  activeOpacity={0.85}
                  onPress={handleLoadMore}
                >
                  <Text style={styles.moreBtnText}>Xem thêm</Text>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={theme.colors.onSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        ListEmptyComponent={showEmpty ? ListEmptyComponent : null}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;
function useAuth() {
  throw new Error("Function not implemented.");
}
