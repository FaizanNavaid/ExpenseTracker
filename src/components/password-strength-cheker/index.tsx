import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { useTranslation } from 'react-i18next'; 
import { useTheme } from '../../services/utils/theme/useTheme';

const { width } = Dimensions.get('window');
const scale = width / 375;

interface PasswordStrengthCheckerProps {
  password: string;
}

export default function PasswordStrengthChecker({ password }: PasswordStrengthCheckerProps) {
  const { t } = useTranslation(); 
  const theme = useTheme(); 
  const styles = getStyles(theme); 

  if (password.length === 0) return null;

  let strength = 0;
  const length = password.length;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&#^()_+=\-[\]{};:'",.<>\/\\|~`]/.test(password);

  if (length > 0) strength++;
  if (length >= 6) strength++;
  if (hasLower && hasUpper) strength++;
  if (hasNumber && hasSpecial) strength++;
  if (strength > 4) strength = 4;

  const isStrong = length >= 6 && hasLower && hasUpper && hasNumber && hasSpecial;
  const finalStrength = isStrong ? 4 : strength === 4 ? 3 : strength;

  
  const strengthLabel = () => {
    switch (finalStrength) {
      case 1: return t('password.weak');
      case 2: return t('password.normal');
      case 3: return t('password.great');
      case 4: return t('password.strong');
      default: return '';
    }
  };

  const getColor = (index: number) => {
    if (finalStrength >= index + 1) {
      switch (finalStrength) {
        case 1: return '#FB2C36';
        case 2: return '#E1712B';
        case 3: return '#0044cc';
        case 4: return theme.success; 
      }
    }
    return theme.lightGray; 
  };

  
  const suggestion = () => {
    if (!isStrong) return t('password.suggestion');
    return t('password.perfect');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {[0, 1, 2, 3].map((_, index) => (
          <View
            key={index}
            style={[styles.bar, { backgroundColor: getColor(index) }]}
          />
        ))}
      </View>
      <View style={styles.infoRow}>
        <Text
          style={[
            styles.suggestionText,
            isStrong && { color: theme.primary }, 
          ]}
        >
          {suggestion()}
        </Text>
        <Text style={[styles.strengthText, { color: getColor(finalStrength - 1) }]}>
          {strengthLabel()}
        </Text>
      </View>
    </View>
  );
}


const getStyles = (theme: any) =>
  StyleSheet.create({
    wrapper: { width: '100%' },
    container: {
      flexDirection: 'row',
      marginTop: 6 * scale,
      width: '100%',
      justifyContent: 'space-between',
    },
    bar: {
      flex: 1,
      height: 2.5 * scale,
      marginHorizontal: 2 * scale,
      borderRadius: 2 * scale,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4 * scale,
    },
    suggestionText: {
      color: theme.placeholderColor, 
      fontSize: 12 * scale,
      flex: 1,
      paddingRight: 8,
    },
    strengthText: {
      fontSize: 12 * scale,
    },
  });