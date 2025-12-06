import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, ImageSourcePropType, View } from 'react-native';
import { theme } from '../../assets/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  leftIcon?: string | ImageSourcePropType | number | ReactNode;
  rightIcon?: string | ImageSourcePropType | number | ReactNode;
}

const SecondaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  leftIcon,
  rightIcon,
}) => {
  const getIconSource = (icon: string | ImageSourcePropType | number) => {
    return typeof icon === 'string' ? { uri: icon } : icon;
  };

  const renderIcon = (icon: string | ImageSourcePropType | number | ReactNode) => {
    // If it's a React component (like Feather icon), render it directly
    if (React.isValidElement(icon)) {
      return icon;
    }
    // Otherwise, treat it as an image source
    return (
      <Image 
        source={getIconSource(icon as string | ImageSourcePropType | number)}
        style={styles.icon}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {leftIcon && renderIcon(leftIcon)}
      <Text style={styles.text}>{title}</Text>
      {rightIcon && renderIcon(rightIcon)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md, // 16
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm, // 8
    borderRadius: 36,
    borderWidth: 2,
    borderColor: theme.colors.waynOrange, // #FF6B54
    backgroundColor: theme.colors.white, // #FFF
  },
  text: {
    ...theme.text.buttonMedium,
    color: theme.colors.waynOrange,
  },
  icon: {
    width: 16,
    height: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default SecondaryButton;