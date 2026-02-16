 import { useState, useMemo } from 'react';
 import { useStore } from '@/state/store';
 import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
 import { Button } from '@/components/ui/button';
 import { MuscleChip } from '@/ui/MuscleChip';
 import { ReadinessChip } from '@/ui/ReadinessChip';
 import { MUSCLES } from '@/domain/taxonomy/muscles';
 import { getSectionReadiness } from '@/domain/engines/readinessEngine';
 import { getWarnings, getSuggestedFocus } from '@/domain/engines/planEngine';
 import { CONFIG } from '@/domain/config';
 import type { MuscleGroup, ReadinessState } from '@/domain/types';
 import { AlertTriangle, Zap, Check } from 'lucide-react';
 
 interface EditFocusSheetProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 export function EditFocusSheet({ open, onOpenChange }: EditFocusSheetProps) {
   const { sectionStates, focusMuscles, setFocusMuscles } = useStore();
   const [selected, setSelected] = useState<MuscleGroup[]>(focusMuscles);
   
   const getMuscleReadiness = (muscle: MuscleGroup): ReadinessState => {
     const muscleData = MUSCLES.find(m => m.id === muscle);
     if (!muscleData) return 'READY';
     
     const states: ReadinessState[] = muscleData.sections.map(s => {
       const state = sectionStates.get(s.id);
       return state ? getSectionReadiness(state) : 'READY';
     });
     
     if (states.includes('RECOVERING')) return 'RECOVERING';
     if (states.includes('CAUTION')) return 'CAUTION';
     if (states.includes('PRIMED')) return 'PRIMED';
     return 'READY';
   };
   
   const suggestedFocus = useMemo(() => getSuggestedFocus(sectionStates), [sectionStates]);
   const warnings = useMemo(() => getWarnings(selected, sectionStates), [selected, sectionStates]);
   
   const toggleMuscle = (muscle: MuscleGroup) => {
     if (selected.includes(muscle)) {
       if (selected.length > CONFIG.ui.minFocusMuscles) {
         setSelected(selected.filter(m => m !== muscle));
       }
     } else if (selected.length < CONFIG.ui.maxFocusMuscles) {
       setSelected([...selected, muscle]);
     }
   };
   
   const handleSave = () => {
     setFocusMuscles(selected);
     onOpenChange(false);
   };
   
   const handleApplySuggested = () => {
     setSelected(suggestedFocus);
   };
   
   return (
     <Sheet open={open} onOpenChange={onOpenChange}>
       <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
         <SheetHeader className="pb-4">
           <SheetTitle>Edit Focus Muscles</SheetTitle>
         </SheetHeader>
         
         <div className="space-y-6 overflow-y-auto pb-24">
           {/* Muscle Selection */}
           <div>
             <p className="text-sm text-muted-foreground mb-3">
               Select 1-3 muscles to focus on today
             </p>
             <div className="flex flex-wrap gap-2">
               {MUSCLES.map(muscle => (
                 <MuscleChip
                   key={muscle.id}
                   muscle={muscle.id}
                   readiness={getMuscleReadiness(muscle.id)}
                   selected={selected.includes(muscle.id)}
                   onClick={() => toggleMuscle(muscle.id)}
                 />
               ))}
             </div>
           </div>
           
           {/* Suggested Focus */}
           <div className="bg-muted/50 rounded-2xl p-4">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <Zap className="w-4 h-4 text-primed" />
                 <span className="text-sm font-medium">Suggested Focus</span>
               </div>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleApplySuggested}
                 className="h-7 text-xs"
               >
                 Apply
               </Button>
             </div>
             <div className="flex flex-wrap gap-2">
               {suggestedFocus.map(muscle => (
                 <MuscleChip
                   key={muscle}
                   muscle={muscle}
                   readiness={getMuscleReadiness(muscle)}
                   size="sm"
                 />
               ))}
             </div>
           </div>
           
           {/* Warnings */}
           {warnings.length > 0 && (
             <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4 text-caution" />
                 <span className="text-sm font-medium">Warnings</span>
               </div>
               {warnings.map((warning, i) => (
                 <div key={i} className="bg-caution/10 rounded-xl p-3 border border-caution/20">
                   <div className="flex items-center justify-between mb-2">
                     <span className="font-medium text-sm capitalize">{warning.section}</span>
                     <ReadinessChip state={warning.state} size="sm" />
                   </div>
                   <p className="text-sm text-muted-foreground">{warning.message}</p>
                   {warning.alternatives.length > 0 && (
                     <div className="mt-2">
                       <span className="text-xs text-muted-foreground">Alternatives: </span>
                       <span className="text-xs font-medium">
                         {warning.alternatives.map(e => e.name).join(', ')}
                       </span>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
           
           {/* Selected Summary */}
           <div className="bg-card rounded-2xl p-4 border border-border">
             <div className="flex items-center gap-2 mb-3">
               <Check className="w-4 h-4 text-ready" />
               <span className="text-sm font-medium">Your Selection</span>
             </div>
             <div className="space-y-2">
               {selected.map(muscle => {
                 const readiness = getMuscleReadiness(muscle);
                 return (
                   <div key={muscle} className="flex items-center justify-between">
                     <span className="text-sm capitalize">{muscle}</span>
                     <ReadinessChip state={readiness} size="sm" />
                   </div>
                 );
               })}
             </div>
           </div>
         </div>
         
         {/* Save Button */}
         <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
           <Button onClick={handleSave} className="w-full gradient-primary">
             Save Focus
           </Button>
         </div>
       </SheetContent>
     </Sheet>
   );
 }