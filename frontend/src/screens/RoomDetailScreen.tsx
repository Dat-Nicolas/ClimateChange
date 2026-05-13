import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import Header from '../components/common/Header';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { roomService, acService } from '../services/api';

type RoomDetailRouteProp = RouteProp<RootStackParamList, 'RoomDetail'>;

const RoomDetailScreen = () => {
  const route = useRoute<RoomDetailRouteProp>();
  const { roomId, roomName } = route.params || { roomId: '', roomName: 'Room Detail' };

  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAcIndex, setSelectedAcIndex] = useState(0);

  const fetchRoomDetail = async () => {
    try {
      const data = await roomService.getRoomDetail(roomId);
      setRoom(data);
    } catch (error) {
      console.error('Fetch room detail error:', error);
      Alert.alert('Error', 'Could not load room details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomDetail();
  }, [roomId]);

  const handleControl = async (command: any) => {
    if (!room || !room.airConditioners?.[selectedAcIndex]) return;
    
    const ac = room.airConditioners[selectedAcIndex];
    try {
      const result = await acService.controlAC(ac.id, command);
      // Update local state
      const updatedAcs = [...room.airConditioners];
      updatedAcs[selectedAcIndex] = result.ac;
      setRoom({ ...room, airConditioners: updatedAcs });
    } catch (error: any) {
      Alert.alert('Control Error', error.message);
    }
  };

  const currentAc = room?.airConditioners?.[selectedAcIndex];

  const modes = [
    { id: 'COOL', icon: 'snowflake', label: 'Cool' },
    { id: 'DRY', icon: 'water-percent', label: 'Dry' },
    { id: 'FAN', icon: 'fan', label: 'Fan' },
    { id: 'AUTO', icon: 'brightness-auto', label: 'Auto' },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.container}>
        <Header title="Not Found" showBack />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Room not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={roomName} showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* AC Selector if multiple ACs */}
        {room.airConditioners?.length > 1 && (
          <View style={styles.acSelector}>
            {room.airConditioners.map((ac: any, index: number) => (
              <TouchableOpacity 
                key={ac.id}
                style={[styles.acTab, selectedAcIndex === index && styles.acTabActive]}
                onPress={() => setSelectedAcIndex(index)}
              >
                <Text style={[styles.acTabText, selectedAcIndex === index && styles.acTabTextActive]}>
                  {ac.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {currentAc ? (
          <>
            <View style={styles.dialContainer}>
              <View style={styles.dialOuter}>
                <View style={styles.dialInner}>
                  <Text style={styles.currentTempLabel}>Target</Text>
                  <Text style={styles.currentTemp}>{currentAc.currentTemp}°</Text>
                  <Text style={styles.roomTempInfo}>Room: {room.currentTemperature}°C</Text>
                </View>
              </View>
              
              <View style={styles.tempControls}>
                <TouchableOpacity 
                  style={styles.tempBtn} 
                  onPress={() => handleControl({ temperature: currentAc.currentTemp - 1 })}
                >
                  <Ionicons name="remove" size={32} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.tempBtn} 
                  onPress={() => handleControl({ temperature: currentAc.currentTemp + 1 })}
                >
                  <Ionicons name="add" size={32} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.controlsGrid}>
              <TouchableOpacity 
                style={[
                  styles.powerBtn, 
                  { backgroundColor: currentAc.status === 'ON' ? theme.colors.tertiary : theme.colors.surfaceVariant }
                ]}
                onPress={() => handleControl({ status: currentAc.status === 'ON' ? 'OFF' : 'ON' })}
              >
                <Ionicons 
                  name="power" 
                  size={32} 
                  color={currentAc.status === 'ON' ? theme.colors.onPrimary : theme.colors.textSecondary} 
                />
                <Text style={[
                  styles.powerLabel, 
                  { color: currentAc.status === 'ON' ? theme.colors.onPrimary : theme.colors.textSecondary }
                ]}>
                  {currentAc.status === 'ON' ? 'Device ON' : 'Device OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mode</Text>
              <View style={styles.modeGrid}>
                {modes.map(m => (
                  <TouchableOpacity 
                    key={m.id}
                    style={[
                      styles.modeItem, 
                      currentAc.mode === m.id && styles.modeItemActive
                    ]}
                    onPress={() => handleControl({ mode: m.id })}
                  >
                    <MaterialCommunityIcons 
                      name={m.icon as any} 
                      size={24} 
                      color={currentAc.mode === m.id ? theme.colors.onPrimary : theme.colors.textSecondary} 
                    />
                    <Text style={[
                      styles.modeLabel,
                      currentAc.mode === m.id && styles.modeLabelActive
                    ]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No AC unit in this room</Text>
          </View>
        )}

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.infoValue}>{room.currentPeople}</Text>
            <Text style={styles.infoLabel}>People</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="leaf-outline" size={24} color={theme.colors.success} />
            <Text style={styles.infoValue}>{room.autoMode ? 'Auto' : 'Manual'}</Text>
            <Text style={styles.infoLabel}>System</Text>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.bodyLg,
    color: theme.colors.textSecondary,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  acSelector: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.roundness.md,
    padding: 4,
  },
  acTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.roundness.sm,
  },
  acTabActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.level1,
  },
  acTabText: {
    ...theme.typography.labelCaps,
    color: theme.colors.textSecondary,
  },
  acTabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  dialContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dialOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: theme.colors.surfaceVariant,
    padding: 10,
    ...theme.shadows.level2,
  },
  dialInner: {
    flex: 1,
    borderRadius: 110,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentTempLabel: {
    ...theme.typography.labelCaps,
    color: theme.colors.textSecondary,
  },
  currentTemp: {
    ...theme.typography.tempDisplay,
    color: theme.colors.text,
  },
  roomTempInfo: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
  },
  tempControls: {
    flexDirection: 'row',
    marginTop: -30,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.full,
    ...theme.shadows.level1,
  },
  tempBtn: {
    padding: theme.spacing.md,
  },
  controlsGrid: {
    marginBottom: theme.spacing.xl,
  },
  powerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    ...theme.shadows.level1,
  },
  powerLabel: {
    ...theme.typography.bodyLg,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  modeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeItem: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 4,
    borderRadius: theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.level1,
  },
  modeItemActive: {
    backgroundColor: theme.colors.primary,
  },
  modeLabel: {
    ...theme.typography.bodySm,
    marginTop: 4,
    color: theme.colors.textSecondary,
  },
  modeLabelActive: {
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 4,
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    alignItems: 'center',
    ...theme.shadows.level1,
  },
  infoValue: {
    ...theme.typography.h3,
    marginTop: 4,
  },
  infoLabel: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
  },
});

export default RoomDetailScreen;
