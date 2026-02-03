export interface Novel {
  id: string;
  title: string;
  cover: string;
  description?: string;
  author?: string;
  genre?: string[];
  status?: 'ongoing' | 'completed';
  chapters: Chapter[];
  languages: ('en' | 'id')[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: {
    en?: string;
    id?: string;
  };
}

export type ReadingMode = 'vertical' | 'horizontal';
export type Language = 'en' | 'id';
