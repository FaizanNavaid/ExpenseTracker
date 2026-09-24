// Light Theme — Cash App inspired: bright green accent on white/mint surfaces
export const lightTheme = {
  primary: '#04781f',
  secondary: '#0C3B2E',
  accent: '#00C853',

  mainBg: '#F2F7F3',
  headerTab: '#FFFFFF',
  surfaceLight: '#F5F9F6',
  darkSecondary: '#0C3B2E',

  textPrimary: '#0C2B1F',
  textSecondary: '#4A6355',
  textTertiary: '#8A9A91',
  white: '#FFFFFF',
  black: '#000000',

  gray: '#9AA69F',
  lightGray: '#E3ECE5',
  lightestGray: '#F2F7F3',
  placeholderColor: '#9AA69F',

  error: '#E63946',
  errorLight: '#FFE2E2',
  success: '#00A843',
  successLight: '#E3F7E9',
  warning: '#F57C00',
  warningLight: '#FFF3E0',
  info: '#1976D2',
  infoLight: '#E3F2FD',

  borderColor: '#DCE8DF',
  borderColorDark: '#C3D6C8',
};

// Dark Theme — same Cash App green accent, on near-black green-tinted surfaces
export const darkTheme = {
  primary: '#00D632',
  secondary: '#1A4A38',
  accent: '#00E676',

  // Each surface a step lighter than the one below for real depth
  // (mainBg -> headerTab/cards -> surfaceLight/inputs).
  mainBg: '#0B1410',
  headerTab: '#132119',
  surfaceLight: '#1A2B22',
  darkSecondary: '#1A4A38',

  textPrimary: '#F0F5F1',
  textSecondary: '#A9BBB0',
  textTertiary: '#7C8D82',
  // Kept a real white (not inverted) — used app-wide as icon/text color on
  // top of `primary`-colored badges/buttons, which needs contrast in both
  // themes, not a theme-flipped dark tone.
  white: '#FFFFFF',
  black: '#FFFFFF',

  gray: '#8FA096',
  lightGray: '#26362C',
  lightestGray: '#324338',
  placeholderColor: '#8A9A90',

  error: '#FF6B6B',
  errorLight: '#3A1418',
  success: '#00E676',
  successLight: '#173B22',
  warning: '#FFB74D',
  warningLight: '#3D2A14',
  info: '#6FB4F5',
  infoLight: '#14283D',

  borderColor: '#26362C',
  borderColorDark: '#3A4D40',
};

export type ThemeType = typeof lightTheme;
