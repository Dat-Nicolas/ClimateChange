import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { logService } from "../services/api";
import { useTheme } from "../theme/ThemeProvider";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "../components/common/Header";
import SafeScreen from "../components/common/SafeScreen";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { StackNavigationProp } from "@react-navigation/stack";

import { TabParamList, RootStackParamList } from "../navigation/types";

type ActivityLogDetailNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, "ActivityLogDetail">,
  BottomTabNavigationProp<TabParamList>
>;

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Dashboard">,
  StackNavigationProp<RootStackParamList>
>;

const ActivityLogDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<ActivityLogDetailNavigationProp>();
  const { id } = route.params;

  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: 12,
        },

        center: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },

        emptyText: {
          fontSize: 14,
          color: theme.colors.textSecondary,
        },

        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 14,
          marginBottom: 12,
          elevation: 2,
        },

        sectionTitle: {
          fontSize: 14,
          fontWeight: "700",
          color: theme.colors.primary,
          marginBottom: 8,
        },

        action: {
          fontSize: 18,
          fontWeight: "bold",
          color: theme.colors.text,
        },

        item: {
          fontSize: 14,
          color: theme.colors.text,
          marginBottom: 4,
        },

        subItem: {
          fontSize: 12,
          color: theme.colors.textSecondary,
        },
      }),
    [theme],
  );

  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLog = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const res: any = await logService.getLogById(id);
      setLog(res);
    } catch (err) {
      console.error("ERROR:", err);
      setLog(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, refreshing]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLog();
  }, [fetchLog]);

  const formattedTime = log?.timestamp
    ? format(new Date(log.timestamp), "HH:mm:ss dd/MM/yyyy", {
        locale: vi,
      })
    : "N/A";

  if (loading) {
    return (
      <SafeScreen style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeScreen>
    );
  }

  if (!log) {
    return (
      <SafeScreen style={styles.container}>
        <Header
          title="Chi tiết hoạt động"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <Header
        title="Chi tiết hoạt động"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hành động</Text>
          <Text style={styles.action}>{log.action}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin phòng</Text>

          <Text style={styles.item}>Tên phòng: {log.room?.name}</Text>
          <Text style={styles.item}>Vị trí: {log.room?.location}</Text>
          <Text style={styles.item}>
            Số người hiện tại: {log.room?.currentPeople}
          </Text>
          <Text style={styles.item}>
            Nhiệt độ hiện tại: {log.room?.currentTemperature}°C
          </Text>
          <Text style={styles.item}>People/AC: {log.room?.peoplePerAC}</Text>
          <Text style={styles.item}>
            Min - Max: {log.room?.minTemp}°C - {log.room?.maxTemp}°C
          </Text>
          <Text style={styles.item}>
            Auto Mode: {log.room?.autoMode ? "Bật" : "Tắt"}
          </Text>
          <Text style={styles.item}>
            Thời gian: {log.room?.startTime} - {log.room?.endTime}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Người thực hiện</Text>
          <Text style={styles.item}>{log.user?.fullName}</Text>
          <Text style={styles.subItem}>{log.user?.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thời gian</Text>
          <Text style={styles.item}>{formattedTime}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chi tiết</Text>
          <Text style={styles.item}>
            {log.details ? JSON.stringify(log.details, null, 2) : "Không có"}
          </Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ActivityLogDetailScreen;
