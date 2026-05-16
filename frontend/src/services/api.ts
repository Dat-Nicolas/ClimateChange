import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000";

const api = {
  async get(endpoint: string) {
    const token = await AsyncStorage.getItem("user_token");
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      return await response.json();
    } catch (error) {
      console.error("API GET Error:", error);
      throw error;
    }
  },

  async post(endpoint: string, data: any) {
    const token = await AsyncStorage.getItem("user_token");
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      return await response.json();
    } catch (error) {
      console.error("API POST Error:", error);
      throw error;
    }
  },

  async patch(endpoint: string, data: any) {
    const token = await AsyncStorage.getItem("user_token");
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      return await response.json();
    } catch (error) {
      console.error("API PATCH Error:", error);
      throw error;
    }
  },
};

export const roomService = {
  getRooms: () => api.get("/rooms"),
  getRoomDetail: (roomId: string, roomName?: string, userId?: string) => {
    const safeRoomName = roomName ?? "";
    const safeUserId = userId ?? "";
    const queryParts = [
      `roomId=${encodeURIComponent(roomId)}`,
      `roomName=${encodeURIComponent(safeRoomName)}`,
      `userId=${encodeURIComponent(safeUserId)}`,
    ];
    return api.get(`/rooms/${roomId}?${queryParts.join("&")}`);
  },
};

export const acService = {
  controlAC: (acId: string, data: any) =>
    api.patch(`/air-conditioners/${acId}`, data),
};

export const logService = {
  getLogs: (roomId?: string) =>
    api.get(`/activity-logs${roomId ? `?roomId=${roomId}` : ""}`),
  getLogById: (id: string) => api.get(`/activity-logs/${id}`),
};

export const authService = {
  login: (credentials: any) => api.post("/auth/login", credentials),
  register: (data: any) => api.post("/auth/register", data),
  logout: async () => {
    await AsyncStorage.multiRemove([
      "user_token",
      "user_data",
      "smart_ac_user",
    ]);
    DeviceEventEmitter.emit("auth:logout");
  },
};

export const weatherService = {
  getCurrentWeather: () => api.get("/weather"),
};

export default api;
