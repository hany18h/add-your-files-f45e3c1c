import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, Trash2, Book, LogOut, Edit2, Check, X, Languages, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  useNovels, 
  addNovel, 
  deleteNovel, 
  updateNovel,
  addChapters,
  getChaptersByNovelId,
  updateChapter,
  Novel,
  Chapter
} from '@/hooks/useNovels';
import { parseEpubFile } from '@/utils/epubParser';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { novels, refetch } = useNovels();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [editingNovel, setEditingNovel] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState<'ongoing' | 'completed'>('ongoing');
  const [showChapterEditor, setShowChapterEditor] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.epub')) {
      alert('Please select a valid EPUB file');
      return;
    }

    setUploading(true);
    setUploadProgress('Parsing EPUB file...');

    try {
      const parsed = await parseEpubFile(file);
      
      setUploadProgress(`Found ${parsed.chapters.length} chapters. Creating novel...`);

      const novel = addNovel({
        title: parsed.title,
        author: parsed.author,
        cover_url: parsed.coverUrl,
        description: null,
        genre: [],
        status: 'ongoing',
        is_official: false,
        is_must_read: false,
      });

      setUploadProgress('Adding chapters...');

      addChapters(novel.id, parsed.chapters.map(ch => ({
        number: ch.number,
        title: ch.title,
        content_en: ch.content,
        content_id: null,
        epub_en_url: null,
        epub_id_url: null,
      })));

      setUploadProgress('Done!');
      
      refetch();
      window.dispatchEvent(new Event('novelsUpdated'));
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress('');
      }, 1000);

    } catch (error) {
      console.error('Error parsing EPUB:', error);
      alert('Error parsing EPUB file. Please try another file.');
      setUploading(false);
      setUploadProgress('');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteNovel = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteNovel(id);
      refetch();
      window.dispatchEvent(new Event('novelsUpdated'));
    }
  };

  const handleEditNovel = (novel: Novel) => {
    setEditingNovel(novel.id);
    setEditTitle(novel.title);
    setEditStatus(novel.status);
  };

  const handleSaveNovel = (id: string) => {
    const novel = novels.find(n => n.id === id);
    if (novel) {
      updateNovel(id, { 
        title: editTitle, 
        status: editStatus,
        is_official: novel.is_official,
        is_must_read: novel.is_must_read
      });
    }
    setEditingNovel(null);
    refetch();
    window.dispatchEvent(new Event('novelsUpdated'));
  };

  const toggleFlag = (id: string, flag: 'is_official' | 'is_must_read') => {
    const novel = novels.find(n => n.id === id);
    if (novel) {
      updateNovel(id, { [flag]: !novel[flag] });
      refetch();
      window.dispatchEvent(new Event('novelsUpdated'));
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>, novelId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateNovel(novelId, { cover_url: base64String });
      refetch();
      window.dispatchEvent(new Event('novelsUpdated'));
    };
    reader.readAsDataURL(file);
  };

  const handleEditChapters = (novelId: string) => {
    setShowChapterEditor(novelId);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter({ ...chapter });
  };

  const handleSaveChapter = () => {
    if (editingChapter) {
      updateChapter(editingChapter.id, editingChapter);
      setEditingChapter(null);
      refetch();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getChapterCount = (novelId: string) => {
    return getChaptersByNovelId(novelId).length;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Link to="/" className="p-2 -ml-2 text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="ml-2 font-bold text-gray-800">Admin Panel</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            Upload EPUB Novel
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".epub"
              onChange={handleFileSelect}
              className="hidden"
              id="epub-upload"
              disabled={uploading}
            />
            <label 
              htmlFor="epub-upload" 
              className={`cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}
            >
              {uploading ? (
                <div>
                  <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-purple-600 font-medium">{uploadProgress}</p>
                </div>
              ) : (
                <>
                  <Book className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Click to upload EPUB file</p>
                  <p className="text-gray-400 text-sm">Chapters will be extracted automatically</p>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Manage Novels ({novels.length})
          </h2>

          {novels.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No novels uploaded yet</p>
              <p className="text-sm">Upload your first EPUB above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {novels.map((novel) => {
                const chapters = getChaptersByNovelId(novel.id);
                return (
                  <div 
                    key={novel.id} 
                    className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative group w-20 h-28 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                        {novel.cover_url ? (
                          <img 
                            src={novel.cover_url} 
                            alt={novel.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Book className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleCoverChange(e, novel.id)}
                          />
                          <Edit2 className="w-5 h-5 text-white" />
                        </label>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {editingNovel === novel.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 outline-none"
                              placeholder="Novel Title"
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as 'ongoing' | 'completed')}
                                className="text-xs px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                              </select>
                              <button
                                onClick={() => handleSaveNovel(novel.id)}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                <Check className="w-3 h-3" /> Save
                              </button>
                              <button
                                onClick={() => setEditingNovel(null)}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300"
                              >
                                <X className="w-3 h-3" /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-800 truncate">{novel.title}</h3>
                              <button
                                onClick={() => handleEditNovel(novel)}
                                className="p-1 text-gray-400 hover:text-purple-600"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{novel.author}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-purple-600 font-medium">
                                {chapters.length} chapters
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                novel.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {novel.status}
                              </span>
                            </div>
                          <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => toggleFlag(novel.id, 'is_official')}
                                className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors ${
                                  novel.is_official ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                }`}
                              >
                                Official
                              </button>
                              <button
                                onClick={() => toggleFlag(novel.id, 'is_must_read')}
                                className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors ${
                                  novel.is_must_read ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                }`}
                              >
                                Must Read
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditChapters(novel.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Chapters"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNovel(novel.id, novel.title)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Delete novel"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {showChapterEditor === novel.id && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Languages className="w-4 h-4" /> Edit Chapters Content
                          </h4>
                          <button 
                            onClick={() => setShowChapterEditor(null)}
                            className="text-xs text-gray-500 hover:text-gray-800"
                          >
                            Close
                          </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                          {chapters.map(ch => (
                            <div key={ch.id} className="p-3 bg-white rounded border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-600">Chapter {ch.number}: {ch.title}</span>
                                <button 
                                  onClick={() => handleEditChapter(ch)}
                                  className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100"
                                >
                                  Edit Content
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className={`text-[10px] p-1.5 rounded ${ch.content_en ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                                  English: {ch.content_en ? 'Available' : 'Missing'}
                                </div>
                                <div className={`text-[10px] p-1.5 rounded ${ch.content_id ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                                  Indonesian: {ch.content_id ? 'Available' : 'Missing'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {editingChapter && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0">
              <h3 className="font-bold text-gray-800">Edit Chapter {editingChapter.number}: {editingChapter.title}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveChapter}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setEditingChapter(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Languages className="w-3 h-3" /> English Content
                </label>
                <textarea
                  value={editingChapter.content_en || ''}
                  onChange={(e) => setEditingChapter({...editingChapter, content_en: e.target.value})}
                  className="flex-1 min-h-[400px] p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 outline-none resize-none font-serif leading-relaxed"
                  placeholder="Paste English content here..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Languages className="w-3 h-3" /> Indonesian Content
                </label>
                <textarea
                  value={editingChapter.content_id || ''}
                  onChange={(e) => setEditingChapter({...editingChapter, content_id: e.target.value})}
                  className="flex-1 min-h-[400px] p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 outline-none resize-none font-serif leading-relaxed"
                  placeholder="Paste Indonesian content here..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
