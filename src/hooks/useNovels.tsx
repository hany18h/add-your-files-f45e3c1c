import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Novel = Tables<'novels'>;
export type Chapter = Tables<'chapters'>;

export async function addNovel(novel: Omit<TablesInsert<'novels'>, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<Novel | null> {
  const { data, error } = await supabase
    .from('novels')
    .insert({
      ...novel,
      view_count: 0,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding novel:', error);
    return null;
  }
  
  window.dispatchEvent(new Event('novelsUpdated'));
  return data;
}

export async function updateNovel(id: string, updates: TablesUpdate<'novels'>): Promise<Novel | null> {
  const { data, error } = await supabase
    .from('novels')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating novel:', error);
    return null;
  }
  
  window.dispatchEvent(new Event('novelsUpdated'));
  return data;
}

export async function updateChapter(id: string, updates: TablesUpdate<'chapters'>): Promise<Chapter | null> {
  const { data, error } = await supabase
    .from('chapters')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating chapter:', error);
    return null;
  }
  
  return data;
}

export async function deleteNovel(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('novels')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting novel:', error);
    return false;
  }
  
  window.dispatchEvent(new Event('novelsUpdated'));
  return true;
}

export async function addChapters(
  novelId: string, 
  newChapters: Omit<TablesInsert<'chapters'>, 'id' | 'novel_id' | 'created_at' | 'updated_at'>[]
): Promise<Chapter[]> {
  const chaptersToInsert = newChapters.map(ch => ({
    ...ch,
    novel_id: novelId,
  }));

  const { data, error } = await supabase
    .from('chapters')
    .insert(chaptersToInsert)
    .select();
  
  if (error) {
    console.error('Error adding chapters:', error);
    return [];
  }
  
  return data || [];
}

export async function getChaptersByNovelId(novelId: string): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('novel_id', novelId)
    .order('number', { ascending: true });
  
  if (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
  
  return data || [];
}

export async function incrementViewCount(id: string) {
  const { data: novel } = await supabase
    .from('novels')
    .select('view_count')
    .eq('id', id)
    .single();

  if (novel) {
    await supabase
      .from('novels')
      .update({ view_count: (novel.view_count || 0) + 1 })
      .eq('id', id);
    
    window.dispatchEvent(new Event('novelsUpdated'));
  }
}

export function useNovels() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNovels = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching novels:', error);
      setError(error.message);
    } else {
      setNovels(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNovels();
    
    const handleUpdate = () => {
      fetchNovels();
    };
    
    window.addEventListener('novelsUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('novelsUpdated', handleUpdate);
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
    async function fetchData() {
      setLoading(true);
      
      const { data: novelData, error: novelError } = await supabase
        .from('novels')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (novelError) {
        console.error('Error fetching novel:', novelError);
        setError(novelError.message);
        setLoading(false);
        return;
      }
      
      setNovel(novelData);
      
      if (novelData) {
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('novel_id', id)
          .order('number', { ascending: true });
        
        if (chaptersError) {
          console.error('Error fetching chapters:', chaptersError);
        } else {
          setChapters(chaptersData || []);
        }
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [id]);

  return { novel, chapters, loading, error };
}
