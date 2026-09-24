import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { SCREENS } from '../screen-names/ScreenName';
import Home from '../../../screens/tab-screens/home/Home';
import Profile from '../../../screens/tab-screens/profile/Profile';
import CustomTabBar from '../../../components/tab-bar';
import AddExpense from '../../../screens/tab-screens/add-expense/AddExpense';

export default function TabNavigation() {
  const { t } = useTranslation();
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'shift',
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={Home}
        options={{ tabBarLabel: t('tabs.home') }}
      />
      <Tab.Screen
        name={SCREENS.ADD_EXPENSE}
        component={AddExpense}
        options={{ tabBarLabel: t('tabs.addExpense') }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        component={Profile}
        options={{ tabBarLabel: t('tabs.profile') }}
      />
    </Tab.Navigator>
  );
}
