import { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../services/utils/theme/useTheme";
import { AppIcons } from "../../../services/helper/iconName";
import { SCREENS } from "../../../config/navigation/screen-names/ScreenName";
import AppIcon from "../../../assets/icon";
import AppButton from "../../../components/buttons";

const { width, height } = Dimensions.get("window");
const scale = width / 375;
const verticalScale = height / 812;

interface Slide {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: AppIcons.expense,
    titleKey: "onboarding.slide1Title",
    descKey: "onboarding.slide1Desc",
  },
  {
    id: "2",
    icon: AppIcons.category,
    titleKey: "onboarding.slide2Title",
    descKey: "onboarding.slide2Desc",
  },
  {
    id: "3",
    icon: AppIcons.analytics,
    titleKey: "onboarding.slide3Title",
    descKey: "onboarding.slide3Desc",
  },
];

export default function Onboarding() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: SCREENS.HOME }],
    });
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={styles.iconCircle}>
        <AppIcon name={item.icon} size={64} color={theme.white} />
      </View>
      <Text style={styles.title}>{t(item.titleKey)}</Text>
      <Text style={styles.description}>{t(item.descKey)}</Text>
    </View>
  );

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.header}>
        {!isLastSlide && (
          <Text style={styles.skipText} onPress={handleFinish}>
            {t("onboarding.skip")}
          </Text>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex ? theme.primary : theme.lightGray,
                  width: index === activeIndex ? 22 * scale : 8 * scale,
                },
              ]}
            />
          ))}
        </View>

        <AppButton
          title={isLastSlide ? t("onboarding.getStarted") : t("onboarding.next")}
          onPress={handleNext}
          style={styles.button}
        />
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
    header: {
      height: 44 * verticalScale,
      justifyContent: "center",
      alignItems: "flex-end",
      paddingHorizontal: 20 * scale,
    },
    skipText: {
      fontSize: 14 * scale,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    slide: {
      width,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32 * scale,
    },
    iconCircle: {
      width: 140 * scale,
      height: 140 * scale,
      borderRadius: 70 * scale,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32 * verticalScale,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 * scale },
      shadowOpacity: 0.2,
      shadowRadius: 12 * scale,
      elevation: 6,
    },
    title: {
      fontSize: 22 * scale,
      fontWeight: "700",
      color: theme.textPrimary,
      textAlign: "center",
      marginBottom: 12 * verticalScale,
    },
    description: {
      fontSize: 14 * scale,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 20 * scale,
    },
    footer: {
      paddingHorizontal: 24 * scale,
      paddingBottom: 24 * verticalScale,
    },
    dotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24 * verticalScale,
    },
    dot: {
      height: 8 * scale,
      borderRadius: 4 * scale,
      marginHorizontal: 4 * scale,
    },
    button: {
      width: "100%",
    },
  });