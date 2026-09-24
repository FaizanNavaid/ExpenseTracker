import React from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useTheme } from "../../services/utils/theme/useTheme";
import { RootState } from "../../config/redux/store/store";

const AppStatusBar: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const appliedBarStyle = isDarkMode ? "light-content" : "dark-content";

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={appliedBarStyle}
      />
      <View
        style={[
          styles.bar,
          { height: insets.top, backgroundColor: theme.headerTab },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
});

export default AppStatusBar;