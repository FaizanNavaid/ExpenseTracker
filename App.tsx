import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { store } from './src/config/redux/store/store';
import AppNavigation from './src/config/navigation/stack-navigation/AppNavigation';
import AppSafeWrapper from './src/components/app-safe-wrapper';
import './src/config/localization/i18n';
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <Provider store={store}>
            <AppSafeWrapper>
              <AppNavigation />
            </AppSafeWrapper>
            <Toast position='bottom'/>
          </Provider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
