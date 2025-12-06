export type StickerKey = "heart" | "star" | "smile" | "glitter";

export const stickers: Record<StickerKey, any> = {
  heart: require("./heart.png"),
  star: require("./star.png"),
  smile: require("./smile.png"),
  glitter: require("./glitter.png"),
};
