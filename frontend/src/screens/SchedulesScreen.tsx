import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import Header from '../components/common/Header';
import { Ionicons } from '@expo/vector-icons';

type Schedule = {
  id: string;
  roomId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const API_URL =
  process.env.EXPO_PUBLIC_BASE_URL ?? 'http://192.168.1.10:3000';

const emptyForm = {
  roomId: '',
  dayOfWeek: 'MONDAY',
  startTime: '',
  endTime: '',
  isActive: true,
};

const SchedulesScreen = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  // ================= FETCH =================
  const fetchSchedules = async () => {
    try {
      setError(null);

      const token = await AsyncStorage.getItem('user_token');

      const res = await fetch(`${API_URL}/schedules`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSchedules(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedules();
  }, []);

  // ================= CREATE / UPDATE =================
  const submitSchedule = async () => {
    try {
      const token = await AsyncStorage.getItem('user_token');

      const url = editId
        ? `${API_URL}/schedules/${editId}`
        : `${API_URL}/schedules`;

      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Save failed');

      const saved = await res.json();

      // update local state (NO reload)
      if (editId) {
        setSchedules((prev) =>
          prev.map((item) =>
            item.id === editId ? saved : item
          )
        );
      } else {
        setSchedules((prev) => [saved, ...prev]);
      }

      setModalVisible(false);
      setForm(emptyForm);
      setEditId(null);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE (WITH CONFIRM) =================
  const deleteSchedule = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('user_token');

              const res = await fetch(
                `${API_URL}/schedules/${id}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!res.ok) throw new Error('Delete failed');

              // ONLY update local state
              setSchedules((prev) =>
                prev.filter((i) => i.id !== id)
              );
            } catch (err) {
              console.log(err);
            }
          },
        },
      ]
    );
  };

  // ================= EDIT =================
  const onEdit = (item: Schedule) => {
    setEditId(item.id);
    setForm(item);
    setModalVisible(true);
  };

  // ================= TOGGLE ACTIVE =================
  const toggleActive = async (item: Schedule, val: boolean) => {
    try {
      const token = await AsyncStorage.getItem('user_token');

      await fetch(`${API_URL}/schedules/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: val }),
      });

      // local update (NO reload)
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === item.id ? { ...s, isActive: val } : s
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ================= RENDER =================
  const renderItem = ({ item }: { item: Schedule }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.time}>
          {item.startTime} - {item.endTime}
        </Text>

        <Switch
          value={item.isActive}
          onValueChange={(val) => toggleActive(item, val)}
        />
      </View>

      <Text style={styles.text}>{item.dayOfWeek}</Text>
      <Text style={styles.textSmall}>
        Room: {item.roomId.slice(0, 8)}...
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={22} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteSchedule(item.id)}>
          <Ionicons name="trash-outline" size={22} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ================= UI =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Schedules"
        rightElement={
          <TouchableOpacity
            onPress={() => {
              setForm(emptyForm);
              setEditId(null);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={28} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={schedules}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />


      {/* ================= MODAL ================= */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <TextInput
            placeholder="Room ID"
            value={form.roomId}
            onChangeText={(t) =>
              setForm({ ...form, roomId: t })
            }
            style={styles.input}
          />

          <TextInput
            placeholder="Day of week"
            value={form.dayOfWeek}
            onChangeText={(t) =>
              setForm({ ...form, dayOfWeek: t })
            }
            style={styles.input}
          />

          <TextInput
            placeholder="Start time"
            value={form.startTime}
            onChangeText={(t) =>
              setForm({ ...form, startTime: t })
            }
            style={styles.input}
          />

          <TextInput
            placeholder="End time"
            value={form.endTime}
            onChangeText={(t) =>
              setForm({ ...form, endTime: t })
            }
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={submitSchedule}
          >
            <Text style={{ color: '#fff' }}>
              {editId ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default SchedulesScreen;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    padding: 12,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  time: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  text: {
    marginTop: 4,
  },

  textSmall: {
    color: '#666',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  modal: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },

  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },

  btn: {
    backgroundColor: 'black',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
});
