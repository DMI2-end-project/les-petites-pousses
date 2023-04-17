// Pocketbase LogBook

interface PageData {
  id: string;
  collectionId: string;
  file: File;
  pageNumber: number;
  template: number;
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
}

interface StickerData {
  id: string;
  page: number;
  slot: string;
  idSticker: number;
}

interface PhotoData {
  id: string;
  collectionId: string;
  file: File;
  slot: number;
  page: string;
}

export type { PageData, TextData, DrawData, StickerData, PhotoData };
