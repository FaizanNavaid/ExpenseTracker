import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Dimensions,
  View,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../config/redux/store/store'; // apna exact path confirm kar lena
import { useTheme } from '../../services/utils/theme/useTheme';

const { width } = Dimensions.get('window');
const scale = width / 375;

interface AppButtonProps {
  title: string | React.ReactNode;
  loadingTitle?: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  borderRadius?: number;
  rightIcon?: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  loadingTitle,
  onPress,
  loading = false,
  disabled = false,
  backgroundColor,
  textColor,
  style,
  textStyle,
  variant = 'primary',
  borderRadius = 12 * scale,
  rightIcon,
}) => {
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = useTheme();
  const styles = getStyles();

  const isDisabled = disabled || loading;

  const appliedTextColor = textColor || '#FFFFFF';

  const appliedBackgroundColor = isDisabled
    ? theme.gray
    : backgroundColor
    ? backgroundColor
    : variant === 'outline'
    ? 'transparent'
    : variant === 'secondary'
    ? theme.secondary
    : theme.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={style}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: appliedBackgroundColor, borderRadius },
          variant === 'outline' && {
            borderWidth: 1.5,
            borderColor: theme.primary,
          },
        ]}
      >
        <View style={styles.content}>
          {loading ? (
            <>
              <ActivityIndicator
                size="small"
                color={appliedTextColor}
                style={styles.loader}
              />
              <Text
                style={[styles.text, { color: appliedTextColor }, textStyle]}
              >
                {loadingTitle ||
                  (typeof title === 'string' ? title : t('common.loading'))}
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[styles.text, { color: appliedTextColor }, textStyle]}
              >
                {title}
              </Text>
              {rightIcon && (
                <View style={styles.rightIconWrapper}>{rightIcon}</View>
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: {
      height: 48 * scale,
      width: '100%',
      overflow: 'hidden',
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 16 * scale,
    },
    rightIconWrapper: {
      position: 'absolute',
      right: 16 * scale,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    loader: {
      marginRight: 8 * scale,
    },
    text: {
      fontSize: 14 * scale,
      fontWeight: '600',
      textAlign: 'center',
      includeFontPadding: false,
      textAlignVertical: 'center',
      lineHeight: Platform.OS === 'ios' ? 14 * scale * 1.2 : undefined,
    },
  });

export default AppButton;
