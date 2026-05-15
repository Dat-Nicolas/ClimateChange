import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardScreen from "../screens/DashboardScreen";
import RoomDetailScreen from "../screens/RoomDetailScreen";
import ActivityLogScreen from "../screens/ActivityLogScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SchedulesScreen from "../screens/SchedulesScreen";
import ActivityLogDetailScreen from "../screens/ActivityLogDetailScreen";

// Import component BottomNavBar custom của bạn
import BottomNavBar, { TabKey } from "../components/common/BottomNavBar"; 

export type MainStackParamList = {
  DashboardStack: undefined;
  ActivityLogStack: undefined;
  SettingsStack: undefined;
  RoomDetail: { roomId: string; roomName: string };
  ActivityLogDetail: { id: string };
  Schedules: undefined;
};

const Tab = createBottomTabNavigator<MainStackParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Dashboard Stack
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardStack" component={DashboardScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="Schedules" component={SchedulesScreen} />
    </Stack.Navigator>
  );
}

// ActivityLog Stack
function ActivityLogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ActivityLogStack" component={ActivityLogScreen} />
      <Stack.Screen name="ActivityLogDetail" component={ActivityLogDetailScreen} />
    </Stack.Navigator>
  );
}

// Settings Stack
function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsStack" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// Main Tabs
export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => {
        // Lấy tên tab hiện tại đang active từ state của React Navigation
        const activeTab = props.state.routeNames[props.state.index] as TabKey;
        return <BottomNavBar activeTab={activeTab} navigation={props.navigation} />;
      }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="DashboardStack" component={DashboardStack} />
      <Tab.Screen name="Schedules" component={SchedulesScreen} />
      <Tab.Screen name="ActivityLogStack" component={ActivityLogStack} />
      <Tab.Screen name="SettingsStack" component={SettingsStack} />
    </Tab.Navigator>
  );
}