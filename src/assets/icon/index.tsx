import React from "react";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { Dimensions } from "react-native";
import { useTheme } from "../../services/utils/theme/useTheme";

const { width } = Dimensions.get("window");
const scale = width / 375;

interface IconProps {
  name: string;
  color?: string;
  size?: number;
}

export default function AppIcon({ name, color, size = 20 }: IconProps) {
  const theme = useTheme();
  const adjustedSize = Math.round(size * scale);

  return (
    <MaterialIcons
      name={name as any}
      size={adjustedSize}
      color={color || theme.textPrimary}
      allowFontScaling={false}
    />
  );
}