import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Novel } from './useNovels';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds([]);
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Get favorite IDs
    const { data: favData, error: favError } = await supabase
      .from('favorites')
      .select('novel_id')
      .eq('user_id', user.id);
    
    if (favError) {
      console.error('Error loading favorites:', favError);
      setLoading(false);
      return;
    }

    const ids = favData?.map(f => f.novel_id) || [];
    setFavoriteIds(ids);

    if (ids.length > 0) {
      // Get full novel data for favorites
      const { data: novelsData, error: novelsError } = await supabase
        .from('novels')
        .select('*')
        .in('id', ids);
      
      if (novelsError) {
        console.error('Error loading favorite novels:', novelsError);
      } else {
        setFavorites(novelsData || []);
      }
    } else {
      setFavorites([]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback((novelId: string) => {
    return favoriteIds.includes(novelId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (novelId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const isCurrentlyFavorite = favoriteIds.includes(novelId);

    if (isCurrentlyFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('novel_id', novelId);
      
      if (error) {
        console.error('Error removing favorite:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          novel_id: novelId,
        });
      
      if (error) {
        console.error('Error adding favorite:', error);
        return { success: false, error: error.message };
      }
    }

    // Refresh favorites
    await loadFavorites();
    return { success: true };
  }, [user, favoriteIds, loadFavorites]);

  return { favoriteIds, favorites, loading, isFavorite, toggleFavorite, refetch: loadFavorites };
}
