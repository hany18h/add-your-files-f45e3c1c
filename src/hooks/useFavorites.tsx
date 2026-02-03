import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Novel, getNovelsFromStorage } from './useNovels';

const FAVORITES_STORAGE_KEY = 'user_favorites_';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(() => {
    if (!user) {
      setFavoriteIds([]);
      setFavorites([]);
      setLoading(false);
      return;
    }

    const key = `${FAVORITES_STORAGE_KEY}${user.id}`;
    const stored = localStorage.getItem(key);
    const ids = stored ? JSON.parse(stored) : [];
    setFavoriteIds(ids);

    const allNovels = getNovelsFromStorage();
    const favNovels = allNovels.filter(n => ids.includes(n.id));
    setFavorites(favNovels);
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

    const key = `${FAVORITES_STORAGE_KEY}${user.id}`;
    const stored = localStorage.getItem(key);
    let ids: string[] = stored ? JSON.parse(stored) : [];

    const isCurrentlyFavorite = ids.includes(novelId);

    if (isCurrentlyFavorite) {
      ids = ids.filter(id => id !== novelId);
    } else {
      ids = [...ids, novelId];
    }

    localStorage.setItem(key, JSON.stringify(ids));
    setFavoriteIds(ids);
    
    const allNovels = getNovelsFromStorage();
    setFavorites(allNovels.filter(n => ids.includes(n.id)));

    return { success: true };
  }, [user]);

  return { favoriteIds, favorites, loading, isFavorite, toggleFavorite, refetch: loadFavorites };
}
