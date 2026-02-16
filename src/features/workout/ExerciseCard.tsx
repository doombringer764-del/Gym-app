 import { useState } from 'react';
 import { useStore } from '@/state/store';
 import { Button } from '@/components/ui/button';
 import { fromKg, roundWeight } from '@/lib/units';
 import { getSetFatigueContributions } from '@/domain/engines/fatigueEngine';
 import type { ExerciseEntry, LoggedSet } from '@/domain/types';
 import { Plus, Trash2, MoreVertical, Pencil } from 'lucide-react';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 interface ExerciseCardProps {
   entry: ExerciseEntry;
   onLogSet: () => void;
 }
 
 export function ExerciseCard({ entry, onLogSet }: ExerciseCardProps) {
   const { profile, deleteSet, removeExerciseEntry } = useStore();
   const unit = profile.weightUnit;
   
   const totalSets = entry.sets.length;
   
   return (
     <div className="bg-card rounded-2xl border border-border overflow-hidden">
       {/* Header */}
       <div className="flex items-center justify-between p-4 border-b border-border">
         <div>
           <h3 className="font-semibold">{entry.name}</h3>
           <p className="text-sm text-muted-foreground">
             {totalSets} {totalSets === 1 ? 'set' : 'sets'}
           </p>
         </div>
         <div className="flex items-center gap-2">
           <Button
             size="sm"
             variant="ghost"
             onClick={onLogSet}
             className="gap-1"
           >
             <Plus className="w-4 h-4" />
             Log Set
           </Button>
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                 <MoreVertical className="w-4 h-4" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem 
                 onClick={() => removeExerciseEntry(entry.id)}
                 className="text-destructive"
               >
                 <Trash2 className="w-4 h-4 mr-2" />
                 Remove Exercise
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       </div>
       
       {/* Sets List */}
       {entry.sets.length > 0 && (
         <div className="divide-y divide-border">
           {entry.sets.map((set, index) => {
             const displayWeight = roundWeight(fromKg(set.weightKg, unit), unit);
             
             // Get fatigue contributions for this set
             const legacySet: LoggedSet = {
               id: set.id,
               exerciseId: entry.exerciseId,
               weight: set.weightKg * 2.20462,
               reps: set.reps,
               rpe: set.rpe,
               timestamp: set.createdAt,
             };
             const fatigue = getSetFatigueContributions(legacySet);
             
             return (
               <div key={set.id} className="flex items-center justify-between px-4 py-3">
                 <div className="flex items-center gap-4">
                   <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                     {index + 1}
                   </span>
                   <div>
                     <span className="font-medium">
                       {displayWeight}{unit} × {set.reps}
                     </span>
                     <span className="text-muted-foreground ml-2">
                       @ RPE {set.rpe}
                     </span>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="flex flex-wrap gap-1 mr-2">
                     {Array.from(fatigue.entries()).slice(0, 2).map(([section, value]) => (
                       <span key={section} className="text-xs text-recovering">
                         +{value.toFixed(1)}
                       </span>
                     ))}
                   </div>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 text-muted-foreground hover:text-destructive"
                     onClick={() => deleteSet(entry.id, set.id)}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
               </div>
             );
           })}
         </div>
       )}
       
       {/* Empty State */}
       {entry.sets.length === 0 && (
         <div className="p-4 text-center">
           <p className="text-sm text-muted-foreground mb-2">No sets logged yet</p>
           <Button size="sm" onClick={onLogSet} className="gap-1">
             <Plus className="w-4 h-4" />
             Log First Set
           </Button>
         </div>
       )}
     </div>
   );
 }