export const theme = {
  colors: {
    white: "#FFFFFF",
    waynOrange: "#FF6B54",
    waynOrangeMedium: "#FFAFA3",
    waynOrangeLight: "#FFE3DF",
    waynBlue: "#626AFF",
    waynBlueMedium: "#ADB1FF",
    waynBlueLight: "#E6E8FF",
    black: "#212121",

    textPrimary: "#212121",
    textSecondary: "#B9B8B9",

    iconPrimary: "#212121",
    iconSecondary: "#9D9D9D",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  iconSize: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 56,
    xxl: 64,
  },

  typography: {
    weights: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
    },
  },

  borderRadius: {
    sm: 16,
    md: 24,
    lg: 32,
    round: 9999,
  },

  text: {
    headline1: {
      width: "100%",
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },

    headline2: {
      width: "100%",
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },
    headline3: {
      width: "100%",
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },
    headline4: {
      width: "100%",
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: "Poppins-Regular",
      color: "#212121",
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "Poppins-Regular",
      color: "#212121",
    },
    body3: {
      fontSize: 12,
      lineHeight: 18,
      fontFamily: "Poppins-Regular",
      color: "#212121",
    },
    body1Bold: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },
    body2Bold: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },
    body3Bold: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },
    buttonlarge: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },
    buttonMedium: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },
    buttonSmall: {
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: "#212121",
    },
    fieldsMedium: {
      width: "100%",
      fontSize: 16,
      lineHeight: 24,
      fontFamily: "Poppins-Regular",
      color: "#212121",
    },
    fieldsSmall: {
      width: "100%",
      fontSize: 12,
      lineHeight: 16,
      fontFamily: "Poppins-Regular",
      color: "#212121",
    },
  },
} as const;

export type Theme = typeof theme;
