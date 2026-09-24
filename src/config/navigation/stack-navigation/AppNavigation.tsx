import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { SCREENS } from '../screen-names/ScreenName';
import { useAppSelector } from '../../redux/hooks/hooks';
import { useTheme } from '../../../services/utils/theme/useTheme';
import Splash from '../../../screens/stack-screen/splash/Splash';
import Onboarding from '../../../screens/stack-screen/onboarding/OnBoarding';
import Login from '../../../auth/login/Login';
import SignUp from '../../../auth/signup/SignUp';
import ForgotPassword from '../../../auth/forgot-password/ForgetotPassword';
import ResetPassword from '../../../auth/reset-password/ResetPassword';
import Otp from '../../../auth/otp-screen/Otp';
import DrawerNavigation from '../drawer-navigation/DrawerNavigation';

export default function AppNavigation() {
  const Stack = createNativeStackNavigator();
  const theme = useTheme();
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    dark: isDarkMode,
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.mainBg,
      card: theme.headerTab,
      text: theme.textPrimary,
      border: theme.borderColor,
      notification: theme.error,
    },
  };

  return (
    <>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={SCREENS.SPLASH} component={Splash} />
          <Stack.Screen name={SCREENS.ONBOARDING} component={Onboarding} />
          {/* Auth */}
          <Stack.Screen name={SCREENS.SIGN_UP} component={SignUp} />
          <Stack.Screen name={SCREENS.LOGIN} component={Login} />
          <Stack.Screen
            name={SCREENS.FORGOT_PASSWORD}
            component={ForgotPassword}
          />
          <Stack.Screen
            name={SCREENS.RESET_PASSWORD}
            component={ResetPassword}
          />
          <Stack.Screen name={SCREENS.VERIFY_OTP} component={Otp} />
          {/* DashBoard */}
          <Stack.Screen name={SCREENS.HOME} component={DrawerNavigation}  />

        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
