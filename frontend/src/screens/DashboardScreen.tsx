import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import Header from '../components/common/Header';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { roomService } from '../services/api';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Fetch rooms error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const renderRoomItem = ({ item }: { item: any }) => {
    // Calculate if any AC is ON in this room
    const isAnyOn = item.airConditioners?.some((ac: any) => ac.status === 'ON');
    
    return (
      <TouchableOpacity 
        style={styles.roomCard}
        onPress={() => navigation.navigate('RoomDetail', { roomId: item.id, roomName: item.name })}
      >
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.acCount}>
            {item.airConditioners?.length || 0} Device{(item.airConditioners?.length || 0) > 1 ? 's' : ''}
          </Text>
        </View>
        
        <View style={styles.statusInfo}>
          <View style={[styles.statusBadge, { backgroundColor: isAnyOn ? theme.colors.primary : theme.colors.disabled }]}>
            <Text style={styles.statusText}>{isAnyOn ? 'ON' : 'OFF'}</Text>
          </View>
          <Text style={styles.roomTemp}>{item.currentTemperature}°C</Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={theme.colors.outline} />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Dashboard" 
        rightElement={
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('ActivityLog')} style={styles.headerIcon}>
              <Ionicons name="list-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerIcon}>
              <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Rooms</Text>
          <Text style={styles.summaryValue}>{rooms.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Active ACs</Text>
          <Text style={styles.summaryValue}>
            {rooms.reduce((acc, r) => acc + (r.airConditioners?.filter((ac: any) => ac.status === 'ON').length || 0), 0)}
          </Text>
        </View>
      </View>

      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Rooms</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rooms found</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Schedules')}
      >
        <Ionicons name="calendar" size={24} color={theme.colors.onPrimary} />
      </TouchableOpacity>
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
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: theme.spacing.md,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.roundness.lg,
    ...theme.shadows.level1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: theme.colors.outlineVariant,
    marginHorizontal: theme.spacing.md,
  },
  summaryLabel: {
    ...theme.typography.labelCaps,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.level1,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    ...theme.typography.bodyLg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  acCount: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusInfo: {
    alignItems: 'flex-end',
    marginRight: theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    ...theme.typography.labelCaps,
    fontSize: 10,
    color: theme.colors.onPrimary,
  },
  roomTemp: {
    ...theme.typography.bodyMd,
    fontWeight: '700',
    color: theme.colors.text,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.level2,
  },
});

export default DashboardScreen;
