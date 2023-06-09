// Pocketbase LogBook

interface PageData {
  id: string;
  collectionId: string;
  file: File;
  pageNumber: number;
  template: number;
  classroom: string;
}

interface TextData {
  id: string;
  content: string;
  slot: number;
  page: string;
  signature: string;
}

interface DrawData {
  id: string;
  collectionId: string;
  file: File;
  slot: number;
  page: string;
  signature: string;
  classroom: string;
}

interface StickerData {
  id: string;
  page: string;
  slot: number;
  idSticker: number;
}

interface PhotoData {
  id: string;
  collectionId: string;
  file: File;
  slot: number;
  page: string;
  classroom: string;
  created: string;
}

interface ChapterData {
  [key: string]: any;
}

interface GameData {
  [key: string]: any;
}

export type { PageData, TextData, DrawData, StickerData, PhotoData, ChapterData, GameData };
