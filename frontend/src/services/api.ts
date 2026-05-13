import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:3000';

const api = {
  async get(endpoint: string) {
    const token = await AsyncStorage.getItem('user_token');
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  async post(endpoint: string, data: any) {
    const token = await AsyncStorage.getItem('user_token');
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  async patch(endpoint: string, data: any) {
    const token = await AsyncStorage.getItem('user_token');
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      return await response.json();
    } catch (error) {
      console.error('API PATCH Error:', error);
      throw error;
    }
  },
};

export const roomService = {
  getRooms: () => api.get('/rooms'),
  getRoomDetail: (id: string) => api.get(`/rooms/${id}`),
};

export const acService = {
  controlAC: (acId: string, data: any) => 
    api.post(`/air-conditioners/${acId}/control`, data),
};

export const logService = {
  getLogs: (roomId?: string) => api.get(`/activity-logs${roomId ? `?roomId=${roomId}` : ''}`),
};

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => AsyncStorage.removeItem('user_token'),
};

export default api;