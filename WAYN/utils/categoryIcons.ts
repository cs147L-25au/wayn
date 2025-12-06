import { ImageSourcePropType } from 'react-native';

export type LocationCategory = 
  | "outdoors"
  | "cafe"
  | "restaurant"
  | "activity"
  | "shopping"
  | "school"
  | "residence";

export const categoryIcons: Record<LocationCategory, ImageSourcePropType> = {
  outdoors: require('../assets/images/outdoors_icon.png'),
  cafe: require('../assets/images/cafe_icon.png'),
  restaurant: require('../assets/images/restaurant_icon.png'),
  activity: require('../assets/images/activity_icon.png'),
  shopping: require('../assets/images/shopping_icon.png'),
  school: require('../assets/images/school_icon.png'),
  residence: require('../assets/images/residence_icon.png'),
};

export const getCategoryIcon = (category: LocationCategory): ImageSourcePropType => {
  return categoryIcons[category];
};