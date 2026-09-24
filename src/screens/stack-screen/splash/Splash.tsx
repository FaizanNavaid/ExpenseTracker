import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../services/utils/theme/useTheme';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../../../config/navigation/screen-names/ScreenName';
import AppIcon from '../../../assets/icon';
import { AppIcons } from '../../../services/helper/iconName';
const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;

export default function Splash() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: SCREENS.ONBOARDING }],
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <AppIcon name={AppIcons.wallet} size={48} color={theme.white} />
          </View>

          <Text style={styles.appName}>{t('app.name')}</Text>
          <Text style={styles.tagline}>{t('app.tagline')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    container: {
      flex: 1,
      backgroundColor: theme.mainBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoCircle: {
      width: 96 * scale,
      height: 96 * scale,
      borderRadius: 48 * scale,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20 * verticalScale,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 * scale },
      shadowOpacity: 0.25,
      shadowRadius: 10 * scale,
      elevation: 6,
    },
    appName: {
      fontSize: 26 * scale,
      fontWeight: '700',
      color: theme.textPrimary,
      letterSpacing: 0.5,
    },
    tagline: {
      fontSize: 13 * scale,
      color: theme.textSecondary,
      marginTop: 6 * verticalScale,
      textAlign: 'center',
    },
  });
