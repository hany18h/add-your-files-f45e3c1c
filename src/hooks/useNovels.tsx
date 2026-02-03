import { useState, useEffect, useCallback } from 'react';

export interface Novel {
  id: string;
  title: string;
  cover_url: string | null;
  description: string | null;
  author: string | null;
  genre: string[] | null;
  status: 'ongoing' | 'completed';
  is_official: boolean;
  is_must_read: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  novel_id: string;
  number: number;
  title: string;
  content_en: string | null;
  content_id: string | null;
  epub_en_url: string | null;
  epub_id_url: string | null;
  created_at: string;
  updated_at: string;
}

const NOVELS_STORAGE_KEY = 'novels_data';
const CHAPTERS_STORAGE_KEY = 'chapters_data';

export function getNovelsFromStorage(): Novel[] {
  const stored = localStorage.getItem(NOVELS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveNovelsToStorage(novels: Novel[]) {
  localStorage.setItem(NOVELS_STORAGE_KEY, JSON.stringify(novels));
}

export function getChaptersFromStorage(): Chapter[] {
  const stored = localStorage.getItem(CHAPTERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveChaptersToStorage(chapters: Chapter[]) {
  localStorage.setItem(CHAPTERS_STORAGE_KEY, JSON.stringify(chapters));
}

export function addNovel(novel: Omit<Novel, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Novel {
  const novels = getNovelsFromStorage();
  const newNovel: Novel = {
    ...novel,
    id: Date.now().toString(),
    is_must_read: (novel as any).is_must_read ?? false,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  novels.push(newNovel);
  saveNovelsToStorage(novels);
  return newNovel;
}

export function updateNovel(id: string, updates: Partial<Novel>): Novel | null {
  const novels = getNovelsFromStorage();
  const index = novels.findIndex(n => n.id === id);
  if (index === -1) return null;
  
  novels[index] = { ...novels[index], ...updates, updated_at: new Date().toISOString() };
  saveNovelsToStorage(novels);
  return novels[index];
}

export function updateChapter(id: string, updates: Partial<Chapter>): Chapter | null {
  const chapters = getChaptersFromStorage();
  const index = chapters.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  chapters[index] = { ...chapters[index], ...updates, updated_at: new Date().toISOString() };
  saveChaptersToStorage(chapters);
  return chapters[index];
}

export function deleteNovel(id: string): boolean {
  const novels = getNovelsFromStorage();
  const filtered = novels.filter(n => n.id !== id);
  if (filtered.length === novels.length) return false;
  
  saveNovelsToStorage(filtered);
  
  const chapters = getChaptersFromStorage();
  saveChaptersToStorage(chapters.filter(c => c.novel_id !== id));
  
  return true;
}

export function addChapters(novelId: string, newChapters: Omit<Chapter, 'id' | 'novel_id' | 'created_at' | 'updated_at'>[]): Chapter[] {
  const chapters = getChaptersFromStorage();
  const addedChapters: Chapter[] = newChapters.map((ch, index) => ({
    ...ch,
    id: `${novelId}_${Date.now()}_${index}`,
    novel_id: novelId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  
  chapters.push(...addedChapters);
  saveChaptersToStorage(chapters);
  return addedChapters;
}

export function getChaptersByNovelId(novelId: string): Chapter[] {
  const chapters = getChaptersFromStorage();
  return chapters.filter(c => c.novel_id === novelId).sort((a, b) => a.number - b.number);
}

export function incrementViewCount(id: string) {
  const novels = getNovelsFromStorage();
  const index = novels.findIndex(n => n.id === id);
  if (index !== -1) {
    novels[index].view_count = (novels[index].view_count || 0) + 1;
    saveNovelsToStorage(novels);
    window.dispatchEvent(new Event('novelsUpdated'));
  }
}

export function useNovels() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNovels = useCallback(() => {
    setNovels(getNovelsFromStorage());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNovels();
    
    const handleStorageChange = () => {
      fetchNovels();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('novelsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('novelsUpdated', handleStorageChange);
    };
  }, [fetchNovels]);

  return { novels, loading, error, refetch: fetchNovels };
}

export function useNovelDetails(id: string) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const novels = getNovelsFromStorage();
    const found = novels.find(n => n.id === id);
    setNovel(found || null);
    
    if (found) {
      setChapters(getChaptersByNovelId(id));
    }
    
    setLoading(false);
  }, [id]);

  return { novel, chapters, loading, error };
}
