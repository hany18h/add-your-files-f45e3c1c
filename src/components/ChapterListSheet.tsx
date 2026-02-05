 import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
 import { List, ChevronRight } from 'lucide-react';
 import { Tables } from '@/integrations/supabase/types';
 
 type Chapter = Tables<'chapters'>;
 
 interface ChapterListSheetProps {
   chapters: Chapter[];
   currentChapterNumber: number;
   novelId: string;
   language: 'en' | 'id';
   onChapterSelect: (chapterNumber: number) => void;
 }
 
 const ChapterListSheet = ({
   chapters,
   currentChapterNumber,
   novelId,
   language,
   onChapterSelect,
 }: ChapterListSheetProps) => {
   return (
     <Sheet>
       <SheetTrigger asChild>
         <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
           <List className="w-5 h-5" />
         </button>
       </SheetTrigger>
       <SheetContent side="left" className="w-80 p-0">
         <SheetHeader className="p-4 border-b border-gray-100">
           <SheetTitle className="text-left">Chapters</SheetTitle>
         </SheetHeader>
         <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
           {chapters.map((chapter) => {
             const isActive = chapter.number === currentChapterNumber;
             const hasContent = language === 'id' 
               ? (chapter.content_id || chapter.epub_id_url)
               : (chapter.content_en || chapter.epub_en_url);
             
             return (
               <button
                 key={chapter.id}
                 onClick={() => onChapterSelect(chapter.number)}
                 disabled={!hasContent}
                 className={`w-full flex items-center justify-between p-4 border-b border-gray-50 text-left transition-colors ${
                   isActive 
                     ? 'bg-purple-50 border-l-4 border-l-purple-600' 
                     : 'hover:bg-gray-50'
                 } ${!hasContent ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                 <div>
                   <span className={`text-xs font-semibold ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                     Chapter {chapter.number}
                   </span>
                   <p className={`text-sm font-medium ${isActive ? 'text-purple-800' : 'text-gray-700'}`}>
                     {chapter.title}
                   </p>
                 </div>
                 <ChevronRight className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
               </button>
             );
           })}
         </div>
       </SheetContent>
     </Sheet>
   );
 };
 
 export default ChapterListSheet;