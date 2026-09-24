import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/custom-header';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../services/utils/theme/useTheme';
import { Dimensions, StyleSheet, View } from 'react-native';
import AppStatusBar from '../../../components/app-status-bar';
import { AppIcons } from '../../../services/helper/iconName';
import AppIcon from '../../../assets/icon';
import { useNavigation } from '@react-navigation/native';
const { width } = Dimensions.get('window');
const scale = width / 375;

export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <CustomHeader
          title={t('home.title')}
          leftIcon={<AppIcon name={AppIcons.menu} color={theme.black} />}
          onLeftIconPress={() => navigation.openDrawer()}
        />
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
