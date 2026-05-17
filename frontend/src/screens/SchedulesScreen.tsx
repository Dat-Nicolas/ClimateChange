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
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const [rooms, setRooms] = useState<
    { id: string; name: string; location: string }[]
  >([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5); // HH:mm
  };

  // ================= STYLES =================
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

  // ================= API =================
  const fetchSchedules = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem("user_token");

      const res = await fetch(`${API_URL}/schedules`, {
        headers: {
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
    try {
      if (!form.roomId) {
        Alert.alert("Lỗi", "Vui lòng chọn phòng");
        return;
      }

      if (!form.startTime || !form.endTime) {
        Alert.alert("Lỗi", "Nhập đầy đủ thời gian");
        return;
      }
      if (form.startTime >= form.endTime) {
        Alert.alert("Lỗi", "Giờ kết thúc phải lớn hơn giờ bắt đầu");
        return;
      }

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
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");

      const saved = await res.json();

      if (editId) {
        setSchedules((prev) => prev.map((i) => (i.id === editId ? saved : i)));
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
  // ================= DELETE =================
  const deleteSchedule = (id: string) => {
    console.log("CLICK DELETE"); // debug

    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa lịch này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          console.log("CONFIRMED DELETE");

          const token = await AsyncStorage.getItem("user_token");

          await fetch(`${API_URL}/schedules/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          setSchedules((prev) => prev.filter((i) => i.id !== id));
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

  // ================= TOGGLE =================
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

  // ================= ITEM =================
  const renderItem = ({ item }: { item: Schedule }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.time}>
          {item.startTime} - {item.endTime}
        </Text>

        <Switch
          value={item.isActive}
          onValueChange={(v) => toggleActive(item, v)}
        />
      </View>

      <Text style={styles.text}>{item.dayOfWeek}</Text>
      <Text style={styles.textSmall}>Room: {item.room?.name ?? "N/A"}</Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(item)}>
          <Ionicons
            name="create-outline"
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteSchedule(item.id)}>
          <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* ================= MODAL FIXED ================= */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* OUTSIDE CLICK CLOSE */}
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            {/* INSIDE BLOCK - STOP PROPAGATION FIX */}
            <Pressable
              style={styles.modal}
              onPress={(e) => e.stopPropagation()}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "900", marginBottom: 12 }}
              >
                {editId ? "Cập nhật lịch" : "Tạo lịch"}
              </Text>
              <View style={{ marginBottom: 10 }}>
                <View>
                  <Picker
                    selectedValue={form.roomId}
                    onValueChange={(v) =>
                      setForm((prev) => ({ ...prev, roomId: v }))
                    }
                    style={styles.input}
                  >
                    <Picker.Item label=" Chọn phòng" />

                    {rooms.map((r) => (
                      <Picker.Item
                        key={r.id}
                        label={`${r.name} (${r.location})`}
                        value={r.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <Picker
                selectedValue={form.dayOfWeek}
                onValueChange={(v) => setForm((p) => ({ ...p, dayOfWeek: v }))}
                style={styles.input}
              >
                <Picker.Item label="Thứ 2" value="MONDAY" />
                <Picker.Item label="Thứ 3" value="TUESDAY" />
                <Picker.Item label="Thứ 4" value="WEDNESDAY" />
                <Picker.Item label="Thứ 5" value="THURSDAY" />
                <Picker.Item label="Thứ 6" value="FRIDAY" />
                <Picker.Item label="Thứ 7" value="SATURDAY" />
                <Picker.Item label="Chủ nhật" value="SUNDAY" />
              </Picker>

              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartPicker(true)}
              >
                <Text
                  style={{ color: form.startTime ? theme.colors.text : "#999" }}
                >
                  {form.startTime || "Chọn giờ bắt đầu"}
                </Text>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour
                  display="default"
                  onChange={(event, date) => {
                    setShowStartPicker(false);
                    if (date) {
                      setForm((prev) => ({
                        ...prev,
                        startTime: formatTime(date),
                      }));
                    }
                  }}
                />
              )}

              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndPicker(true)}
              >
                <Text
                  style={{ color: form.endTime ? theme.colors.text : "#999" }}
                >
                  {form.endTime || "Chọn giờ kết thúc"}
                </Text>
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour
                  display="default"
                  onChange={(event, date) => {
                    setShowEndPicker(false);
                    if (date) {
                      setForm((prev) => ({
                        ...prev,
                        endTime: formatTime(date),
                      }));
                    }
                  }}
                />
              )}

              <TouchableOpacity style={styles.btn} onPress={submitSchedule}>
                <Text style={styles.btnText}>
                  {editId ? "Cập nhật" : "Tạo"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ textAlign: "center", marginTop: 12 }}>Hủy</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default SchedulesScreen;
