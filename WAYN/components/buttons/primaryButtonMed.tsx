import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { theme } from '../../assets/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  leftIcon?: string | ImageSourcePropType | number;
  rightIcon?: string | ImageSourcePropType | number;
}

const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  leftIcon,
  rightIcon,
}) => {
  const getIconSource = (icon: string | ImageSourcePropType | number) => {
    return typeof icon === 'string' ? { uri: icon } : icon;
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {leftIcon && (
        <Image 
          source={getIconSource(leftIcon)}
          style={styles.icon}
        />
      )}
      <Text style={styles.text}>{title}</Text>
      {rightIcon && (
        <Image 
          source={getIconSource(rightIcon)}
          style={styles.icon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg, // 24
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm, // 8
    borderRadius: 36,
    backgroundColor: theme.colors.waynOrange,
  },
  text: {
    ...theme.text.buttonMedium,
    color: theme.colors.white,
  },
  icon: {
    width: 16,
    height: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default PrimaryButton;