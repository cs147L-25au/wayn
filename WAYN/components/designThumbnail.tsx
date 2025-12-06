import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet, ImageSourcePropType } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../assets/theme';

interface DesignThumbnailProps {
  imageSource?: ImageSourcePropType;
  label: string;
  isSelected: boolean;
  isCreateNew?: boolean;
  onPress: () => void;
}

const DesignThumbnail: React.FC<DesignThumbnailProps> = ({
  imageSource,
  label,
  isSelected,
  isCreateNew = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.thumbnail,
        isSelected && styles.thumbnailSelected,
        isCreateNew && styles.thumbnailCreateNew,
      ]}>
        {isCreateNew ? (
          <Feather name="plus" size={32} color={theme.colors.textSecondary} />
        ) : (
          <Image source={imageSource!} style={styles.image} />
        )}
      </View>
      <Text style={[
        theme.text.body3,
        styles.label,
        isSelected && styles.labelSelected,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailSelected: {
    borderColor: theme.colors.waynOrange,
  },
  thumbnailCreateNew: {
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  label: {
    color: theme.colors.textSecondary,
  },
  labelSelected: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});

export default DesignThumbnail;