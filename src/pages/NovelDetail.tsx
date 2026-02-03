import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Book, Languages, Eye, Heart, Home, Bookmark, Search, User } from 'lucide-react';
import { useNovelDetails, incrementViewCount } from '@/hooks/useNovels';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';

const NovelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { novel, chapters, loading, error } = useNovelDetails(id || '');
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'id'>('en');
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      incrementViewCount(id);
    }
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!id) return;
    
    setTogglingFavorite(true);
    await toggleFavorite(id);
    setTogglingFavorite(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Novel not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const hasEnglish = chapters.some((ch) => ch.content_en || ch.epub_en_url);
  const hasIndonesian = chapters.some((ch) => ch.content_id || ch.epub_id_url);
  const isNovelFavorite = id ? isFavorite(id) : false;

  const handleReadClick = (lang: 'en' | 'id') => {
    setSelectedLanguage(lang);
    navigate(`/read/${id}?lang=${lang}`);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/', { replace: true })}
              className="p-2 -ml-2 text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="ml-2 font-semibold truncate text-gray-800">{novel.title}</h1>
          </div>
          <button
            onClick={handleToggleFavorite}
            disabled={togglingFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isNovelFavorite
                ? 'text-red-500 bg-red-50'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isNovelFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <div className="w-28 shrink-0">
            <img
              src={novel.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
              alt={novel.title}
              className="w-full aspect-[2/3] object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold mb-2 text-gray-800">{novel.title}</h2>
            {novel.author && (
              <p className="text-sm text-gray-500 mb-2">
                by {novel.author}
              </p>
            )}
            {novel.genre && (
              <div className="flex flex-wrap gap-1 mb-2">
                {novel.genre.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Book className="w-3 h-3" />
                <span>{chapters.length} Chapters</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{novel.view_count} Views</span>
              </div>
            </div>
          </div>
        </div>

        {novel.description && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2 text-gray-800">Synopsis</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {novel.description}
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Choose Language</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(hasEnglish || chapters.length > 0) && (
              <button
                onClick={() => handleReadClick('en')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all bg-purple-600 text-white"
              >
                English
              </button>
            )}
            {hasIndonesian && (
              <button
                onClick={() => handleReadClick('id')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Indonesia
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Chapters</h3>
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => navigate(`/read/${id}?lang=${selectedLanguage}&chapter=${chapter.number}`)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <div>
                  <span className="text-xs text-purple-600 font-semibold">
                    Chapter {chapter.number}
                  </span>
                  <p className="text-sm font-medium text-gray-700">{chapter.title}</p>
                </div>
                <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
              </button>
            ))}
            
            {chapters.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                No chapters available yet
              </p>
            )}
          </div>
        </div>
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

export default NovelDetail;
