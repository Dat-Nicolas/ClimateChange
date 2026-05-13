import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import Header from '../components/common/Header';
import { Ionicons } from '@expo/vector-icons';
import { logService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ActivityLogScreen = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const data = await logService.getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Fetch logs error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const renderLogItem = ({ item }: { item: any }) => (
    <View style={styles.logItem}>
      <View style={styles.logIcon}>
        <Ionicons 
          name={item.action.includes('AC') ? 'snow-outline' : 'home-outline'} 
          size={20} 
          color={theme.colors.primary} 
        />
      </View>
      <View style={styles.logContent}>
        <Text style={styles.logAction}>{item.action}</Text>
        <Text style={styles.logMeta}>
          {item.room?.name || 'Unknown Room'} • {item.user?.fullName || 'System'}
        </Text>
        <Text style={styles.logTime}>
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: vi })}
        </Text>
      </View>
    </View>
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
      <Header title="Nhật ký hoạt động" showBack />
      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
          </View>
        }
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    ...theme.typography.bodyLg,
    color: theme.colors.textSecondary,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  logItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    ...theme.typography.bodyMd,
    fontWeight: '600',
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
