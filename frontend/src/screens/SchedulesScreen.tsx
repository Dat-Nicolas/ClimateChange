import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
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

type Room = {
  id: string;
  name: string;
  location: string;
};

type Schedule = {
  id: string;
  roomId: string;
  scheduleDate: string;
  daysOfWeek?: string[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  room?: {
    name: string;
    location: string;
  };
};

// Map ngày hiển thị (T2..CN) <-> backend (MONDAY..SUNDAY)
const DAYS = [
  { label: "T2", value: "MONDAY" },
  { label: "T3", value: "TUESDAY" },
  { label: "T4", value: "WEDNESDAY" },
  { label: "T5", value: "THURSDAY" },
  { label: "T6", value: "FRIDAY" },
  { label: "T7", value: "SATURDAY" },
  { label: "CN", value: "SUNDAY" },
];

const ALL_DAYS_OF_WEEK = DAYS.map((d) => d.value);

const API_URL = process.env.EXPO_PUBLIC_BASE_URL ?? "http://192.168.1.10:3000";

const emptyForm: Omit<Schedule, "id" | "room"> = {
  roomId: "",
  scheduleDate: "",
  startTime: "",
  endTime: "",
  isActive: true,
  daysOfWeek: [],
};

type FormState = Omit<Schedule, "id" | "room">;

const SchedulesScreen = () => {
  const { theme } = useTheme();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5); // HH:mm:ss -> HH:mm
  };

  const resetFormState = () => {
    setForm(emptyForm);
    setEditId(null);
    setDaysOfWeek([]);
    setShowDatePicker(false);
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

// Khi user chọn/tắt từng ngày (mode "ngày cụ thể")
const toggleDay = (day: string) => {
  setDaysOfWeek((prev) =>
    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
  );
};

  const formatDays = (days?: string[]) => {
    if (!days || days.length === 0) return null;

    if (days.length === 7) return "Hàng ngày";

    const map: any = {
      MONDAY: "T2",
      TUESDAY: "T3",
      WEDNESDAY: "T4",
      THURSDAY: "T5",
      FRIDAY: "T6",
      SATURDAY: "T7",
      SUNDAY: "CN",
    };

    return days.map((d) => map[d]).join(", ");
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
      }),
    [theme],
  );

  // ================= API =================
  const fetchSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem("user_token");

      const res = await fetch(`${API_URL}/schedules`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      setSchedules([]);
      console.log(err);
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
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setRooms([]);
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
      // 1. ROOM
      if (!form.roomId) {
        return Alert.alert("Thiếu dữ liệu", "Vui lòng chọn phòng");
      }

      // 2. MODE (daily or specific date)
      if (daysOfWeek.length === 0 && !form.scheduleDate) {
        return Alert.alert(
          "Thiếu dữ liệu",
          "Chọn ít nhất 1 ngày hoặc 1 ngày cụ thể",
        );
      }

      // 3. TIME
      if (!form.startTime || !form.endTime) {
        return Alert.alert(
          "Thiếu dữ liệu",
          "Vui lòng chọn giờ bắt đầu và kết thúc",
        );
      }

      if (form.startTime >= form.endTime) {
        return Alert.alert(
          "Sai thời gian",
          "Giờ kết thúc phải lớn hơn giờ bắt đầu",
        );
      }

      const token = await AsyncStorage.getItem("user_token");

      const payload = {
        roomId: form.roomId,
        startTime: form.startTime,
        endTime: form.endTime,
        isActive: form.isActive,
        // Prisma yêu cầu scheduleDate luôn là string => không được gửi null
        scheduleDate:
          daysOfWeek.length > 0
            ? form.scheduleDate || formatDate(new Date())
            : form.scheduleDate || formatDate(new Date()),
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : [],
      };

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

      if (!res.ok) {
        return Alert.alert("Lỗi", "Không thể lưu lịch, thử lại sau");
      }

      const saved = await res.json();

      if (editId) {
        setSchedules((prev) => prev.map((i) => (i.id === editId ? saved : i)));
      } else {
        setSchedules((prev) => [saved, ...prev]);
      }

      setModalVisible(false);
      resetFormState();
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo lịch");
    }
  };

  // ================= DELETE =================
  const deleteSchedule = (id: string) => {
    const confirmDelete = async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");

        await fetch(`${API_URL}/schedules/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        setSchedules((prev) => prev.filter((i) => i.id !== id));
      } catch (err) {
        console.log(err);
      }
    };

    if (Platform.OS === "web") {
      const ok = window.confirm("Bạn có chắc chắn muốn xóa lịch này không?");
      if (ok) confirmDelete();
    } else {
      Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa lịch này không?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: confirmDelete },
      ]);
    }
  };

  // ================= EDIT =================
  const onEdit = (item: Schedule) => {
    setEditId(item.id);

    const incomingDays = Array.isArray(item.daysOfWeek) ? item.daysOfWeek : [];

    setDaysOfWeek(incomingDays);

    setForm({
      roomId: item.roomId,
      scheduleDate: item.scheduleDate,
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

      <Text style={styles.text}>
        {item.daysOfWeek?.length
          ? formatDays(item.daysOfWeek)
          : item.scheduleDate || "Không có ngày"}
      </Text>
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
              resetFormState();
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

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <Pressable
              style={styles.modal}
              onPress={(e) => e.stopPropagation()}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "900", marginBottom: 12 }}
              >
                {editId ? "Cập nhật lịch" : "Tạo lịch"}
              </Text>

              {/* ROOM */}
              <View style={{ marginBottom: 10 }}>
                <Picker
                  selectedValue={form.roomId}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, roomId: v }))
                  }
                  style={styles.input}
                >
                  <Picker.Item label=" Chọn phòng" value="" />
                  {rooms.map((r) => (
                    <Picker.Item
                      key={r.id}
                      label={`${r.name} (${r.location})`}
                      value={r.id}
                    />
                  ))}
                </Picker>
              </View>

{/* "Hàng ngày" <-> set đủ 7 ngày. Khi off thì chuyển sang mode "chọn ngày cụ thể". */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text style={{ flex: 1, fontWeight: "700" }}>Hàng ngày</Text>
                <Switch
                  value={daysOfWeek.length === 7}
                  onValueChange={(enabled) => {
                    setDaysOfWeek(enabled ? ALL_DAYS_OF_WEEK : []);
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                {DAYS.map((d) => {
                  const active = daysOfWeek.includes(d.value);

                  return (
                    <TouchableOpacity
                      key={d.value}
                      onPress={() => toggleDay(d.value)}
                      style={{
                        padding: 10,
                        margin: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: active ? theme.colors.primary : "#ccc",
                        backgroundColor: active
                          ? theme.colors.primary
                          : "transparent",
                      }}

                    >
                      <Text
                        style={{ color: active ? "#fff" : theme.colors.text }}
                      >
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {/* DATE */}
              {daysOfWeek.length === 0 && (
                <>
                  <Text style={{ paddingBottom: 10 }}>Hoặc chọn ngày</Text>

                  {Platform.OS === "web" ? (
                    <input
                      type="date"
                      value={form.scheduleDate}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        // Chọn ngày cụ thể => đảm bảo không còn chọn "hằng ngày"/các thứ
                        setDaysOfWeek([]);
                        setForm((prev) => ({
                          ...prev,
                          scheduleDate: nextDate,
                        }));
                      }}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: "1px solid #ccc",
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        marginBottom: 10,
                      }}
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.input}
                    onPress={() => {
                      // Chọn ngày cụ thể => đảm bảo không còn chọn các thứ
                      setDaysOfWeek([]);
                      setShowDatePicker(true);
                    }}
                    >
                      <Text>{form.scheduleDate || "Chọn ngày"}</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {Platform.OS === "web" ? (
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    marginBottom: 10,
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Text>{form.startTime || "Chọn giờ bắt đầu"}</Text>
                  </TouchableOpacity>

                  {showStartPicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      is24Hour
                      onChange={(e, d) => {
                        setShowStartPicker(false);
                        if (d) {
                          setForm((prev) => ({
                            ...prev,
                            startTime: formatTime(d),
                          }));
                        }
                      }}
                    />
                  )}
                </>
              )}

              {Platform.OS === "web" ? (
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    marginBottom: 10,
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Text>{form.endTime || "Chọn giờ kết thúc"}</Text>
                  </TouchableOpacity>

                  {showEndPicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      is24Hour
                      onChange={(e, d) => {
                        setShowEndPicker(false);
                        if (d) {
                          setForm((prev) => ({
                            ...prev,
                            endTime: formatTime(d),
                          }));
                        }
                      }}
                    />
                  )}
                </>
              )}
              <TouchableOpacity style={styles.btn} onPress={submitSchedule}>
                <Text style={styles.btnText}>
                  {editId ? "Cập nhật" : "Tạo"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetFormState();
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 12,
                    fontWeight: "700",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Hủy
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default SchedulesScreen;
