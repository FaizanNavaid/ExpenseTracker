import { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ErrorModel, SignUpModel } from '../../services/interface';
import { useTheme } from '../../services/utils/theme/useTheme';
import { SignUpValidationErrors } from '../../models/validations/AuthValidationErrors';
import {
  getMachineDetail,
  isValidEmail,
  isValidPassword,
  storeSecureData,
} from '../../services/helper/helper';
import ApiService from '../../services/api/HttpHelper';
import { ENDPOINT } from '../../services/api/EndPoint';
import { SCREENS } from '../../config/navigation/screen-names/ScreenName';
import { parseApiError } from '../../services/utils/errors/errorHandler';
import InputField from '../../components/input-field';
import AppIcon from '../../assets/icon';
import { AppIcons } from '../../services/helper/iconName';
import AppButton from '../../components/buttons';
import { ProfileIcon, EmailIcon, ShowIcon } from '../../assets/icon/svg-icon';
import PasswordStrengthChecker from '../../components/password-strength-cheker';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;

export default function SignUp() {
  const [model, setModel] = useState<SignUpModel>({
    first_name: '',
    last_name: '',
    email_address: '',
    password: '',
    confirm_password: '',
    phone_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorModel>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const netInfo = useNetInfo();
  const navigation = useNavigation<any>();

  const updateField = (key: keyof SignUpModel, value: string) => {
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

    if (!model.first_name.trim())
      err.first_name = SignUpValidationErrors.firstNameRequired();
    if (!model.last_name.trim())
      err.last_name = SignUpValidationErrors.lastNameRequired();

    if (!model.email_address.trim()) {
      err.email_address = SignUpValidationErrors.emailRequired();
    } else if (!isValidEmail(model.email_address)) {
      err.email_address = SignUpValidationErrors.emailInvalid();
    }

    if (!model.phone_number.trim()) {
      err.phone_number = SignUpValidationErrors.phoneRequired();
    }

    if (!model.password.trim()) {
      err.password = SignUpValidationErrors.passwordRequired();
    } else if (!isValidPassword(model.password)) {
      err.password = SignUpValidationErrors.passwordMinLength();
    }

    if (!model.confirm_password.trim()) {
      err.confirm_password = SignUpValidationErrors.confirmPasswordRequired();
    } else if (model.confirm_password !== model.password) {
      err.confirm_password = SignUpValidationErrors.passwordsDoNotMatch();
    }

    setError(err);
    return Object.keys(err).length === 0;
  };

  const createAccount = async () => {
    if (!netInfo.isConnected) {
      Toast.show({ type: 'error', text1: t('common.networkError') });
      return;
    }

    if (!validate()) return;

    try {
      setIsLoading(true);
      const machine_detail = await getMachineDetail();
      const payload = { ...model, machineDetail: machine_detail };

      const res = await ApiService.postFromAPI(ENDPOINT.auth.register, payload);

      if (res?.status === 'success' || res?.status === 201 || res?.data) {
        await storeSecureData(
          'email_address',
          res?.data?.email_address || model.email_address,
        );

        Toast.show({ type: 'success', text1: t('signup.accountCreated') });
        navigation.navigate(SCREENS.VERIFY_OTP, {
          email: model.email_address,
          flowType: 'signup',
        });
      }
    } catch (err: any) {
      console.log(err.response?.data?.message);
      
      const friendlyMessage = parseApiError(err, 'signup');
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
          <Text style={styles.title}>{t('signup.title')}</Text>
          <Text style={styles.subtitle}>{t('signup.subtitle')}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={[styles.row, styles.fieldGroup]}>
            <View style={styles.halfInput}>
              <InputField
                label={t('signup.firstName')}
                placeholder={t('signup.firstNamePlaceholder')}
                value={model.first_name}
                onChangeText={text => updateField('first_name', text)}
                hasError={!!error.first_name}
                leftIcon={
                  <ProfileIcon
                    width={18 * scale}
                    height={18 * scale}
                    color={theme.textTertiary}
                  />
                }
              />
              {error.first_name ? (
                <Text style={styles.errorText}>{error.first_name}</Text>
              ) : null}
            </View>

            <View style={styles.halfInput}>
              <InputField
                label={t('signup.lastName')}
                placeholder={t('signup.lastNamePlaceholder')}
                value={model.last_name}
                onChangeText={text => updateField('last_name', text)}
                hasError={!!error.last_name}
                leftIcon={
                  <AppIcon
                    name={AppIcons.lastName}
                    size={18}
                    color={theme.textTertiary}
                  />
                }
              />
              {error.last_name ? (
                <Text style={styles.errorText}>{error.last_name}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <InputField
              label={t('signup.email')}
              placeholder={t('signup.emailPlaceholder')}
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
              maxLength={16}
              label={t('signup.phone')}
              placeholder={t('signup.phonePlaceholder')}
              value={model.phone_number}
              onChangeText={text => updateField('phone_number', text)}
              hasError={!!error.phone_number}
              keyboardType="phone-pad"
              leftIcon={
                <AppIcon
                  name={AppIcons.phone}
                  size={18}
                  color={theme.textTertiary}
                />
              }
            />
            {error.phone_number ? (
              <Text style={styles.errorText}>{error.phone_number}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <InputField
              label={t('signup.password')}
              placeholder={t('signup.passwordPlaceholder')}
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
            <PasswordStrengthChecker password={model?.password} />
          </View>

          <View style={styles.fieldGroup}>
            <InputField
              label={t('signup.confirmPassword')}
              placeholder={t('signup.confirmPasswordPlaceholder')}
              value={model.confirm_password}
              onChangeText={text => updateField('confirm_password', text)}
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
            title={t('signup.signUpButton')}
            loading={isLoading}
            disabled={isLoading}
            onPress={createAccount}
            style={styles.button}
          />
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>{t('signup.haveAccount')}</Text>
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate(SCREENS.LOGIN)}
          >
            {t('signup.loginLink')}
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
      // marginHorizontal: 18 * scale,
      padding: 16 * scale,
    },
    row: {
      flexDirection: 'row',
      gap: 12 * scale,
    },
    halfInput: {
      flex: 1,
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
