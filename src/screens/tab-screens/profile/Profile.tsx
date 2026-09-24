import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/custom-header';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../services/utils/theme/useTheme';
import { Dimensions, StyleSheet, View } from 'react-native';
import AppStatusBar from '../../../components/app-status-bar';

const { width } = Dimensions.get('window');
const scale = width / 375;

export default function Profile() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <CustomHeader title={t('profile.title')} />
        <AppStatusBar />
        <View style={styles.container}></View>
      </SafeAreaView>
    </>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.mainBg,
      paddingHorizontal: 16 * scale,
    },
  });
