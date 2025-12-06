import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../assets/theme';

interface SelectableButtonProps {
  amount: number;
  isSelected: boolean;
  onPress: () => void;
}

const SelectableButton: React.FC<SelectableButtonProps> = ({
  amount,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSelected && styles.buttonSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.buttonText,
        isSelected && styles.buttonTextSelected,
      ]}>
        ${amount}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  buttonSelected: {
    backgroundColor: theme.colors.black,
  },
  buttonText: {
    ...theme.text.body2Bold,
    color: theme.colors.black,
  },
  buttonTextSelected: {
    color: theme.colors.white,
  },
});

export default SelectableButton;