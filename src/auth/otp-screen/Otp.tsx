import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { OtpModel } from '../../services/interface';
import { useTheme } from '../../services/utils/theme/useTheme';
import { OtpValidationErrors } from '../../models/validations/AuthValidationErrors';
import ApiService from '../../services/api/HttpHelper';
import { ENDPOINT } from '../../services/api/EndPoint';
import { SCREENS } from '../../config/navigation/screen-names/ScreenName';
import { parseApiError } from '../../services/utils/errors/errorHandler';
import AppIcon from '../../assets/icon';
import { AppIcons } from '../../services/helper/iconName';
import AppButton from '../../components/buttons';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;

const OTP_LENGTH = 6;
const OTP_BOX_GAP = 10 * scale;
const OTP_BOX_SIZE = Math.min(
  50 * scale,
  (width - 24 * scale * 2 - OTP_BOX_GAP * (OTP_LENGTH - 1)) / OTP_LENGTH,
);

type FlowType = 'signup' | 'login' | 'resetPassword';

export default function Otp() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const netInfo = useNetInfo();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const email: string = route.params?.email || '';
  const flowType: FlowType = route.params?.flowType || 'signup';
  const isResetFlow = flowType === 'resetPassword';

  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(''),
  );
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(flowType === 'login' ? 0 : 30);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Login flow lands here without any OTP having been dispatched yet —
  // trigger the send as soon as the screen mounts.
  useEffect(() => {
    if (flowType === 'login') {
      sendOtp(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (text: string, index: number) => {
    if (otpError) setOtpError('');

    const digits = text.replace(/[^0-9]/g, '');

    if (digits.length > 1) {
      const updated = [...otpDigits];
      for (let i = 0; i < digits.length && index + i < OTP_LENGTH; i++) {
        updated[index + i] = digits[i];
      }
      setOtpDigits(updated);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = digits;
    setOtpDigits(updated);

    if (digits && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const sendOtp = async (silent = false) => {
    if (!netInfo.isConnected) {
      Toast.show({ type: 'error', text1: t('errors.noInternet') });
      return;
    }

    try {
      setIsResending(true);
      await ApiService.postFromAPI(ENDPOINT.auth.resendOtp, {
        email_address: email,
        flowType,
      });
      setResendTimer(30);
      if (!silent) {
        Toast.show({ type: 'success', text1: t('otp.codeResent') });
      }
    } catch (err: any) {
      const friendlyMessage = parseApiError(err, 'otp');
      Toast.show({ type: 'error', text1: friendlyMessage });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const otp = otpDigits.join('');

    if (otp.length < OTP_LENGTH) {
      setOtpError(OtpValidationErrors.otpRequired());
      return;
    }

    if (!netInfo.isConnected) {
      Toast.show({ type: 'error', text1: t('errors.noInternet') });
      return;
    }

    try {
      setIsVerifying(true);
      const payload: OtpModel = { email_address: email, otp, flowType };
      await ApiService.postFromAPI(ENDPOINT.auth.verifyOtp, payload);

      if (isResetFlow) {
        Toast.show({ type: 'success', text1: t('otp.codeVerified') });
        navigation.navigate(SCREENS.RESET_PASSWORD, { email, otp });
        return;
      }

      Toast.show({ type: 'success', text1: t('otp.accountVerified') });
      navigation.reset({
        index: 0,
        routes: [{ name: SCREENS.LOGIN }],
      });
    } catch (err: any) {
      const friendlyMessage = parseApiError(err, 'otp');
      setOtpError(friendlyMessage);
      Toast.show({ type: 'error', text1: friendlyMessage });
    } finally {
      setIsVerifying(false);
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
          <Text style={styles.title}>
            {isResetFlow ? t('otp.titleReset') : t('otp.title')}
          </Text>
          <Text style={styles.subtitle}>
            {isResetFlow ? t('otp.subtitleReset') : t('otp.subtitle')}
          </Text>
          {email ? <Text style={styles.emailText}>{email}</Text> : null}
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.otpRow}>
            {otpDigits.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  !!digit && styles.otpBoxFilled,
                  !!otpError && styles.otpBoxError,
                ]}
                value={digit}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                textAlign="center"
                selectTextOnFocus
                textContentType={index === 0 ? 'oneTimeCode' : undefined}
                autoComplete={index === 0 ? 'sms-otp' : 'off'}
              />
            ))}
          </View>
          {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>{t('otp.resendPrompt')}</Text>
            {resendTimer > 0 ? (
              <Text style={styles.resendTimerText}>
                {t('otp.resendIn', { seconds: resendTimer })}
              </Text>
            ) : (
              <Text
                style={styles.resendLink}
                onPress={() => !isResending && sendOtp(false)}
              >
                {t('otp.resendLink')}
              </Text>
            )}
          </View>

          <AppButton
            title={t('otp.verifyButton')}
            loading={isVerifying}
            disabled={isVerifying}
            onPress={handleVerify}
            style={styles.button}
          />
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
    emailText: {
      fontSize: 13.5 * scale,
      fontWeight: '700',
      color: theme.textPrimary,
      marginTop: 4 * verticalScale,
      textAlign: 'center',
    },
    card: {
      padding: 16 * scale,
    },
    otpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    otpBox: {
      width: OTP_BOX_SIZE,
      height: OTP_BOX_SIZE * 1.05,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 8 * scale,
      backgroundColor: theme.surfaceLight,
      fontSize: 20 * scale,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    otpBoxFilled: {
      borderColor: theme.primary,
    },
    otpBoxError: {
      borderColor: theme.error,
    },
    errorText: {
      color: theme.error,
      fontSize: 11.5 * scale,
      marginTop: 8 * verticalScale,
      textAlign: 'center',
    },
    resendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: 20 * verticalScale,
      marginBottom: 8 * verticalScale,
    },
    resendPrompt: {
      color: theme.textSecondary,
      fontSize: 13 * scale,
    },
    resendTimerText: {
      color: theme.textTertiary,
      fontSize: 13 * scale,
      fontWeight: '700',
      marginLeft: 5 * scale,
    },
    resendLink: {
      color: theme.primary,
      fontSize: 13 * scale,
      fontWeight: '700',
      marginLeft: 5 * scale,
    },
    button: {
      width: '100%',
      marginTop: 18 * verticalScale,
    },
  });
