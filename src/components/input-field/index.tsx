import React, { forwardRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
  TextInputProps,
} from "react-native";
import { useTheme } from "../../services/utils/theme/useTheme";

const { width } = Dimensions.get("window");
const scale = width / 375;

interface InputFieldProps extends TextInputProps {
  value?: string;
  placeholder?: string;
  hasError?: boolean;
  onChangeText?: (text: string) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIconOnPress?: () => void;
  rightIconOnPress?: () => void;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  borderRadius?: number;
  label?: string;
  labelColor?: string;
  labelSize?: number;
  height?: number;
  forceBorderColor?: string;
}

const InputField = forwardRef<TextInput, InputFieldProps>((props, ref) => {
  const theme = useTheme();

  const {
    value,
    placeholder,
    onChangeText,
    leftIcon,
    forceBorderColor,
    rightIcon,
    leftIconOnPress,
    rightIconOnPress,
    backgroundColor,
    textColor,
    fontSize = 14 * scale,
    borderRadius = 8 * scale,
    label,
    labelColor,
    labelSize,
    style,
    height = 48 * scale,
    hasError,
    ...rest
  } = props;

  const styles = getStyles();

  const appliedBorderColor = forceBorderColor
    ? forceBorderColor
    : hasError
    ? theme.error
    : value && value.trim()
    ? theme.primary
    : theme.borderColor;

  return (
    <View>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: labelColor || theme.textSecondary,
              fontSize: labelSize || 13 * scale,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.container,
          {
            borderColor: appliedBorderColor,
            borderRadius,
            backgroundColor: backgroundColor || theme.surfaceLight,
            height,
          },
        ]}
      >
        {leftIcon ? (
          <TouchableOpacity onPress={leftIconOnPress} activeOpacity={0.7} style={styles.iconContainer}>
            {leftIcon}
          </TouchableOpacity>
        ) : null}

        <TextInput
          ref={ref}
          style={[
            styles.textInput,
            { color: textColor || theme.textPrimary, fontSize },
            style,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholderColor}
          value={value}
          onChangeText={onChangeText}
          {...rest}
        />

        {rightIcon ? (
          <TouchableOpacity onPress={rightIconOnPress} activeOpacity={0.7} style={styles.iconContainer}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
});

const getStyles = () =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      paddingHorizontal: 12 * scale,
    },
    textInput: {
      flex: 1,
      paddingVertical: 0,
    },
    iconContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4 * scale,
    },
    label: {
      marginBottom: 3 * scale,
    },
  });

export default InputField;