import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  I18nManager,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useTheme } from '../../services/utils/theme/useTheme';
import { HomeIcon, SettingIcon, PrivacyPolicyIcon } from '../../assets/icon/svg-icon';
import AppIcon from '../../assets/icon';
import { AppIcons } from '../../services/helper/iconName';
import { SCREENS } from '../../config/navigation/screen-names/ScreenName';

const { width } = Dimensions.get('window');
const scale = width / 375;

const ITEM_HEIGHT = 50 * scale;
const ITEM_GAP = 8 * scale;

const MENU_ITEMS: {
  route: string;
  labelKey: string;
  Icon: (props: { width: number; height: number; color: string }) => React.ReactElement;
}[] = [
  { route: SCREENS.TABS, labelKey: 'drawer.home', Icon: HomeIcon },
  { route: SCREENS.SETTINGS, labelKey: 'drawer.settings', Icon: SettingIcon },
  { route: SCREENS.PRIVACY, labelKey: 'drawer.privacy', Icon: PrivacyPolicyIcon },
];

export default function DrawerContent({
  state,
  navigation,
}: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  const activeIndex = MENU_ITEMS.findIndex(
    (item) => item.route === state.routes[state.index]?.name,
  );
  const indicatorY = useSharedValue(Math.max(activeIndex, 0) * (ITEM_HEIGHT + ITEM_GAP));

  useEffect(() => {
    if (activeIndex < 0) return;
    indicatorY.value = withSpring(activeIndex * (ITEM_HEIGHT + ITEM_GAP), {
      damping: 16,
      stiffness: 150,
    });
  }, [activeIndex, indicatorY]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: indicatorY.value }],
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <AppIcon name={AppIcons.wallet} size={26} color={theme.white} />
        </View>
        <Text style={styles.appName}>{t('app.name')}</Text>
        <Text style={styles.appTagline}>{t('app.tagline')}</Text>
      </View>

      <View style={styles.divider} />

      {/* Menu */}
      <View style={styles.menu}>
        {activeIndex >= 0 && (
          <Animated.View
            style={[
              styles.indicator,
              { backgroundColor: theme.primary },
              indicatorStyle,
            ]}
          />
        )}

        {MENU_ITEMS.map((item, index) => (
          <DrawerItem
            key={item.route}
            label={t(item.labelKey)}
            Icon={item.Icon}
            isFocused={index === activeIndex}
            onPress={() => {
              navigation.navigate(item.route);
              navigation.closeDrawer();
            }}
            theme={theme}
          />
        ))}
      </View>
    </ScrollView>
  );
}

interface DrawerItemProps {
  label: string;
  Icon: (props: { width: number; height: number; color: string }) => React.ReactElement;
  isFocused: boolean;
  onPress: () => void;
  theme: any;
}

function DrawerItem({ label, Icon, isFocused, onPress, theme }: DrawerItemProps) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
  }, [isFocused, progress]);

  // translateX isn't auto-mirrored by RN under RTL, so flip the nudge
  // direction manually to still point "inward" once the row is mirrored.
  const rtlMultiplier = I18nManager.isRTL ? -1 : 1;
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 3 * scale * progress.value * rtlMultiplier },
      { scale: 1 + 0.08 * progress.value },
    ],
  }));

  const iconColor = isFocused ? theme.primary : theme.textTertiary;
  const dynamicLabelStyle: { color: string; fontWeight: '700' | '500' } = {
    color: isFocused ? theme.textPrimary : theme.textSecondary,
    fontWeight: isFocused ? '700' : '500',
  };

  return (
    <Pressable
      style={itemStyles.item}
      onPress={onPress}
      android_ripple={{ color: theme.lightGray }}
    >
      <Animated.View style={iconStyle}>
        <Icon width={20 * scale} height={20 * scale} color={iconColor} />
      </Animated.View>
      <Text style={[itemStyles.label, dynamicLabelStyle]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const itemStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    marginBottom: ITEM_GAP,
    paddingHorizontal: 14 * scale,
    borderRadius: 14 * scale,
  },
  label: {
    fontSize: 14 * scale,
    marginLeft: 14 * scale,
  },
});

const getStyles = (theme: any, insets: { top: number }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.mainBg,
    },
    content: {
      paddingTop: insets.top + 20 * scale,
      // Small, fixed cosmetic gap only — real bottom safe-area clearance is
      // already reserved globally (AppSafeWrapper on Android, the native
      // screen container on iOS), so we don't add insets.bottom again here.
      paddingBottom: 20 * scale,
      paddingHorizontal: 16 * scale,
      flexGrow: 1,
    },
    header: {
      alignItems: 'center',
      paddingBottom: 18 * scale,
    },
    iconBadge: {
      width: 52 * scale,
      height: 52 * scale,
      borderRadius: 34 * scale,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10 * scale,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 * scale },
      shadowOpacity: 0.25,
      shadowRadius: 10 * scale,
      elevation: 5,
    },
    appName: {
      fontSize: 17 * scale,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    appTagline: {
      fontSize: 12 * scale,
      color: theme.textSecondary,
      marginTop: 3 * scale,
      textAlign: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: theme.borderColor,
      marginBottom: 16 * scale,
    },
    menu: {
      position: 'relative',
    },
    indicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: ITEM_HEIGHT,
      borderRadius: 14 * scale,
      opacity: 0.1,
    },
  });
