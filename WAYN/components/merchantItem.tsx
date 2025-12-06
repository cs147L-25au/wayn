import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../assets/theme';

interface MerchantItemProps {
  merchantName: string;
  relevanceTag: string;
  categoryIconUrl: string | ImageSourcePropType | number;
  isSelected: boolean;
  onPress: () => void;
}

const MerchantItem: React.FC<MerchantItemProps> = ({
  merchantName,
  relevanceTag,
  categoryIconUrl,
  isSelected,
  onPress,
}) => {
  const iconSource = typeof categoryIconUrl === 'string' 
    ? { uri: categoryIconUrl } 
    : categoryIconUrl;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Info Column */}
      <View style={styles.infoColumn}>
        <Text 
          style={styles.name}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {merchantName}
        </Text>
        <Text 
          style={styles.relevanceTag}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {relevanceTag}
        </Text>
      </View>

      {/* Category Icon or Checkmark */}
      {isSelected ? (
        <View style={styles.checkmarkContainer}>
          <Feather name="check" size={20} color={theme.colors.waynOrange} />
        </View>
      ) : (
        <Image 
          source={iconSource}
          style={styles.categoryIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  infoColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.text.body3Bold,
  },
  relevanceTag: {
    ...theme.text.body3,
    color: theme.colors.textSecondary,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
    backgroundColor: '#FFF4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MerchantItem;