import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, Home, Bookmark, User } from 'lucide-react';
import { useNovels } from '@/hooks/useNovels';
import { useAuth } from '@/hooks/useAuth';

const SearchPage = () => {
  const { novels, loading } = useNovels();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const isOfficialFilter = searchParams.get('official') === 'true' || searchParams.get('filter') === 'official';

  const filteredNovels = novels.filter((novel) => {
    const matchesQuery = !searchQuery || 
      novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      novel.author?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOfficial = !isOfficialFilter || novel.is_official;
    
    return matchesQuery && matchesOfficial;
  });

  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="font-bold text-gray-800">Search</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search novels, authors, genres..."
            className="w-full bg-gray-100 rounded-full pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div>
        ) : searchQuery ? (
          <>
            <p className="text-xs text-gray-500 mb-4">
              {filteredNovels.length} result{filteredNovels.length !== 1 ? 's' : ''} found
            </p>
            
            {filteredNovels.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-lg font-semibold mb-2">No results found</h2>
                <p className="text-gray-500">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {filteredNovels.map((novel) => (
                  <Link
                    key={novel.id}
                    to={`/novel/${novel.id}`}
                    className="block"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 relative">
                      <img
                        src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                        alt={novel.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {novel.is_official && (
                        <span className="absolute top-1 left-1 bg-yellow-400 text-[8px] font-black px-1 rounded text-black shadow-sm z-10">
                          OFFICIAL
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-gray-700 mt-1 line-clamp-2">
                      {novel.title}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-semibold mb-2">Search for novels</h2>
            <p className="text-gray-500">Find your next favorite story</p>
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
          <Link to="/search" className="bottom-nav-item active">
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

export default SearchPage;
