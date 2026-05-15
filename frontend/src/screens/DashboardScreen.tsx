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
import { RootStackParamList } from "../navigation/AppNavigator";
import { roomService } from "../services/api";

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

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ROOMS);
  const [error, setError] = useState<string | null>(null);
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
    } catch (error) {
      console.error("Fetch rooms error:", error);
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
  }, [fetchRooms]);

  // Refresh khi focus vào màn hình
  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [fetchRooms]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = useMemo(() => {
    if (activeFilter === "FLOOR_4") {
      return rooms.filter((room) => room.name.toUpperCase().startsWith("A4"));
    }
    if (activeFilter === "FLOOR_5") {
      return rooms.filter((room) => room.name.toUpperCase().startsWith("A5"));
    }
    return rooms;
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
    return Number((averageTemp + 8).toFixed(1));
  }, [averageTemp]);

  const handleRoomPress = useCallback(
    (roomId: string, roomName: string) => {
      navigation.navigate("RoomDetail", { roomId, roomName });
    },
    [navigation],
  );

  const renderRoomItem = useCallback(
    ({ item }: { item: RoomItem }) => {
      const isCooling =
        item.airConditioners?.some((ac) => ac.status === "ON") ?? false;
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
                color={isCooling ? "#0A7A3F" : "#2A3F5A"}
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
              {item.currentTemperature.toFixed(1)}°C
            </Text>
            <View style={styles.peopleWrap}>
              <Ionicons name="people-outline" size={10} color="#4A5F7A" />
              <Text style={styles.peopleText}>{item.currentPeople}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleRoomPress],
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
                <Ionicons name="flash-outline" size={14} color="#25507A" />
              </View>
              <View>
                <Text style={styles.systemMetricTitle}>
                  Nhiệt độ ngoài trời
                </Text>
                <Text style={styles.systemMetricValue}>{outsideTemp}°C</Text>
              </View>
            </View>

            <View style={styles.systemMetric}>
              <View style={styles.systemMetricIcon}>
                <Ionicons
                  name="thermometer-outline"
                  size={14}
                  color="#25507A"
                />
              </View>
              <View>
                <Text style={styles.systemMetricTitle}>
                  Nhiệt độ trung bình
                </Text>
                <Text style={styles.systemMetricValue}>{averageTemp}°C</Text>
              </View>
            </View>
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
    [outsideTemp, averageTemp, activeFilter],
  );

  const ListEmptyComponent = useCallback(() => {
  if (isLoading || refreshing) {
    return null;
  }

  return (
    <View style={styles.emptyWrap}>
      {error ? (
        <>
          <Ionicons name="alert-circle-outline" size={48} color="#E53935" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.emptyText}>
          Không có phòng phù hợp bộ lọc
        </Text>
      )}
    </View>
  );
}, [error, fetchRooms, isLoading, refreshing]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A7A3F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <View style={styles.logoDot}>
            <Ionicons name="snow-outline" size={14} color="#0A7A3F" />
          </View>
          <Text style={styles.brandText}>ClimateControl</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.getParent()?.navigate("ActivityLogStack")}
        >
          <Ionicons name="notifications-outline" size={20} color="#1E2E45" />
        </TouchableOpacity>
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
            paddingBottom: BOTTOM_NAV_HEIGHT + 40,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0A7A3F"
            colors={["#0A7A3F"]}
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
                  <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F6FC",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#F3F6FC",
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
    borderColor: "#9BE8BF",
    backgroundColor: "#D9FBEA",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#122237",
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
    borderColor: "#CFD8E4",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  systemLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: "700",
    color: "#4C6A8E",
    marginBottom: 4,
  },
  systemValue: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: "#11263D",
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
    borderColor: "#D6DEE9",
    borderRadius: 8,
    backgroundColor: "#F3F7FD",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  systemMetricIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5EEF8",
  },
  systemMetricTitle: {
    fontSize: 10,
    color: "#405572",
    marginBottom: 2,
  },
  systemMetricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F243A",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F2237",
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#EAF0F8",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: "#63E793",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2A3C54",
  },
  filterTextActive: {
    color: "#0D6C38",
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
    borderColor: "#CDD8E4",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  roomTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomName: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "800",
    color: "#112339",
  },
  roomModeDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#C9D6E5",
    backgroundColor: "#EDF3FA",
    alignItems: "center",
    justifyContent: "center",
  },
  roomModeDotActive: {
    borderColor: "#9EE5C3",
    backgroundColor: "#D7F9E8",
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
    backgroundColor: "#50E386",
  },
  statusBadgeStandby: {
    backgroundColor: "#6E87AF",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statusTextCooling: {
    color: "#0C6B38",
  },
  statusTextStandby: {
    color: "#1B3659",
  },
  metricLabel: {
    fontSize: 11,
    color: "#63738A",
    marginBottom: 2,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  tempText: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: "#0F2339",
  },
  peopleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  peopleText: {
    fontSize: 11,
    color: "#485B73",
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
    backgroundColor: "#005064",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#003E4E",
  },
  moreBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#57667C",
  },
  errorText: {
    fontSize: 14,
    color: "#E53935",
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#0A7A3F",
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default DashboardScreen;
