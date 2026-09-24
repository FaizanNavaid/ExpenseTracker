import {
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { SCREENS } from '../screen-names/ScreenName';
import TabNavigation from '../tab-navigation/TabNavigation';
import Setting from '../../../screens/drawer-screens/setting/Setting';
import Privacy from '../../../screens/drawer-screens/privacy/Privacy';
import DrawerContent from '../../../components/drawer-content';

export default function DrawerNavigation() {
  const Drawer = createDrawerNavigator();

  return (
    <>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          // 'front': drawer overlays on top of the screen; the screen itself
          // stays fixed in place instead of sliding/pushing with the drawer.
          drawerType: 'front',
          overlayColor: 'rgba(0,0,0,0.4)',
          drawerStyle: {
            width:'70%'
          }
        }}
        
      >
        <Drawer.Screen name={SCREENS.TABS} component={TabNavigation} />
        <Drawer.Screen name={SCREENS.SETTINGS} component={Setting} />
        <Drawer.Screen name={SCREENS.PRIVACY} component={Privacy} />
      </Drawer.Navigator>
    </>
  );
}
