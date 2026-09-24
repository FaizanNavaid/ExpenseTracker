import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DeviceInfo from 'react-native-device-info';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useAppDispatch } from '../../../config/redux/hooks/hooks';
import { setLanguage } from '../../../config/redux/slices/localizationSlice';
import { useTheme } from '../../../services/utils/theme/useTheme';
import { useThemeToggle } from '../../../services/utils/theme/useThemeToggle';
import { removeCookie, removeSecureData } from '../../../services/helper/helper';
import { SCREENS } from '../../../config/navigation/screen-names/ScreenName';
import CustomHeader from '../../../components/custom-header';
import AppIcon from '../../../assets/icon';
import { AppIcons } from '../../../services/helper/iconName';
import AppStatusBar from '../../../components/app-status-bar';

const { width } = Dimensions.get('window');
const scale = width / 375;

const LANG_SEGMENT_WIDTH = 44 * scale;
const LANG_TOGGLE_PADDING = 3 * scale;

export default function Setting() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const rowStyles = getRowStyles(theme);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { isDarkMode, toggle: toggleDarkMode } = useThemeToggle();

  const isUrdu = i18n.language === 'ur';

  const toggleLanguage = () => {
    const next = isUrdu ? 'en' : 'ur';
    i18n.changeLanguage(next);
    dispatch(setLanguage(next));
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logoutConfirmTitle'),
      t('settings.logoutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            await removeCookie();
            await removeSecureData('email_address');
            Toast.show({ type: 'success', text1: t('settings.logoutSuccess') });
            const rootNavigation = navigation.getParent?.() ?? navigation;
            rootNavigation.reset({
              index: 0,
              routes: [{ name: SCREENS.LOGIN }],
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <CustomHeader
        title={t('settings.title')}
        leftIcon={
          <AppIcon name={AppIcons.backArrow} size={22} color={theme.textPrimary} />
        }
        onLeftIconPress={() => navigation.goBack()}
      />
      <AppStatusBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>
          {t('settings.preferencesSection')}
        </Text>
        <View style={styles.card}>
          <SettingsRow
            theme={theme}
            icon={isDarkMode ? AppIcons.darkMode : AppIcons.lightMode}
            label={t('settings.darkMode')}
            description={t('settings.darkModeDesc')}
            right={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: theme.lightGray, true: theme.primary }}
                thumbColor={theme.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingsRow
            theme={theme}
            icon={AppIcons.language}
            label={t('settings.language')}
            description={t('settings.languageDesc')}
            right={
              <LanguageToggle
                isUrdu={isUrdu}
                onToggle={toggleLanguage}
                theme={theme}
              />
            }
          />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>{t('settings.aboutSection')}</Text>
        <View style={styles.card}>
          <SettingsRow
            theme={theme}
            icon={AppIcons.privacy}
            label={t('settings.privacyPolicy')}
            onPress={() => navigation.navigate(SCREENS.PRIVACY)}
            right={
              <AppIcon
                name={AppIcons.chevronRight}
                size={20}
                color={theme.textTertiary}
              />
            }
          />
          <View style={styles.divider} />
          <SettingsRow
            theme={theme}
            icon={AppIcons.info}
            label={t('settings.appVersion')}
            right={<Text style={rowStyles.versionText}>{DeviceInfo.getVersion()}</Text>}
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>{t('settings.accountSection')}</Text>
        <View style={styles.card}>
          <SettingsRow
            theme={theme}
            icon={AppIcons.logout}
            label={t('settings.logout')}
            onPress={handleLogout}
            danger
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingsRowProps {
  theme: any;
  icon: string;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsRow({
  theme,
  icon,
  label,
  description,
  right,
  onPress,
  danger,
}: SettingsRowProps) {
  const rowStyles = getRowStyles(theme);

  const content = (
    <View style={rowStyles.row}>
      <View
        style={[
          rowStyles.iconWrap,
          danger && rowStyles.iconWrapDanger,
        ]}
      >
        <AppIcon
          name={icon}
          size={19}
          color={danger ? theme.error : theme.primary}
        />
      </View>
      <View style={rowStyles.textWrap}>
        <Text style={[rowStyles.label, danger && rowStyles.labelDanger]}>
          {label}
        </Text>
        {description ? (
          <Text style={rowStyles.description}>{description}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: theme.lightGray }}
      style={({ pressed }) => [pressed && rowStyles.pressed]}
    >
      {content}
    </Pressable>
  );
}

interface LanguageToggleProps {
  isUrdu: boolean;
  onToggle: () => void;
  theme: any;
}

function LanguageToggle({ isUrdu, onToggle, theme }: LanguageToggleProps) {
  const progress = useSharedValue(isUrdu ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isUrdu ? 1 : 0, { duration: 200 });
  }, [isUrdu, progress]);

  // transform: translateX is NOT auto-mirrored by RN under RTL (unlike
  // layout props such as left/right or flexDirection), so the slide
  // direction has to be flipped manually to still land under the right
  // segment once the row itself is mirrored.
  const rtlMultiplier = I18nManager.isRTL ? -1 : 1;
  const highlightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * LANG_SEGMENT_WIDTH * rtlMultiplier },
    ],
  }));

  const enTextStyle = { color: !isUrdu ? theme.white : theme.textSecondary };
  const urTextStyle = { color: isUrdu ? theme.white : theme.textSecondary };

  return (
    <Pressable
      style={[langStyles.wrap, { backgroundColor: theme.lightGray }]}
      onPress={onToggle}
      hitSlop={8}
    >
      <Animated.View
        style={[
          langStyles.highlight,
          { backgroundColor: theme.primary },
          highlightStyle,
        ]}
      />
      <View style={langStyles.segment}>
        <Text style={[langStyles.segmentText, enTextStyle]}>EN</Text>
      </View>
      <View style={langStyles.segment}>
        <Text style={[langStyles.segmentText, urTextStyle]}>اردو</Text>
      </View>
    </Pressable>
  );
}

const langStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    width: LANG_SEGMENT_WIDTH * 2 + LANG_TOGGLE_PADDING * 2,
    height: 32 * scale,
    borderRadius: 16 * scale,
    padding: LANG_TOGGLE_PADDING,
  },
  highlight: {
    position: 'absolute',
    top: LANG_TOGGLE_PADDING,
    left: LANG_TOGGLE_PADDING,
    width: LANG_SEGMENT_WIDTH,
    height: 32 * scale - LANG_TOGGLE_PADDING * 2,
    borderRadius: 13 * scale,
  },
  segment: {
    width: LANG_SEGMENT_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 11 * scale,
    fontWeight: '700',
  },
});

const getRowStyles = (theme: any) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12 * scale,
      paddingHorizontal: 14 * scale,
      gap: 12 * scale,
    },
    pressed: {
      opacity: 0.7,
    },
    iconWrap: {
      width: 36 * scale,
      height: 36 * scale,
      borderRadius: 10 * scale,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapDanger: {
      backgroundColor: theme.errorLight,
    },
    textWrap: {
      flex: 1,
    },
    label: {
      fontSize: 14.5 * scale,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    labelDanger: {
      color: theme.error,
    },
    description: {
      fontSize: 12 * scale,
      color: theme.textTertiary,
      marginTop: 2 * scale,
    },
    versionText: {
      fontSize: 13 * scale,
      color: theme.textTertiary,
    },
  });

const getStyles = (theme: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    scrollContent: {
      paddingHorizontal: 16 * scale,
      paddingBottom: 32 * scale,
      flexGrow: 1,
    },
    subtitle: {
      fontSize: 13 * scale,
      color: theme.textSecondary,
      marginTop: 14 * scale,
      marginBottom: 6 * scale,
    },
    sectionLabel: {
      fontSize: 12.5 * scale,
      fontWeight: '700',
      color: theme.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 20 * scale,
      marginBottom: 8 * scale,
      marginLeft: 2 * scale,
    },
    card: {
      backgroundColor: theme.headerTab,
      borderRadius: 14 * scale,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 * scale },
      shadowOpacity: 0.06,
      shadowRadius: 6 * scale,
      elevation: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.borderColor,
      marginLeft: 62 * scale,
    },
  });
