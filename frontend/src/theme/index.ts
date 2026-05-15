import { getColors, type ThemeMode } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const getTheme = (mode: ThemeMode) => {
  const colors = getColors(mode);

  return {
    colors,
    spacing,
    typography,
    roundness: {
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
      full: 9999,
    },
    shadows: {
      level1: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: mode === 'dark' ? 0.18 : 0.05,
        shadowRadius: 20,
        elevation: 2,
      },
      level2: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: mode === 'dark' ? 0.25 : 0.08,
        shadowRadius: 30,
        elevation: 5,
      },
    },
  };
};

export type Theme = ReturnType<typeof getTheme>;

export const theme = getTheme('light');

// re-export tokens/types for existing imports
export * from './colors';
export * from './spacing';
export * from './typography';
export { ThemeProvider, useTheme } from './ThemeProvider';
