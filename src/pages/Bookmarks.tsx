import { Link } from 'react-router-dom';
import { Heart, Home, Bookmark, Search, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';

const Bookmarks = () => {
  const { user } = useAuth();
  const { favorites, loading } = useFavorites();

  if (!user) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="flex items-center justify-center h-14 px-4">
            <h1 className="font-bold text-gray-800">Bookmarks</h1>
          </div>
        </header>
        
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold mb-2">Sign in to see your bookmarks</h2>
          <p className="text-gray-500 mb-6">Save your favorite novels to read later</p>
          <Link
            to="/auth"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Sign In
          </Link>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <Link to="/" className="bottom-nav-item">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to="/bookmarks" className="bottom-nav-item active">
              <Bookmark className="w-5 h-5" />
              <span>Bookmarks</span>
            </Link>
            <Link to="/search" className="bottom-nav-item">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </Link>
            <Link to="/auth" className="bottom-nav-item">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </div>
        </nav>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="font-bold text-gray-800">Bookmarks</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-gray-500">Start adding novels to your bookmarks!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {favorites.map((novel) => (
              <Link
                key={novel.id}
                to={`/novel/${novel.id}`}
                className="block"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                    alt={novel.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="text-[10px] font-medium text-gray-700 mt-1 line-clamp-2">
                  {novel.title}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link to="/" className="bottom-nav-item">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link to="/bookmarks" className="bottom-nav-item active">
            <Bookmark className="w-5 h-5" />
            <span>Bookmarks</span>
          </Link>
          <Link to="/search" className="bottom-nav-item">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </Link>
          <Link to={user ? '/profile' : '/auth'} className="bottom-nav-item">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Bookmarks;
