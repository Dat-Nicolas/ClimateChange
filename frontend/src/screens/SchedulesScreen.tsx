import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme';
import Header from '../components/common/Header';
import { Ionicons } from '@expo/vector-icons';

const schedules = [
  { id: '1', time: '07:30', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], action: 'POWER_ON', temp: 24, room: 'Living Room', active: true },
  { id: '2', time: '22:30', days: ['Everyday'], action: 'POWER_OFF', room: 'All Rooms', active: true },
  { id: '3', time: '18:00', days: ['Sat', 'Sun'], action: 'COOL_MODE', temp: 22, room: 'Master Bedroom', active: false },
];

const SchedulesScreen = () => {
  const renderScheduleItem = ({ item }: { item: typeof schedules[0] }) => (
    <View style={[styles.scheduleCard, !item.active && styles.scheduleCardInactive]}>
      <View style={styles.scheduleTimeRow}>
        <Text style={styles.timeText}>{item.time}</Text>
        <TouchableOpacity>
          <Ionicons 
            name={item.active ? "toggle" : "toggle-outline"} 
            size={36} 
            color={item.active ? theme.colors.primary : theme.colors.outline} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.scheduleInfo}>
        <Text style={styles.roomText}>{item.room}</Text>
        <Text style={styles.daysText}>{item.days.join(', ')}</Text>
      </View>
      
      <View style={styles.scheduleFooter}>
        <View style={styles.actionBadge}>
          <Text style={styles.actionText}>{item.action.replace('_', ' ')}</Text>
        </View>
        {item.temp && (
          <Text style={styles.tempText}>{item.temp}°C</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Schedules" 
        showBack
        rightElement={
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={schedules}
        renderItem={renderScheduleItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.sectionDescription}>
            Automate your home climate based on your daily routine.
          </Text>
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
  listContent: {
    padding: theme.spacing.md,
  },
  sectionDescription: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  scheduleCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.roundness.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.level1,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  scheduleCardInactive: {
    opacity: 0.6,
    borderLeftColor: theme.colors.outline,
  },
  scheduleTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  timeText: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  scheduleInfo: {
    marginBottom: theme.spacing.md,
  },
  roomText: {
    ...theme.typography.bodyLg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  daysText: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scheduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  actionBadge: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionText: {
    ...theme.typography.labelCaps,
    fontSize: 10,
    color: theme.colors.primary,
  },
  tempText: {
    ...theme.typography.bodyMd,
    fontWeight: '700',
    color: theme.colors.text,
  },
  addButton: {
    padding: 4,
  },
});

export default SchedulesScreen;
