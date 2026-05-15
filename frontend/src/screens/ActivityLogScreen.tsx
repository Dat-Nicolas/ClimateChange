import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../theme";
import Header from "../components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { logService } from "../services/api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface LogItem {
  id?: string;
  action?: string;
  room?: { name?: string };
  user?: { fullName?: string };
  timestamp?: string | Date;
}

const ActivityLogScreen = () => {
  const navigation = useNavigation<any>();

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setError(null);
      const data = await logService.getLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch logs error:", error);
      setError("Không thể tải nhật ký hoạt động");
      setLogs([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLogs();
  }, [fetchLogs]);

  const handlePress = useCallback((item: LogItem) => {
    if (!item?.id) return;

    navigation.navigate("ActivityLogDetail", {
      id: item.id,
    });
  }, [navigation]);

  const getIconName = useCallback(
    (action?: string): keyof typeof Ionicons.glyphMap => {
      return action?.includes("AC") ? "snow-outline" : "home-outline";
    },
    []
  );

  const getFormattedTime = useCallback((timestamp?: string | Date) => {
    if (!timestamp) return "N/A";
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "N/A";
    }
  }, []);

  const renderLogItem = useCallback(
    ({ item }: { item: LogItem }) => (
      <TouchableOpacity
        style={styles.logItem}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.logIcon}>
          <Ionicons
            name={getIconName(item?.action)}
            size={20}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.logContent}>
          <Text style={styles.logAction} numberOfLines={1}>
            {item?.action || "UNKNOWN_ACTION"}
          </Text>

          <Text style={styles.logMeta} numberOfLines={1}>
            {item?.room?.name || "Unknown Room"} •{" "}
            {item?.user?.fullName || "System"}
          </Text>

          <Text style={styles.logTime}>
            {getFormattedTime(item?.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [getIconName, getFormattedTime, handlePress]
  );

  const keyExtractor = useCallback((item: LogItem, index: number) => {
    return item?.id ? String(item.id) : `log-${index}`;
  }, []);

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        {error ? (
          <>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchLogs}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
        )}
      </View>
    ),
    [error, fetchLogs]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Nhật ký hoạt động"  />

      <FlatList
        data={logs}
        style={styles.list}
        renderItem={renderLogItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    ...theme.typography.bodyLg,
    color: theme.colors.textSecondary,
  },
  errorText: {
    ...theme.typography.bodyMd,
    color: theme.colors.error,
    textAlign: "center",
    marginTop: 12,
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
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 80,
  },
  list: {
    flex: 1,
  },
  logItem: {
    flexDirection: "row",
    paddingVertical: theme.spacing.md,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    ...theme.typography.bodyMd,
    fontWeight: "600",
    color: theme.colors.text,
  },
  logMeta: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  logTime: {
    ...theme.typography.bodySm,
    color: theme.colors.outline,
    marginTop: 4,
    fontSize: 11,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    marginLeft: 56,
  },
});

export default ActivityLogScreen;