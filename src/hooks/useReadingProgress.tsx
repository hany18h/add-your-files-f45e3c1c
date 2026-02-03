import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type ReadingProgress = Tables<'reading_progress'>;

export function useReadingProgress(novelId?: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [allProgress, setAllProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!user) {
      setProgress(null);
      setAllProgress([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (novelId) {
      // Load progress for specific novel
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('novel_id', novelId)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading reading progress:', error);
      } else {
        setProgress(data);
      }
    } else {
      // Load all reading progress
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });
      
      if (error) {
        console.error('Error loading all reading progress:', error);
      } else {
        setAllProgress(data || []);
      }
    }

    setLoading(false);
  }, [user, novelId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const updateProgress = useCallback(async (
    targetNovelId: string,
    chapterId: string,
    scrollPosition: number = 0
  ) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: existing } = await supabase
      .from('reading_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('novel_id', targetNovelId)
      .maybeSingle();

    if (existing) {
      // Update existing progress
      const { error } = await supabase
        .from('reading_progress')
        .update({
          chapter_id: chapterId,
          scroll_position: scrollPosition,
          last_read_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      
      if (error) {
        console.error('Error updating reading progress:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Insert new progress
      const { error } = await supabase
        .from('reading_progress')
        .insert({
          user_id: user.id,
          novel_id: targetNovelId,
          chapter_id: chapterId,
          scroll_position: scrollPosition,
        });
      
      if (error) {
        console.error('Error inserting reading progress:', error);
        return { success: false, error: error.message };
      }
    }

    await loadProgress();
    return { success: true };
  }, [user, loadProgress]);

  return { progress, allProgress, loading, updateProgress, refetch: loadProgress };
}
