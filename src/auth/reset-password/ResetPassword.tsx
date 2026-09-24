import { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ErrorModel, ResetPassModel } from '../../services/interface';
import { useTheme } from '../../services/utils/theme/useTheme';
import { ResetPasswordValidationErrors } from '../../models/validations/AuthValidationErrors';
import { isValidPassword } from '../../services/helper/helper';
import ApiService from '../../services/api/HttpHelper';
import { ENDPOINT } from '../../services/api/EndPoint';
import { SCREENS } from '../../config/navigation/screen-names/ScreenName';
import { parseApiError } from '../../services/utils/errors/errorHandler';
import InputField from '../../components/input-field';
import AppIcon from '../../assets/icon';
import { AppIcons } from '../../services/helper/iconName';
import AppButton from '../../components/buttons';
import { ShowIcon } from '../../assets/icon/svg-icon';
import PasswordStrengthChecker from '../../components/password-strength-cheker';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;

export default function ResetPassword() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const netInfo = useNetInfo();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const email: string = route.params?.email || '';

  const [model, setModel] = useState<ResetPassModel>({
    otp: route.params?.otp || '',
    new_password: '',
    new_confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorModel>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (key: keyof ResetPassModel, value: string) => {
    setModel(prev => ({ ...prev, [key]: value }));

    const errorKey = key === 'new_password' ? 'password' : 'confirm_password';
    if (error[errorKey]) {
      setError(prev => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }
  };

  const validate = (): boolean => {
    const err: ErrorModel = {};

    if (!model.new_password.trim()) {
      err.password = ResetPasswordValidationErrors.passwordRequired();
    } else if (!isValidPassword(model.new_password)) {
      err.password = ResetPasswordValidationErrors.passwordMinLength();
    }

    if (!model.new_confirm_password.trim()) {
      err.confirm_password =
        ResetPasswordValidationErrors.confirmPasswordRequired();
    } else if (model.new_confirm_password !== model.new_password) {
      err.confirm_password = ResetPasswordValidationErrors.passwordsDoNotMatch();
    }

    setError(err);
    return Object.keys(err).length === 0;
  };

  const handleReset = async () => {
    if (!netInfo.isConnected) {
      Toast.show({ type: 'error', text1: t('errors.noInternet') });
      return;
    }

    if (!validate()) return;

    try {
      setIsLoading(true);
      const payload = { ...model, email_address: email };

      const res = await ApiService.postFromAPI(
        ENDPOINT.auth.resetPassword,
        payload,
      );

      if (res?.status === 200 || res?.status === 'success' || res?.data) {
        Toast.show({ type: 'success', text1: t('resetPassword.resetSuccess') });
        navigation.reset({
          index: 0,
          routes: [{ name: SCREENS.LOGIN }],
        });
      }
    } catch (err: any) {
      const friendlyMessage = parseApiError(err, 'resetPassword');
      Toast.show({ type: 'error', text1: friendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <KeyboardAwareScrollView
        bottomOffset={20}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <AppIcon name={AppIcons.wallet} size={28} color={theme.white} />
          </View>
          <Text style={styles.title}>{t('resetPassword.title')}</Text>
          <Text style={styles.subtitle}>{t('resetPassword.subtitle')}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <InputField
              label={t('resetPassword.newPassword')}
              placeholder={t('resetPassword.newPasswordPlaceholder')}
              value={model.new_password}
              onChangeText={text => updateField('new_password', text)}
              hasError={!!error.password}
              secureTextEntry={!showPassword}
              rightIcon={
                <ShowIcon
                  width={19 * scale}
                  height={19 * scale}
                  color={showPassword ? theme.primary : theme.textTertiary}
                />
              }
              rightIconOnPress={() => setShowPassword(prev => !prev)}
            />
            {error.password ? (
              <Text style={styles.errorText}>{error.password}</Text>
            ) : null}
            <PasswordStrengthChecker password={model.new_password} />
          </View>

          <View style={styles.fieldGroup}>
            <InputField
              label={t('resetPassword.confirmPassword')}
              placeholder={t('resetPassword.confirmPasswordPlaceholder')}
              value={model.new_confirm_password}
              onChangeText={text => updateField('new_confirm_password', text)}
              hasError={!!error.confirm_password}
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                <ShowIcon
                  width={19 * scale}
                  height={19 * scale}
                  color={
                    showConfirmPassword ? theme.primary : theme.textTertiary
                  }
                />
              }
              rightIconOnPress={() => setShowConfirmPassword(prev => !prev)}
            />
            {error.confirm_password ? (
              <Text style={styles.errorText}>{error.confirm_password}</Text>
            ) : null}
          </View>

          <AppButton
            title={t('resetPassword.resetButton')}
            loading={isLoading}
            disabled={isLoading}
            onPress={handleReset}
            style={styles.button}
          />
        </View>

        <View style={styles.loginRow}>
          <Text
            style={styles.loginLink}
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: SCREENS.LOGIN }] })
            }
          >
            {t('resetPassword.backToLogin')}
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 32 * verticalScale,
    },
    header: {
      alignItems: 'center',
      paddingTop: 28 * verticalScale,
      paddingBottom: 20 * verticalScale,
      paddingHorizontal: 24 * scale,
    },
    iconBadge: {
      width: 56 * scale,
      height: 56 * scale,
      borderRadius: 36 * scale,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16 * verticalScale,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 * scale },
      shadowOpacity: 0.25,
      shadowRadius: 10 * scale,
      elevation: 5,
    },
    title: {
      fontSize: 25 * scale,
      fontWeight: '800',
      color: theme.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13.5 * scale,
      color: theme.textSecondary,
      marginTop: 6 * verticalScale,
      textAlign: 'center',
      paddingHorizontal: 12 * scale,
    },
    card: {
      padding: 16 * scale,
    },
    fieldGroup: {
      marginBottom: 14 * verticalScale,
    },
    errorText: {
      color: theme.error,
      fontSize: 11.5 * scale,
      marginTop: 4 * verticalScale,
      marginLeft: 2 * scale,
    },
    button: {
      width: '100%',
      marginTop: 8 * verticalScale,
    },
    loginRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 26 * verticalScale,
    },
    loginLink: {
      color: theme.primary,
      fontSize: 13.5 * scale,
      fontWeight: '700',
    },
  });
