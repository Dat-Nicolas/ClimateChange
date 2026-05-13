import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';

interface LoadingProps {
  message?: string;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message, overlay = false }) => {
  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          {message && <Text style={styles.text}>{message}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: theme.spacing.md,
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
});

export default Loading;
