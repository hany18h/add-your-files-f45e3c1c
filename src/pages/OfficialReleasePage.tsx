import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Home, Bookmark, Search, User, Star } from 'lucide-react';
import { useNovels } from '@/hooks/useNovels';
import { useAuth } from '@/hooks/useAuth';

const OfficialReleasePage = () => {
  const { novels, loading } = useNovels();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const officialNovels = useMemo(() => {
    return novels
      .filter((n) => n.is_official)
      .filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [novels, searchQuery]);

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
          <h1 className="flex-1 text-center font-bold text-gray-800">Official Release</h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search official novels..."
            className="search-input w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Official Titles
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {officialNovels.length} novels found
          </p>
        </div>

        {officialNovels.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {officialNovels.map((novel) => (
              <Link
                key={novel.id}
                to={`/novel/${novel.id}`}
                className="block"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 relative shadow-sm">
                  <img
                    src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                    alt={novel.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 left-1 bg-yellow-400 text-[7px] font-black px-1 rounded text-black shadow-sm z-10">
                    OFFICIAL
                  </span>
                  <span className={`absolute top-1 right-1 px-1 rounded text-[7px] font-bold text-white shadow-sm ${novel.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {novel.status === 'completed' ? 'FIN' : 'UP'}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-gray-700 mt-1 line-clamp-2 leading-tight">
                  {novel.title}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No official novels found.</p>
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

export default OfficialReleasePage;
