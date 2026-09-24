import { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ErrorModel, LoginModel } from '../../services/interface';
import { useTheme } from '../../services/utils/theme/useTheme';
import { LoginValidationErrors } from '../../models/validations/AuthValidationErrors';
import {
  getMachineDetail,
  isValidEmail,
  isValidPassword,
  storeCookie,
  storeSecureData,
} from '../../services/helper/helper';
import ApiService from '../../services/api/HttpHelper';
import { cleanCookieString } from '../../services/api/HttpProvider';
import { ENDPOINT } from '../../services/api/EndPoint';
import { SCREENS } from '../../config/navigation/screen-names/ScreenName';
import { parseApiError } from '../../services/utils/errors/errorHandler';
import InputField from '../../components/input-field';
import AppIcon from '../../assets/icon';
import { AppIcons } from '../../services/helper/iconName';
import AppButton from '../../components/buttons';
import { EmailIcon, ShowIcon } from '../../assets/icon/svg-icon';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;

export default function Login() {
  const [model, setModel] = useState<LoginModel>({
    email_address: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorModel>({});
  const [showPassword, setShowPassword] = useState(false);

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const netInfo = useNetInfo();
  const navigation = useNavigation<any>();

  const updateField = (key: keyof LoginModel, value: string) => {
    setModel(prev => ({ ...prev, [key]: value }));
    if (error[key]) {
      setError(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const validate = (): boolean => {
    const err: ErrorModel = {};

    if (!model.email_address.trim()) {
      err.email_address = LoginValidationErrors.emailRequired();
    } else if (!isValidEmail(model.email_address)) {
      err.email_address = LoginValidationErrors.emailInvalid();
    }

    if (!model.password.trim()) {
      err.password = LoginValidationErrors.passwordRequired();
    } else if (!isValidPassword(model.password)) {
      err.password = LoginValidationErrors.passwordMinLength();
    }

    setError(err);
    return Object.keys(err).length === 0;
  };

  const handleLogin = async () => {
    if (!netInfo.isConnected) {
      Toast.show({ type: 'error', text1: t('errors.noInternet') });
      return;
    }

    if (!validate()) return;

    try {
      setIsLoading(true);
      const machine_detail = await getMachineDetail();
      const payload = { ...model, machineDetail: machine_detail };

      const res = await ApiService.postFromAPI(ENDPOINT.auth.login, payload);

      if (res?.data?.status === 'success' || res?.data?.status === 200) {
        const rawCookie =
          res?.headers?.['set-cookie'] || res?.headers?.['Set-Cookie'];

        if (rawCookie) {
          await storeCookie(cleanCookieString(rawCookie));
        }

        await storeSecureData(
          'email_address',
          res?.data?.data?.email_address || model.email_address,
        );

        Toast.show({ type: 'success', text1: t('login.loginSuccess') });
        navigation.reset({
          index: 0,
          routes: [{ name: SCREENS.HOME }],
        });
      }
    } catch (err: any) {
      console.log(err);

      const backendMessage = err?.response?.data?.message?.toLowerCase() || '';
      const isUnverified =
        (err?.response?.status === 400 || err?.response?.status === 401) &&
        backendMessage.includes('not verified');

      const friendlyMessage = parseApiError(err, 'login');
      Toast.show({ type: 'error', text1: friendlyMessage });

      if (isUnverified) {
        navigation.navigate(SCREENS.VERIFY_OTP, {
          email: model.email_address,
          flowType: 'login',
        });
      }
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
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <InputField
              label={t('login.email')}
              placeholder={t('login.emailPlaceholder')}
              value={model.email_address}
              onChangeText={text => updateField('email_address', text)}
              hasError={!!error.email_address}
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
            {error.email_address ? (
              <Text style={styles.errorText}>{error.email_address}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <InputField
              label={t('login.password')}
              placeholder={t('login.passwordPlaceholder')}
              value={model.password}
              onChangeText={text => updateField('password', text)}
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
          </View>

          <Text
            style={styles.forgotLink}
            onPress={() => navigation.navigate(SCREENS.FORGOT_PASSWORD)}
          >
            {t('login.forgotPassword')}
          </Text>

          <AppButton
            title={t('login.loginButton')}
            loading={isLoading}
            disabled={isLoading}
            onPress={handleLogin}
            style={styles.button}
          />
        </View>

        <View style={styles.signUpRow}>
          <Text style={styles.signUpText}>{t('login.noAccount')}</Text>
          <Text
            style={styles.signUpLink}
            onPress={() => navigation.navigate(SCREENS.SIGN_UP)}
          >
            {t('login.signUpLink')}
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
    forgotLink: {
      alignSelf: 'flex-end',
      color: theme.primary,
      fontSize: 13 * scale,
      fontWeight: '700',
      marginBottom: 18 * verticalScale,
    },
    button: {
      width: '100%',
      marginTop: 8 * verticalScale,
    },
    signUpRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: 26 * verticalScale,
      paddingHorizontal: 24 * scale,
    },
    signUpText: {
      color: theme.textSecondary,
      fontSize: 13.5 * scale,
    },
    signUpLink: {
      color: theme.primary,
      fontSize: 13.5 * scale,
      fontWeight: '700',
      marginLeft: 5 * scale,
    },
  });
