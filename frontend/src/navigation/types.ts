import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  ActivityLog: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;

  // stack screens (global)
  RoomDetail: { roomId: string; roomName: string; userId?: string };
  ActivityLogDetail: { id: string };
  Schedules: undefined;
  SecurityPassword: undefined;

  // auth
  Login: undefined;
  Register: undefined;
};
