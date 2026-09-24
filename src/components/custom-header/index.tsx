import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useTheme } from "../../services/utils/theme/useTheme";

const { width } = Dimensions.get("window");
const scale = width / 375;

interface CustomHeaderProps {
  title?: string | React.ReactNode;
  titleStyle?: object;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  containerStyle?: object;
}

export default function CustomHeader(props: CustomHeaderProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const {
    title = "",
    titleStyle,
    leftIcon,
    rightIcon,
    onLeftIconPress,
    onRightIconPress,
    containerStyle,
  } = props;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLeftIconPress}
          style={styles.iconContainer}
        >
          {leftIcon || <View style={{ width: 24 * scale }} />}
        </TouchableOpacity>

        {typeof title === "string" ? (
          <Text
            numberOfLines={1}
            style={[styles.title, { color: theme.textPrimary }, titleStyle]}
          >
            {title}
          </Text>
        ) : (
          <View style={styles.titleContainer}>{title}</View>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onRightIconPress}
          style={styles.iconContainer}
        >
          {rightIcon || <View style={{ width: 24 * scale }} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: "100%",
      paddingHorizontal: 16 * scale,
      // paddingVertical: 12 * scale,
      backgroundColor: theme.headerTab,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.borderColor,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    iconContainer: {
      width: 35 * scale,
      height: 35 * scale,
      justifyContent: "center",
      alignItems: "center",
    },
    titleContainer: {
      flex: 1,
      justifyContent: "center",
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontWeight: "600",
      fontSize: 18 * scale,
    },
  });