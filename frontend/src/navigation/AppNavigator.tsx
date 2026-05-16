import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// 🔥 IMPORT THEME PROVIDER CỦA BẠN VÀO ĐÂY
// (Thay đổi đường dẫn đúng với cấu trúc thư mục của bạn)
import { ThemeProvider } from '../theme/ThemeProvider'; 

export type RootStackParamList = {
  Login: undefined;  
  Register: undefined;  
  DashboardStack: undefined;
  ActivityLogStack: undefined;
  SettingsStack: undefined;
  ProfileInformation: undefined;
  SecurityPassword: undefined;
  RoomDetail: { roomId: string; roomName: string; userId?: string };
  ActivityLogDetail: { id: string };
  Schedules: undefined;
};

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const logoutSub = DeviceEventEmitter.addListener('auth:logout', () => {
      setIsLoading(true);
      checkAuth();
    });

    const loginSub = DeviceEventEmitter.addListener('auth:login', () => {
      setIsLoading(true);
      checkAuth();
    });

    return () => {
      logoutSub.remove();
      loginSub.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F6FC' }}>
        <ActivityIndicator size="large" color="#0A7A3F" />
      </View>
    );
  }

  return (
    /* 🔥 BỌC THEMEPROVIDER ĐỂ TẤT CẢ COMPONENT CON (BAO GỒM BOTTOMNAVBAR) ĐỀU DÙNG ĐƯỢC */
    <ThemeProvider>
      <NavigationContainer key={isLoggedIn ? "authed" : "anon"}>
        {isLoggedIn ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default AppNavigator;
