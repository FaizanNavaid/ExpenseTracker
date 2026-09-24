import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LocalizationState {
  language: "en" | "ur";
}

const initialState: LocalizationState = {
  language: "en",
};

const localizationSlice = createSlice({
  name: "localization",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<"en" | "ur">) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = localizationSlice.actions;
export default localizationSlice.reducer;