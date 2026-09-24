import { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../services/utils/theme/useTheme';

interface AppSafeWrapperProps {
  children: ReactNode;
}
export default function AppSafeWrapper({ children }: AppSafeWrapperProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.mainBg,
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
