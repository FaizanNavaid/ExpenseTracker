import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../services/utils/theme/useTheme';

const { width, height } = Dimensions.get('window');
const scale = width / 375;

interface FullScreenLoaderProps {
  visible?: boolean;
  loaderColor?: string;
  backgroundOpacity?: number;
  text?: string | any;
  color?: string;
}

export default function FullScreenLoader(props: FullScreenLoaderProps) {
  const theme = useTheme();

  const {
    visible = false,
    loaderColor,
    backgroundOpacity = 0.3,
    text,
    color,
  } = props;

  const appliedLoaderColor = loaderColor || theme.white;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={[
            styles.overlay,
            { backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})` },
          ]}
        >
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={40 * scale} color={appliedLoaderColor} />
            {text && (
              <Text
                style={[styles.loaderText, { color: color || theme.white }]}
              >
                {text}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
