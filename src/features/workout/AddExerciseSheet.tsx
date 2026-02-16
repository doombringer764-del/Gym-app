 import { useState, useMemo } from 'react';
 import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
 import { Input } from '@/components/ui/input';
 import { EXERCISES } from '@/domain/catalog/exercises';
 import { Search, Dumbbell } from 'lucide-react';
 
 interface AddExerciseSheetProps {
   open: boolean;
   onClose: () => void;
   onSelect: (exerciseId: string) => void;
 }
 
 export function AddExerciseSheet({ open, onClose, onSelect }: AddExerciseSheetProps) {
   const [search, setSearch] = useState('');
   
   const filteredExercises = useMemo(() => {
     if (!search.trim()) return EXERCISES;
     const query = search.toLowerCase();
     return EXERCISES.filter(e => 
       e.name.toLowerCase().includes(query) ||
       e.muscleGroup.toLowerCase().includes(query)
     );
   }, [search]);
   
   const handleSelect = (exerciseId: string) => {
     onSelect(exerciseId);
     setSearch('');
     onClose();
   };
   
   return (
     <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
       <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
         <SheetHeader className="pb-4">
           <SheetTitle>Add Exercise</SheetTitle>
         </SheetHeader>
         
         <div className="space-y-4">
           {/* Search */}
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input
               placeholder="Search exercises..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-10"
               autoFocus
             />
           </div>
           
           {/* Exercise List */}
           <div className="space-y-2 max-h-[calc(80vh-140px)] overflow-y-auto">
             {filteredExercises.map((exercise) => (
               <button
                 key={exercise.id}
                 onClick={() => handleSelect(exercise.id)}
                 className="w-full bg-card rounded-xl p-4 border border-border text-left hover:bg-muted/50 transition-colors"
               >
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                     <Dumbbell className="w-5 h-5 text-primary" />
                   </div>
                   <div>
                     <h4 className="font-medium">{exercise.name}</h4>
                     <p className="text-sm text-muted-foreground capitalize">
                       {exercise.muscleGroup} • {Object.keys(exercise.contributions).length} sections
                     </p>
                   </div>
                 </div>
               </button>
             ))}
             
             {filteredExercises.length === 0 && (
               <div className="text-center py-8 text-muted-foreground">
                 No exercises found for "{search}"
               </div>
             )}
           </div>
         </div>
       </SheetContent>
     </Sheet>
   );
 }