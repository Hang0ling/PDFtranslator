
export enum PageSize {
  A4 = 'a4',
  LETTER = 'letter',
  LEGAL = 'legal',
  ADAPTIVE = 'adaptive'
}

export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

export type ThemeType = 'default' | 'professional' | 'academic' | 'modern' | 'elegant';

export interface PDFSettings {
  pageSize: PageSize;
  orientation: Orientation;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  lineHeight: number;
  fontSize: number;
  theme: ThemeType;
}