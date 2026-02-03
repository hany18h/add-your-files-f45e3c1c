import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Novel, Chapter, ReadingMode, Language } from '@/types/novel';

// Demo novels data
const demoNovels: Novel[] = [
  {
    id: '1',
    title: 'The Dragon King\'s Bride',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    description: 'A tale of forbidden love between a mortal princess and the immortal dragon king.',
    author: 'Luna Rose',
    genre: ['Romance', 'Fantasy'],
    status: 'ongoing',
    languages: ['en', 'id'],
    chapters: [
      { id: '1-1', number: 1, title: 'The Prophecy', content: { en: 'Long ago, in a kingdom shrouded in mist, there lived a princess who dreamed of dragons. She would spend her nights gazing at the stars, wondering if the ancient tales were true.\n\nThe elders spoke of a time when dragons ruled the skies, their scales glittering like diamonds under the moonlight. But those days were long gone—or so everyone believed.\n\nPrincess Aria was different. She felt a connection to something ancient, something powerful that called to her in her dreams.', id: 'Dahulu kala, di sebuah kerajaan yang diselimuti kabut, hiduplah seorang putri yang bermimpi tentang naga. Dia akan menghabiskan malamnya menatap bintang-bintang, bertanya-tanya apakah kisah-kisah kuno itu benar.\n\nPara tetua berbicara tentang masa ketika naga menguasai langit, sisik mereka berkilau seperti berlian di bawah sinar bulan. Tapi hari-hari itu sudah lama berlalu—atau begitulah yang semua orang percaya.\n\nPutri Aria berbeda. Dia merasakan koneksi dengan sesuatu yang kuno, sesuatu yang kuat yang memanggilnya dalam mimpinya.' } },
      { id: '1-2', number: 2, title: 'The Encounter', content: { en: 'The night of the blood moon changed everything. Aria wandered into the forbidden forest, drawn by an irresistible force.\n\nThere, in a clearing bathed in crimson light, she saw him—a man with silver hair and golden eyes that seemed to hold the wisdom of centuries.\n\n"You should not be here, little princess," he said, his voice deep and resonant.\n\nBut Aria stood her ground. "And yet, here I am."', id: 'Malam bulan darah mengubah segalanya. Aria berkeliaran ke hutan terlarang, ditarik oleh kekuatan yang tak tertahankan.\n\nDi sana, di sebuah clearing yang bermandikan cahaya merah, dia melihatnya—seorang pria dengan rambut perak dan mata emas yang tampak menyimpan kebijaksanaan berabad-abad.\n\n"Kamu tidak seharusnya di sini, putri kecil," katanya, suaranya dalam dan bergema.\n\nTapi Aria berdiri teguh. "Namun, di sinilah aku."' } },
      { id: '1-3', number: 3, title: 'The Truth', content: { en: 'Chapter 3 content here...', id: 'Konten bab 3 di sini...' } },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    title: 'Moonlit Assassin',
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
    description: 'An elite assassin discovers love in the most unexpected place.',
    author: 'Shadow Writer',
    genre: ['Action', 'Romance'],
    status: 'ongoing',
    languages: ['en', 'id'],
    chapters: [
      { id: '2-1', number: 1, title: 'The Contract', content: { en: 'The contract was simple: eliminate the target, collect the payment. Raven had done this a thousand times before.\n\nBut this time was different. The target was the most beautiful woman she had ever seen.', id: 'Kontraknya sederhana: eliminasi target, kumpulkan pembayaran. Raven sudah melakukan ini ribuan kali sebelumnya.\n\nTapi kali ini berbeda. Targetnya adalah wanita paling cantik yang pernah dia lihat.' } },
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    title: 'The Eternal Emperor',
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'A cultivation story of an immortal emperor reborn in a mortal body.',
    author: 'Mystic Pen',
    genre: ['Fantasy', 'Cultivation'],
    status: 'completed',
    languages: ['en'],
    chapters: [
      { id: '3-1', number: 1, title: 'Rebirth', content: { en: 'Ten thousand years ago, I was the Eternal Emperor, ruler of the Nine Heavens. Now, I wake in the body of a mere mortal.\n\nHow amusing.' } },
    ],
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    title: 'Academy of Shadows',
    cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=600&fit=crop',
    description: 'A young mage discovers dark secrets in an elite magic academy.',
    author: 'Dark Quill',
    genre: ['Fantasy', 'Mystery'],
    status: 'ongoing',
    languages: ['en', 'id'],
    chapters: [
      { id: '4-1', number: 1, title: 'Arrival', content: { en: 'The gates of Shadowmere Academy loomed before me, ancient and foreboding.', id: 'Gerbang Akademi Shadowmere menjulang di hadapanku, kuno dan menakutkan.' } },
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '5',
    title: 'Crown of Thorns',
    cover: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=600&fit=crop',
    description: 'A princess must navigate court intrigue to claim her throne.',
    author: 'Royal Ink',
    genre: ['Romance', 'Political'],
    status: 'ongoing',
    languages: ['en', 'id'],
    chapters: [
      { id: '5-1', number: 1, title: 'The Inheritance', content: { en: 'My father the king was dead. And with him, my peace.', id: 'Ayahku sang raja telah tiada. Dan bersamanya, kedamaianku.' } },
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '6',
    title: 'Beast Contract',
    cover: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
    description: 'When she signed the contract, she didn\'t know she was marrying a beast.',
    author: 'Night Bloom',
    genre: ['Romance', 'Fantasy'],
    status: 'ongoing',
    languages: ['en'],
    chapters: [
      { id: '6-1', number: 1, title: 'The Deal', content: { en: 'The beast\'s golden eyes studied me with an intensity that made my heart race.' } },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-23'),
  },
];

interface NovelState {
  novels: Novel[];
  readingMode: ReadingMode;
  selectedLanguage: Language;
  currentChapter: number;
  addNovel: (novel: Novel) => void;
  updateNovel: (id: string, novel: Partial<Novel>) => void;
  deleteNovel: (id: string) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setSelectedLanguage: (lang: Language) => void;
  setCurrentChapter: (chapter: number) => void;
}

export const useNovelStore = create<NovelState>()(
  persist(
    (set) => ({
      novels: demoNovels,
      readingMode: 'vertical',
      selectedLanguage: 'en',
      currentChapter: 0,
      addNovel: (novel) => set((state) => ({ novels: [...state.novels, novel] })),
      updateNovel: (id, updates) =>
        set((state) => ({
          novels: state.novels.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        })),
      deleteNovel: (id) =>
        set((state) => ({
          novels: state.novels.filter((n) => n.id !== id),
        })),
      setReadingMode: (mode) => set({ readingMode: mode }),
      setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
    }),
    {
      name: 'novel-storage',
    }
  )
);
