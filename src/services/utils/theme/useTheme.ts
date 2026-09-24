import { useSelector } from "react-redux";
import { lightTheme, darkTheme, ThemeType } from "../colors/colors";
import { RootState } from "../../../config/redux/store/store";

export const useTheme = (): ThemeType => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  return isDarkMode ? darkTheme : lightTheme;
};