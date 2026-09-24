import { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ErrorModel, ForgotPassModel } from '../../services/interface';
import { useTheme } from '../../services/utils/theme/useTheme';
import { ForgotPasswordValidationErrors } from '../../models/validations/AuthValidationErrors';
import { isValidEmail } from '../../services/helper/helper';
import ApiService from '../../services/api/HttpHelper';
import { ENDPOINT } from '../../services/api/EndPoint';
import { SCREENS } from '../../config/navigation/screen-names/ScreenName';
import { parseApiError } from '../../services/utils/errors/errorHandler';
import InputField from '../../components/input-field';
import AppIcon from '../../assets/icon';
import { AppIcons } from '../../services/helper/iconName';
import AppButton from '../../components/buttons';
import { EmailIcon } from '../../assets/icon/svg-icon';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;

export default function ForgotPassword() {
  const [model, setModel] = useState<ForgotPassModel>({
    forgot_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorModel>({});

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const netInfo = useNetInfo();
  const navigation = useNavigation<any>();

  const updateField = (value: string) => {
    setModel({ forgot_password: value });
    if (error.forgot_password) {
      setError(prev => {
        const updated = { ...prev };
        delete updated.forgot_password;
        return updated;
      });
    }
  };

  const validate = (): boolean => {
    const err: ErrorModel = {};

    if (!model.forgot_password.trim()) {
      err.forgot_password = ForgotPasswordValidationErrors.emailRequired();
    } else if (!isValidEmail(model.forgot_password)) {
      err.forgot_password = ForgotPasswordValidationErrors.emailInvalid();
    }

    setError(err);
    return Object.keys(err).length === 0;
  };

  const handleSendCode = async () => {
    if (!netInfo.isConnected) {
      Toast.show({ type: 'error', text1: t('errors.noInternet') });
      return;
    }

    if (!validate()) return;

    try {
      setIsLoading(true);
      const res = await ApiService.postFromAPI(ENDPOINT.auth.forgotPassword, {
        email_address: model.forgot_password,
      });

      if (res?.status === 200 || res?.status === 'success' || res?.data) {
        Toast.show({ type: 'success', text1: t('forgotPassword.codeSent') });
        navigation.navigate(SCREENS.VERIFY_OTP, {
          email: model.forgot_password,
          flowType: 'resetPassword',
        });
      }
    } catch (err: any) {
      const friendlyMessage = parseApiError(err, 'forgotPassword');
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
          <Text style={styles.title}>{t('forgotPassword.title')}</Text>
          <Text style={styles.subtitle}>{t('forgotPassword.subtitle')}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <InputField
              label={t('forgotPassword.email')}
              placeholder={t('forgotPassword.emailPlaceholder')}
              value={model.forgot_password}
              onChangeText={updateField}
              hasError={!!error.forgot_password}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <EmailIcon
                  width={18 * scale}
                  height={18 * scale}
                  color={theme.textTertiary}
                />
              }
            />
            {error.forgot_password ? (
              <Text style={styles.errorText}>{error.forgot_password}</Text>
            ) : null}
          </View>

          <AppButton
            title={t('forgotPassword.sendCodeButton')}
            loading={isLoading}
            disabled={isLoading}
            onPress={handleSendCode}
            style={styles.button}
          />
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            {t('forgotPassword.rememberPassword')}
          </Text>
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate(SCREENS.LOGIN)}
          >
            {t('forgotPassword.loginLink')}
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
      flexWrap: 'wrap',
      marginTop: 26 * verticalScale,
      paddingHorizontal: 24 * scale,
    },
    loginText: {
      color: theme.textSecondary,
      fontSize: 13.5 * scale,
    },
    loginLink: {
      color: theme.primary,
      fontSize: 13.5 * scale,
      fontWeight: '700',
      marginLeft: 5 * scale,
    },
  });
