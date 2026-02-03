import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Settings, ChevronRight, List } from 'lucide-react';
import { useNovelDetails } from '@/hooks/useNovels';

type ReadingMode = 'vertical' | 'horizontal';

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { novel, chapters, loading, error } = useNovelDetails(id || '');
  const language = (searchParams.get('lang') as 'en' | 'id') || 'en';
  const chapterNumber = parseInt(searchParams.get('chapter') || '1', 10);

  const [readingMode, setReadingMode] = useState<ReadingMode>('vertical');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentChapterIndex = chapters.findIndex((ch) => ch.number === chapterNumber);
  const chapter = chapters[currentChapterIndex];
  
  const content = language === 'id' 
    ? (chapter?.content_id || chapter?.content_en || '') 
    : (chapter?.content_en || '');

  const extractParagraphs = (html: string): string[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const paragraphs = doc.querySelectorAll('p');
    return Array.from(paragraphs).map(p => p.outerHTML);
  };

  const htmlParagraphs = extractParagraphs(content);
  const pages = readingMode === 'horizontal' ? htmlParagraphs : [content];

  useEffect(() => {
    setCurrentPage(0);
  }, [chapterNumber, language]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !novel || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Chapter not found</p>
          <button
            onClick={() => navigate(`/novel/${id}`)}
            className="text-purple-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      navigate(`/read/${id}?lang=${language}&chapter=${nextChapter.number}`);
      setCurrentPage(0);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      navigate(`/read/${id}?lang=${language}&chapter=${prevChapter.number}`);
      setCurrentPage(0);
      window.scrollTo(0, 0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        if (readingMode === 'horizontal') {
          if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
          } else {
            goToNextChapter();
          }
        }
      } else {
        if (readingMode === 'horizontal') {
          if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
          } else {
            goToPrevChapter();
          }
        }
      }
    }
    setTouchStart(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-12 px-4">
          <button
            onClick={() => navigate(`/novel/${id}`, { replace: true })}
            className="p-2 -ml-2 text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1 min-w-0 px-2">
            <p className="text-xs text-gray-500 truncate">
              Chapter {chapter.number}: {chapter.title}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 -mr-2 text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="fixed top-12 right-0 left-0 z-40 bg-white border-b border-gray-200 p-4">
          <div className="max-w-md mx-auto">
            <p className="text-sm font-semibold mb-3 text-gray-800">Reading Mode</p>
            <div className="flex gap-2">
              <button
                onClick={() => setReadingMode('vertical')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  readingMode === 'vertical'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                Scroll
              </button>
              <button
                onClick={() => setReadingMode('horizontal')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  readingMode === 'horizontal'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <ChevronRight className="w-4 h-4 inline mr-2" />
                Flip
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`max-w-md mx-auto px-4 py-6 ${
          readingMode === 'horizontal' ? 'min-h-[calc(100vh-120px)]' : ''
        }`}
      >
        {readingMode === 'vertical' ? (
          <div className="prose prose-sm max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: content }} />
            
            <div className="py-8 flex items-center justify-center border-t border-gray-200 mt-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">
                  End of Chapter {chapter.number}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={goToPrevChapter}
                    disabled={currentChapterIndex === 0}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goToNextChapter}
                    disabled={currentChapterIndex >= chapters.length - 1}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-700" key={currentPage}>
            <div dangerouslySetInnerHTML={{ __html: pages[currentPage] || '' }} />
          </div>
        )}
      </div>

      {readingMode === 'horizontal' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between px-4">
            <button
              onClick={() => {
                if (currentPage > 0) {
                  setCurrentPage(currentPage - 1);
                } else {
                  goToPrevChapter();
                }
              }}
              disabled={currentPage === 0 && currentChapterIndex === 0}
              className="p-2 text-gray-400 disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Page {currentPage + 1} of {pages.length}
              </p>
            </div>
            
            <button
              onClick={() => {
                if (currentPage < pages.length - 1) {
                  setCurrentPage(currentPage + 1);
                } else {
                  goToNextChapter();
                }
              }}
              disabled={currentPage >= pages.length - 1 && currentChapterIndex >= chapters.length - 1}
              className="p-2 text-gray-400 disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reader;
