// types.ts
import type { StickerKey } from "../assets/stickers";

export type TextBlock = {
  id: string;
  type: "text";
  content: string;
};

export type ImageBlock = {
  id: string;
  type: "image";
  content: string; // uri
  aspectRatio: number;
};

export type StickerBlock = {
  id: string;
  type: "sticker";
  content: StickerKey;
  size: number;
  x: number;
  y: number;
  rotation: number;
};

export type DrawPoint = {
  x: number;
  y: number;
};

export type DrawStroke = {
  id: string;
  color: string;
  thickness: number;
  points: DrawPoint[];
};

export type DrawBlock = {
  id: string;
  type: "draw";
  strokes: DrawStroke[];
};

export type LetterBlock = TextBlock | ImageBlock | StickerBlock | DrawBlock;
