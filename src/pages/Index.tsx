import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Flame, Star, ChevronRight, Search, Home, Bookmark, User } from 'lucide-react';
import { useNovels, getChaptersByNovelId } from '@/hooks/useNovels';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { novels, loading, refetch } = useNovels();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'popular' | 'must_read'>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [chapterCounts, setChapterCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const counts: { [key: string]: number } = {};
    novels.forEach(novel => {
      counts[novel.id] = getChaptersByNovelId(novel.id).length;
    });
    setChapterCounts(counts);
  }, [novels]);

  useEffect(() => {
    const handleUpdate = () => refetch();
    window.addEventListener('novelsUpdated', handleUpdate);
    return () => window.removeEventListener('novelsUpdated', handleUpdate);
  }, [refetch]);

  const newArrivals = novels
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 9);

  const popularNovels = novels
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 9);

  const mustReadNovels = novels
    .filter((n) => n.is_must_read)
    .slice(0, 9);

  const officialNovels = novels.filter((n) => n.is_official).slice(0, 6);

  const filteredNovels = searchQuery 
    ? novels.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : (activeTab === 'new' ? newArrivals : activeTab === 'popular' ? popularNovels : mustReadNovels);

  const displayedNovels = filteredNovels;

  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <img 
            src="/logo.png" 
            alt="Contread Logo" 
            className="h-16 mx-auto mb-4"
          />
          <h2 className="text-lg font-bold text-[#CCCCFF] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            YOUR GATEAWAY TO FREE NOVEL
          </h2>
          <p className="text-xs text-gray-500">
            Search from thousands of manga titles and find your perfect match
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Novel..."
            className="search-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
          />
        </div>

        <div className="flex justify-center gap-6 mb-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('new')}
            className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
          >
            <Sparkles className="w-3 h-3" />
            NEW
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
          >
            <Flame className="w-3 h-3" />
            POPULAR
          </button>
          <button
            onClick={() => setActiveTab('must_read')}
            className={`tab-button ${activeTab === 'must_read' ? 'active' : ''}`}
          >
            <Star className="w-3 h-3" />
            MUST READ
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {displayedNovels.length > 0 ? (
            displayedNovels.map((novel) => (
              <Link
                key={novel.id}
                to={`/novel/${novel.id}`}
                className="block"
              >
                <div className="novel-card bg-gray-100">
                  <img
                    src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                    alt={novel.title}
                    className="novel-card-image"
                    loading="lazy"
                  />
                  {novel.is_official && (
                    <span className="absolute bottom-1 left-1 bg-yellow-400 text-[8px] font-black px-1 rounded text-black shadow-sm z-10">
                      OFFICIAL
                    </span>
                  )}
                  <span className={`status-badge ${novel.status === 'completed' ? 'status-completed' : 'status-ongoing'}`}>
                    {novel.status}
                  </span>
                  <span className="chapter-badge">
                    {chapterCounts[novel.id] || 0} ch
                  </span>
                </div>
                <p className="text-[10px] font-medium text-gray-700 mt-1 line-clamp-2 leading-tight">
                  {novel.title}
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
              <p>No novels yet. Admin can upload EPUB files.</p>
            </div>
          )}
        </div>

        {displayedNovels.length > 0 && (
          <div className="text-center mb-8">
            <Link to="/search" className="text-xs text-gray-500 flex items-center justify-center gap-1">
              VIEW ALL <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {officialNovels.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Star className="w-3 h-3" />
                OFFICIAL RELEASE
              </h3>
              <Link to="/official-releases" className="text-xs text-gray-400 flex items-center gap-1">
                VIEW ALL
              </Link>
            </div>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {officialNovels.map((novel) => (
                <Link
                  key={novel.id}
                  to={`/novel/${novel.id}`}
                  className="flex-shrink-0 w-24"
                >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 relative">
                    <img
                      src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                      alt={novel.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {novel.is_official && (
                      <span className="absolute bottom-1 left-1 bg-yellow-400 text-[7px] font-black px-1 rounded text-black shadow-sm z-10">
                        OFFICIAL
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-gray-700 mt-1 line-clamp-1">
                    {novel.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-3">
            <Bookmark className="w-3 h-3" />
            KATALOG LIST
          </h3>
          <div className="flex flex-wrap gap-1">
            {alphabet.map((letter) => (
              <Link
                key={letter}
                to={`/catalog/${letter}`}
                className="alphabet-btn flex items-center justify-center"
              >
                {letter}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link to="/" className="bottom-nav-item active">
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

export default Index;
