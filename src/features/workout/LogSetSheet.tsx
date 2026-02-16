 import { useState, useEffect } from 'react';
 import { useStore } from '@/state/store';
 import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Slider } from '@/components/ui/slider';
 import { getExerciseById } from '@/domain/catalog/exercises';
 import { getSetFatigueContributions } from '@/domain/engines/fatigueEngine';
 import { fromKg, toKg, roundWeight, ROUNDING } from '@/lib/units';
 import type { ExerciseEntry, LoggedSet } from '@/domain/types';
 
 interface LogSetSheetProps {
   exerciseEntry: ExerciseEntry | null;
   onClose: () => void;
 }
 
 export function LogSetSheet({ exerciseEntry, onClose }: LogSetSheetProps) {
   const { logSetToExercise, profile, getLastSetForExercise } = useStore();
   const [weight, setWeight] = useState('');
   const [reps, setReps] = useState('');
   const [rpe, setRpe] = useState(8);
   
   const exercise = exerciseEntry ? getExerciseById(exerciseEntry.exerciseId) : null;
   const unit = profile.weightUnit;
   
   // Prefill from last set when opening
   useEffect(() => {
     if (exerciseEntry) {
       const lastSet = getLastSetForExercise(exerciseEntry.exerciseId);
       if (lastSet) {
         const displayWeight = roundWeight(fromKg(lastSet.weightKg, unit), unit);
         setWeight(String(displayWeight));
         setReps(String(lastSet.reps));
         setRpe(lastSet.rpe);
       } else {
         setWeight('');
         setReps('');
         setRpe(8);
       }
     }
   }, [exerciseEntry?.id, unit]);
   
   // Create preview set for fatigue calculation
   const weightKg = weight ? toKg(parseFloat(weight), unit) : 0;
   const previewSet: LoggedSet = {
     id: 'preview',
     exerciseId: exerciseEntry?.exerciseId ?? '',
     weight: weightKg * 2.20462, // Legacy uses lb
     reps: parseInt(reps) || 0,
     rpe,
     timestamp: Date.now(),
   };
   
   const previewFatigue = exerciseEntry && weight && reps
     ? getSetFatigueContributions(previewSet, profile.fatigueSensitivity)
     : new Map();
   
   const handleLog = () => {
     if (!exerciseEntry || !weight || !reps) return;
     
     logSetToExercise(exerciseEntry.id, {
       weightKg: toKg(parseFloat(weight), unit),
       reps: parseInt(reps),
       rpe,
     });
     
     // Reset reps for next set, keep weight
     setReps('');
   };
   
   const handleDone = () => {
     setWeight('');
     setReps('');
     setRpe(8);
     onClose();
   };
   
   const getRirFromRpe = (rpe: number) => 10 - rpe;
   
   return (
     <Sheet open={!!exerciseEntry} onOpenChange={() => handleDone()}>
       <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
         <SheetHeader className="pb-4">
           <SheetTitle>{exercise?.name ?? 'Log Set'}</SheetTitle>
         </SheetHeader>
         
         <div className="space-y-6">
           {/* Form Tip */}
           {exercise?.formTip && (
             <div className="bg-muted/50 rounded-xl p-3">
               <p className="text-sm text-muted-foreground">
                 💡 {exercise.formTip}
               </p>
             </div>
           )}
           
           {/* Weight & Reps */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="weight">Weight ({unit})</Label>
               <Input
                 id="weight"
                 type="number"
                 placeholder={unit === 'lb' ? '135' : '60'}
                 value={weight}
                 onChange={(e) => setWeight(e.target.value)}
                 step={ROUNDING[unit]}
                 className="text-lg h-12"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="reps">Reps</Label>
               <Input
                 id="reps"
                 type="number"
                 placeholder="10"
                 value={reps}
                 onChange={(e) => setReps(e.target.value)}
                 className="text-lg h-12"
               />
             </div>
           </div>
           
           {/* RPE Slider */}
           <div className="space-y-3">
             <div className="flex items-center justify-between">
               <Label>Effort (RPE)</Label>
               <span className="text-sm font-medium">
                 RPE {rpe} <span className="text-muted-foreground">({getRirFromRpe(rpe)} RIR)</span>
               </span>
             </div>
             <Slider
               value={[rpe]}
               onValueChange={([v]) => setRpe(v)}
               min={5}
               max={10}
               step={0.5}
               className="w-full"
             />
             <div className="flex justify-between text-xs text-muted-foreground">
               <span>Easy</span>
               <span>Hard</span>
               <span>Max</span>
             </div>
           </div>
           
           {/* Fatigue Preview */}
           {previewFatigue.size > 0 && (
             <div className="bg-recovering/10 rounded-xl p-4 border border-recovering/20">
               <p className="text-sm font-medium mb-2">Fatigue Impact</p>
               <div className="flex flex-wrap gap-2">
                 {Array.from(previewFatigue.entries()).map(([section, fatigue]) => (
                   <span key={section} className="text-sm">
                     <span className="text-recovering">+{fatigue.toFixed(1)}</span>{' '}
                     <span className="text-muted-foreground capitalize">{section}</span>
                   </span>
                 ))}
               </div>
             </div>
           )}
           
           {/* Actions */}
           <div className="flex gap-3">
             <Button
               variant="outline"
               onClick={handleDone}
               className="flex-1"
             >
               Done
             </Button>
             <Button
               onClick={handleLog}
               disabled={!weight || !reps}
               className="flex-1 gradient-primary"
             >
               Log Set
             </Button>
           </div>
         </div>
       </SheetContent>
     </Sheet>
   );
 }