import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { theme } from '../assets/theme'

interface LocationListItemProps {
  locationName: string;
  address: string;
  distance?: string; // ← Made optional
  categoryIconUrl: string | ImageSourcePropType | number;
  onPress?: () => void;
}

const LocationListItem: React.FC<LocationListItemProps> = ({
  locationName,
  address,
  distance,
  categoryIconUrl,
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
          {locationName}
        </Text>
        <Text 
          style={styles.address}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {address}
        </Text>
        {distance && ( // ← Only render if distance exists
          <Text 
            style={styles.distance}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {distance}
          </Text>
        )}
      </View>

      {/* Category Icon */}
      <Image 
        source={iconSource}
        style={styles.categoryIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md, // 16
  },
  infoColumn: {
    flex: 1,
    gap: theme.spacing.xs, // 4
  },
  name: {
    ...theme.text.body3Bold,
  },
  address: {
    ...theme.text.body3,
    color: theme.colors.textPrimary,
  },
  distance: {
    ...theme.text.body3,
    color: theme.colors.textSecondary,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
  },
});

export default LocationListItem;