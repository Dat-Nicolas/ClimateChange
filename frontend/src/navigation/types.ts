import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  ActivityLog: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;

  // stack screens (global)
  RoomDetail: { roomId: string; roomName: string };
  ActivityLogDetail: { id: string };
  Schedules: undefined;

  // auth
  Login: undefined;
  Register: undefined;
};