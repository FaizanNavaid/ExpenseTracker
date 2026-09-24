import { combineReducers, configureStore } from "@reduxjs/toolkit";
import themeReducer from "../slices/themeSlice";
import localizationReducer from "../slices/localizationSlice";

const appReducer = combineReducers({
  theme: themeReducer,
  localization: localizationReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "USER_LOGOUT") {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;