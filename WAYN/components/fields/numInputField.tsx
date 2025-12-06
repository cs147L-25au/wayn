import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../assets/theme';

interface NumberInputFieldProps extends Omit<TextInputProps, 'style' | 'keyboardType'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  allowDecimals?: boolean;
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  leftContent,
  rightContent,
  allowDecimals = false,
  ...textInputProps
}) => {
  const handleChange = (text: string) => {
    if (allowDecimals) {
      // Allow numbers and decimal point
      const cleaned = text.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = cleaned.split('.');
      const formatted = parts.length > 2 
        ? parts[0] + '.' + parts.slice(1).join('') 
        : cleaned;
      onChangeText(formatted);
    } else {
      // Only allow numbers
      const cleaned = text.replace(/[^0-9]/g, '');
      onChangeText(cleaned);
    }
  };

  return (
    <View style={styles.container}>
      {leftContent}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType={allowDecimals ? 'decimal-pad' : 'number-pad'}
        {...textInputProps}
      />
      {rightContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E9',
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    ...theme.text.body1,
    color: theme.colors.textPrimary,
  },
});

export default NumberInputField;