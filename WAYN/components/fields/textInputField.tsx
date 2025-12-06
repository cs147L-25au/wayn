import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../assets/theme';

interface TextInputFieldProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  leftContent,
  rightContent,
  ...textInputProps
}) => {
  return (
    <View style={styles.container}>
      {leftContent}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
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

export default TextInputField;