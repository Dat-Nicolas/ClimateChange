import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/ThemeProvider";
import Header from "../components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

type Schedule = {
  id: string;
  roomId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  room?: {
    name: string;
    location: string;
  };
};

const API_URL = process.env.EXPO_PUBLIC_BASE_URL ?? "http://192.168.1.10:3000";

const emptyForm: Omit<Schedule, "id"> = {
  roomId: "",
  dayOfWeek: "MONDAY",
  startTime: "",
  endTime: "",
  isActive: true,
};

type FormState = Omit<Schedule, "id">;

const SchedulesScreen = () => {
  const { theme } = useTheme();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [rooms, setRooms] = useState<{ id: string; name: string; location: string }[]>([]);
  const fetchRooms = async () => {
    try {
      const token = await AsyncStorage.getItem("user_token");

      const res = await fetch(`${API_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.log(err);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        center: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        },

        list: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },

        card: {
          marginHorizontal: 12,
          marginVertical: 8,
          borderRadius: theme.roundness.md,
          backgroundColor: theme.colors.surface,
          elevation: 2,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          padding: theme.spacing.md,
        },

        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },

        time: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.text,
        },

        text: {
          marginTop: 6,
          color: theme.colors.text,
          fontWeight: "600",
        },

        textSmall: {
          marginTop: 2,
          color: theme.colors.textSecondary,
          fontSize: 12,
        },

        actions: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
          gap: 10,
        },

        modalOverlay: {
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: "center",
          paddingHorizontal: 16,
        },

        modal: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness.lg,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          padding: 16,
        },

        input: {
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          marginBottom: 10,
          padding: 12,
          borderRadius: 10,
          color: theme.colors.text,
          backgroundColor: theme.colors.background,
        },

        btn: {
          backgroundColor: theme.colors.primary,
          padding: 12,
          alignItems: "center",
          borderRadius: 10,
          marginTop: 4,
        },

        btnText: {
          color: theme.colors.surface,
          fontWeight: "800",
        },

        cancelText: {
          marginTop: 12,
          textAlign: "center",
          color: theme.colors.textSecondary,
          fontWeight: "700",
        },

        headerRightBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
      }),
    [theme],
  );

  // ================= FETCH =================
  const fetchSchedules = async () => {
    try {
      setError(null);

      const token = await AsyncStorage.getItem("user_token");

      const res = await fetch(`${API_URL}/schedules`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load schedules");
      setSchedules([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchRooms();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedules();
  }, []);

  // ================= CREATE / UPDATE =================
  const submitSchedule = async () => {
    const payload: FormState = form;

    try {
      const token = await AsyncStorage.getItem("user_token");

      const url = editId
        ? `${API_URL}/schedules/${editId}`
        : `${API_URL}/schedules`;

      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      const saved = await res.json();

      if (editId) {
        setSchedules((prev) =>
          prev.map((item) => (item.id === editId ? saved : item)),
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
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa lịch này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("user_token");

            const res = await fetch(`${API_URL}/schedules/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) throw new Error("Delete failed");

            setSchedules((prev) => prev.filter((i) => i.id !== id));
          } catch (err) {
            console.log(err);
          }
        },
      },
    ]);
  };

  // ================= EDIT =================
  const onEdit = (item: Schedule) => {
    setEditId(item.id);
    setForm({
      roomId: item.roomId,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      isActive: item.isActive,
    });
    setModalVisible(true);
  };

  // ================= TOGGLE ACTIVE =================
  const toggleActive = async (item: Schedule, val: boolean) => {
    try {
      const token = await AsyncStorage.getItem("user_token");

      await fetch(`${API_URL}/schedules/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: val }),
      });

      setSchedules((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, isActive: val } : s)),
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
          trackColor={{
            false: theme.colors.outlineVariant,
            true: theme.colors.primary,
          }}
          thumbColor={
            item.isActive ? theme.colors.surface : theme.colors.surface
          }
        />
      </View>

      <Text style={styles.text}>{item.dayOfWeek}</Text>
      <Text style={styles.textSmall}>Room: {item.room?.name ?? "N/A"}</Text>

      <Text style={styles.textSmall}>
        Vị trí: {item.room?.location ?? "N/A"}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(item)}
          accessibilityLabel="Edit schedule"
        >
          <Ionicons
            name="create-outline"
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteSchedule(item.id)}
          accessibilityLabel="Delete schedule"
        >
          <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title="Lịch"
        rightElement={
          <TouchableOpacity
            style={styles.headerRightBtn}
            onPress={() => {
              setForm(emptyForm);
              setEditId(null);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={schedules}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: "center" }}>
            {error ? (
              <Text style={{ color: theme.colors.error, fontWeight: "700" }}>
                {error}
              </Text>
            ) : null}
            <Text
              style={{
                color: theme.colors.textSecondary,
                marginTop: 8,
                fontWeight: "600",
              }}
            >
              Không có lịch
            </Text>
          </View>
        }
      />

      {/* ================= MODAL ================= */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modal}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 18,
                  fontWeight: "900",
                  marginBottom: 12,
                }}
              >
                {editId ? "Cập nhật lịch" : "Tạo lịch"}
              </Text>

              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "700",
                  marginBottom: 6,
                }}
              >
                Chọn phòng
              </Text>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.outlineVariant,
                  borderRadius: 10,
                  marginBottom: 10,
                  backgroundColor: theme.colors.surface, // 👈 quan trọng
                }}
              >
                <Picker
                  selectedValue={form.roomId}
                  onValueChange={(value) =>
                    setForm((p) => ({ ...p, roomId: value }))
                  }
                  dropdownIconColor={theme.colors.text}
                  style={{
                    color: theme.colors.text, // 👈 text dark/light
                  }}
                >
                  <Picker.Item
                    label="-- Chọn phòng --"
                    value=""
                    color={theme.colors.textSecondary}
                  />

                  {rooms.map((room) => (
                    <Picker.Item
                      key={room.id}
                      label={`${room.name} - ${room.location}`}
                      value={room.id}
                      color={theme.colors.text}
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                placeholder="Ngày trong tuần"
                placeholderTextColor={theme.colors.outline}
                value={form.dayOfWeek}
                onChangeText={(t) => setForm((p) => ({ ...p, dayOfWeek: t }))}
                style={styles.input}
              />

              <TextInput
                placeholder="Thời gian bắt đầu"
                placeholderTextColor={theme.colors.outline}
                value={form.startTime}
                onChangeText={(t) => setForm((p) => ({ ...p, startTime: t }))}
                style={styles.input}
              />

              <TextInput
                placeholder="Thời gian kết thúc"
                placeholderTextColor={theme.colors.outline}
                value={form.endTime}
                onChangeText={(t) => setForm((p) => ({ ...p, endTime: t }))}
                style={styles.input}
              />

              <TouchableOpacity style={styles.btn} onPress={submitSchedule}>
                <Text style={styles.btnText}>
                  {editId ? "Cập nhật" : "Tạo"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default SchedulesScreen;
