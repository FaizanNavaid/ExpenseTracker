import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  LayoutChangeEvent,
  I18nManager,
} from 'react-native';
import {
  useSafeAreaInsets,
  type EdgeInsets,
} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../services/utils/theme/useTheme';
import { AddIcon, HomeIcon, ProfileIcon } from '../../assets/icon/svg-icon';
import { SCREENS } from '../../config/navigation/screen-names/ScreenName';

const { width } = Dimensions.get('window');
const scale = width / 375;

const TAB_ICONS: Record<
  string,
  (props: { width: number; height: number; color: string }) => React.ReactElement
> = {
  [SCREENS.HOME]: HomeIcon,
  [SCREENS.PROFILE]: ProfileIcon,
  [SCREENS.ADD_EXPENSE]: AddIcon,
};

const INDICATOR_WIDTH = 20 * scale;

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSafePadding = 6 * scale;
  const styles = getStyles(theme, bottomSafePadding, insets);

  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth / (state.routes.length || 1);
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (!tabWidth) return;
    indicatorX.value = withSpring(
      state.index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2,
      { damping: 16, stiffness: 150 },
    );
  }, [state.index, tabWidth, indicatorX]);

  // transform: translateX is NOT auto-mirrored by RN under RTL (unlike
  // flexDirection, which IS — that's what actually reorders the tabs).
  // Without this flip, the indicator would slide toward the wrong tab
  // once the row itself is mirrored.
  const rtlMultiplier = I18nManager.isRTL ? -1 : 1;
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value * rtlMultiplier }],
  }));

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.bar} onLayout={onBarLayout}>
      {barWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: theme.primary },
            indicatorStyle,
          ]}
        />
      )}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const Icon = TAB_ICONS[route.name] || HomeIcon;
        const label =
          options.tabBarLabel !== undefined
            ? String(options.tabBarLabel)
            : options.title !== undefined
            ? options.title
            : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            label={label}
            Icon={Icon}
            onPress={onPress}
            theme={theme}
          />
        );
      })}
    </View>
  );
}

interface TabItemProps {
  isFocused: boolean;
  label: string;
  Icon: (props: {
    width: number;
    height: number;
    color: string;
  }) => React.ReactElement;
  onPress: () => void;
  theme: any;
}

function TabItem({ isFocused, label, Icon, onPress, theme }: TabItemProps) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
  }, [isFocused, progress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -3 * scale * progress.value },
      { scale: 1 + 0.14 * progress.value },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + 0.45 * progress.value,
  }));

  const iconColor = isFocused ? theme.primary : theme.textTertiary;
  const dynamicLabelStyle: { color: string; fontWeight: '700' | '500' } = {
    color: iconColor,
    fontWeight: isFocused ? '700' : '500',
  };

  return (
    <Pressable
      style={itemStyles.item}
      onPress={onPress}
      hitSlop={8}
      android_ripple={{ color: theme.lightGray, borderless: true }}
    >
      <Animated.View style={iconStyle}>
        <Icon width={22 * scale} height={22 * scale} color={iconColor} />
      </Animated.View>
      <Animated.Text
        style={[itemStyles.label, dynamicLabelStyle, labelStyle]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const itemStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10 * scale,
    paddingBottom: 6 * scale,
  },
  label: {
    fontSize: 11 * scale,
    marginTop: 4 * scale,
  },
});

const getStyles = (theme: any, bottomSafePadding: number, insets: EdgeInsets) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      paddingLeft: Math.max(insets.left, 16 * scale),
      paddingRight: Math.max(insets.right, 16 * scale),
      paddingTop: 8 * scale,
      paddingBottom: bottomSafePadding,
      backgroundColor: theme.headerTab,
      borderTopLeftRadius: 22 * scale,
      borderTopRightRadius: 22 * scale,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 * scale },
      shadowOpacity: 0.08,
      shadowRadius: 10 * scale,
      elevation: 12,
    },
    indicator: {
      position: 'absolute',
      left: 0,
      bottom: bottomSafePadding + 4 * scale,
      width: INDICATOR_WIDTH,
      height: 3 * scale,
      borderRadius: 2 * scale,
    },
  });
