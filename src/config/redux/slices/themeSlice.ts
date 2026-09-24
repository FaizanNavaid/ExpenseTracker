import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getStorage } from "../../../services/helper/helper";

interface ThemeState {
  isDarkMode: boolean;
  colorScheme: "light" | "dark";
}

const getPersistedIsDarkMode = (): boolean => {
  try {
    const storage = getStorage();
    return storage?.getString("themeMode") === "dark";
  } catch {
    return false;
  }
};

const persistedIsDarkMode = getPersistedIsDarkMode();

const initialState: ThemeState = {
  isDarkMode: persistedIsDarkMode,
  colorScheme: persistedIsDarkMode ? "dark" : "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      state.colorScheme = action.payload ? "dark" : "light";
    },
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      state.colorScheme = state.isDarkMode ? "dark" : "light";
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;