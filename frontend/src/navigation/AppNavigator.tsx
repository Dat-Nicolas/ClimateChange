import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import ActivityLogScreen from '../screens/ActivityLogScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SchedulesScreen from '../screens/SchedulesScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  RoomDetail: { roomId: string; roomName: string };
  ActivityLog: undefined;
  Settings: undefined;
  Schedules: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F8F9FF' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
        <Stack.Screen name="ActivityLog" component={ActivityLogScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Schedules" component={SchedulesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
