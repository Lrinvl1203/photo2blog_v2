
export interface ImageRecord {
  id: string;
  src: string; // base64 data URI
  prompt: string;
  timestamp: number;
}

export type AppView = 'HOME' | 'GENERATING' | 'RESULT' | 'HISTORY';
