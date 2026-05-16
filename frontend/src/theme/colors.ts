export type ThemeMode = 'light' | 'dark';

export const colorsLight = {
  primary: '#3B82F6', // Cooling
  secondary: '#F97316', // Heating
  tertiary: '#EF4444', // Power/Emergency
  success: '#10B981',
  warning: '#F59E0B',
  error: '#BA1A1A',

  background: '#F8F9FF',
  surface: '#FFFFFF',
  surfaceVariant: '#D3E4FE',

  text: '#0B1C30',
  // Bị nhạt trên light mode -> làm đậm hơn để dễ đọc
  textSecondary: '#2F3642',
  textInverse: '#FFFFFF',

  // Viền/placeholder text nhạt -> làm đậm hơn
  outline: '#5B6578',
  outlineVariant: '#C2C6D6',

  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onTertiary: '#ffffff80',

  // States
  disabled: '#E0E3E5',
  overlay: 'rgba(0, 0, 0, 0.05)',
};

export const colorsDark = {
  primary: '#3B82F6',
  secondary: '#F97316',
  tertiary: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#FF6B6B',

  background: '#0B1020',
  surface: '#121A2E',
  surfaceVariant: '#1D2A45',

  text: '#EAF0FF',
  textSecondary: '#A9B5D1',
  textInverse: '#0B1020',

  outline: '#4B5875',
  outlineVariant: '#2B3855',

  onPrimary: '#0B1020',
  onSecondary: '#0B1020',
  onTertiary: '#0B1020',

  // States
  disabled: '#2A3550',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export type Colors = typeof colorsLight;

export const getColors = (mode: ThemeMode): Colors & typeof colorsDark => {
  return mode === 'dark' ? (colorsDark as any) : (colorsLight as any);
};

// default export for existing imports
export const colors = colorsLight;

export type ColorsLight = typeof colorsLight;
export type ColorsDark = typeof colorsDark;
