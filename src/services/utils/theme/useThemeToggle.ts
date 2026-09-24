import { useAppDispatch, useAppSelector } from "../../../config/redux/hooks/hooks";
import { toggleTheme } from "../../../config/redux/slices/themeSlice";
import { storeData } from "../../helper/helper";

export const useThemeToggle = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  const toggle = () => {
    const next = !isDarkMode;
    dispatch(toggleTheme());
    storeData("themeMode", next ? "dark" : "light");
  };

  return { isDarkMode, toggle };
};
