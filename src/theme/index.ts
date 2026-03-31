export const colors = {
  background: '#0A0E1A',
  surface: '#0F1628',
  surfaceAlt: '#161D30',
  surfaceElevated: '#1A2236',
  border: '#1E2A45',
  borderLight: '#243252',

  accent: '#2D7AFE',
  accentLight: '#4D8FFE',
  accentDim: '#1A4BA0',
  accentGlow: 'rgba(45, 122, 254, 0.15)',

  text: '#FFFFFF',
  textSecondary: '#8A9BC7',
  textMuted: '#4A5878',
  textOnAccent: '#FFFFFF',

  success: '#00D68F',
  successDim: 'rgba(0, 214, 143, 0.15)',
  warning: '#FFAA00',
  warningDim: 'rgba(255, 170, 0, 0.15)',
  error: '#FF3D71',
  errorDim: 'rgba(255, 61, 113, 0.15)',
  purple: '#9B51E0',
  purpleDim: 'rgba(155, 81, 224, 0.15)',

  cardio: '#FF6B35',
  cardioDim: 'rgba(255, 107, 53, 0.15)',
  bodyweight: '#00E5FF',
  bodyweightDim: 'rgba(0, 229, 255, 0.15)',

  tabBar: '#080C18',
  statusBar: '#0A0E1A',

  mood1: '#FF3D71',
  mood2: '#FF8C42',
  mood3: '#FFAA00',
  mood4: '#7FD859',
  mood5: '#00D68F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  h4: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '500' as const, color: colors.textMuted },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary },
  button: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  buttonSmall: { fontSize: 13, fontWeight: '600' as const, color: colors.text },
  number: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  numberLarge: { fontSize: 36, fontWeight: '800' as const, color: colors.text },
};

export const shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  accent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const muscleGroupColors: Record<string, string> = {
  Chest: '#FF6B6B',
  Back: '#4ECDC4',
  Shoulders: '#FFE66D',
  Arms: '#A8E6CF',
  Biceps: '#95E1D3',
  Triceps: '#F38181',
  Legs: '#FCEABB',
  Glutes: '#F7797D',
  Core: '#764BA2',
  Cardio: '#FF6B35',
  'Full Body': '#667EEA',
};
