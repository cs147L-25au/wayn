import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { theme } from '../assets/theme';

interface GiftCardRendererProps {
  designId: string;
  amount: string | number;
  merchantName?: string;
  style?: any;
}

const giftCardDesigns: Record<string, ImageSourcePropType> = {
  design1: require('../assets/images/floral_card.png'),
  design2: require('../assets/images/geometric_card.png'),
};

const GiftCardRenderer: React.FC<GiftCardRendererProps> = ({
  designId,
  amount,
  merchantName,
  style,
}) => {
  const formattedAmount = typeof amount === 'string' 
    ? parseFloat(amount).toFixed(2) 
    : amount.toFixed(2);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={giftCardDesigns[designId] || giftCardDesigns.design1}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        {merchantName && (
          <Text style={styles.merchantName}>{merchantName}</Text>
        )}
        <View style={styles.amountContainer}>
          <Text style={styles.dollarSign}>$</Text>
          <Text style={styles.amount}>{formattedAmount}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  merchantName: {
    ...theme.text.headline3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    textShadowColor: theme.colors.white,
    textShadowOffset: { width: -1, height: -1 },
    textShadowRadius: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  dollarSign: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginRight: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});

export default GiftCardRenderer;