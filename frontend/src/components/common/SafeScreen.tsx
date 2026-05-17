import React, { ReactNode } from 'react';
import { SafeAreaView, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * Default: true. If false, will not pad top/bottom (still uses SafeAreaView).
   */
  useInsets?: boolean;
};

export default function SafeScreen({
  children,
  style,
  useInsets = true,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        { flex: 1, paddingTop: useInsets ? insets.top : 0, paddingBottom: useInsets ? insets.bottom : 0 },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}
