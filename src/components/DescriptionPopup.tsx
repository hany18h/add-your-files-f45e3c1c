 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { User, Tag } from 'lucide-react';
 
 interface DescriptionPopupProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   title: string;
   description: string;
   author?: string | null;
   genre?: string[] | null;
 }
 
 const DescriptionPopup = ({
   open,
   onOpenChange,
   title,
   description,
   author,
   genre,
 }: DescriptionPopupProps) => {
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="text-lg font-bold text-gray-800">{title}</DialogTitle>
         </DialogHeader>
         
         <div className="space-y-4 pt-2">
           {/* Summary */}
           <div className="bg-gray-50 rounded-lg p-4">
             <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
             <p className="text-sm text-gray-600 leading-relaxed">
               {description || 'No description available.'}
             </p>
           </div>
 
           {/* Creator */}
           {author && (
             <div className="bg-gray-50 rounded-lg p-4">
               <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                 <User className="w-4 h-4" />
                 Creator
               </h4>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-500">Writer</span>
                 <span className="text-sm font-medium text-gray-700">{author}</span>
               </div>
             </div>
           )}
 
           {/* Keywords/Genre */}
           {genre && genre.length > 0 && (
             <div className="bg-gray-50 rounded-lg p-4">
               <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                 <Tag className="w-4 h-4" />
                 Keyword
               </h4>
               <div className="flex flex-wrap gap-2">
                 {genre.map((g) => (
                   <span
                     key={g}
                     className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                   >
                     {g}
                   </span>
                 ))}
               </div>
             </div>
           )}
         </div>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default DescriptionPopup;