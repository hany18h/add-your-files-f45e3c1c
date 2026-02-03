import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Search, Home, Bookmark, User } from 'lucide-react';
import { useNovels } from '@/hooks/useNovels';
import { useAuth } from '@/hooks/useAuth';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CatalogPage = () => {
  const { letter: initialLetter } = useParams<{ letter: string }>();
  const { novels, loading } = useNovels();
  const { user } = useAuth();
  const [selectedLetter, setSelectedLetter] = useState<string>(initialLetter?.toUpperCase() || 'A');

  const filteredNovels = useMemo(() => {
    return novels
      .filter((n) => n.title.toUpperCase().startsWith(selectedLetter))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [novels, selectedLetter]);

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
        <div className="flex items-center h-14 px-4">
          <Link to="/" className="p-2 text-gray-600 -ml-2">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-gray-800">Catalog</h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-1">Letter {selectedLetter}</h2>
          <p className="text-xs text-gray-500">
            {filteredNovels.length} novels found
          </p>
        </div>

        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="flex gap-1 flex-wrap">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center transition-all ${
                  selectedLetter === letter
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {filteredNovels.length > 0 ? (
          <div className="space-y-3">
            {filteredNovels.map((novel) => (
              <Link
                key={novel.id}
                to={`/novel/${novel.id}`}
                className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden">
                  <img
                    src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&h=160&fit=crop'}
                    alt={novel.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">
                    {novel.title}
                  </h3>
                  {novel.author && (
                    <p className="text-xs text-gray-500 mt-1">by {novel.author}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No novels found starting with "{selectedLetter}"</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link to="/" className="bottom-nav-item">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link to="/bookmarks" className="bottom-nav-item">
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

export default CatalogPage;
