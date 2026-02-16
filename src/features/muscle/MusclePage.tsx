 import { useState, useMemo } from 'react';
 import { useStore } from '@/state/store';
 import { MuscleChip } from '@/ui/MuscleChip';
 import { MuscleDiagram } from '@/ui/MuscleDiagram';
 import { ReadinessChip } from '@/ui/ReadinessChip';
 import { SegmentedProgress } from '@/ui/SegmentedProgress';
 import { MUSCLES, getSectionsByMuscle } from '@/domain/taxonomy/muscles';
 import { getSectionReadiness } from '@/domain/engines/readinessEngine';
 import { getStimulusZone, getStimulusProgress, getSetsToOptimal } from '@/domain/engines/stimulusEngine';
 import { getRecommendedExercises } from '@/domain/engines/planEngine';
 import type { MuscleGroup, MuscleSection, ReadinessState } from '@/domain/types';
 import { Dumbbell, TrendingUp } from 'lucide-react';
 
 export function MusclePage() {
   const { sectionStates } = useStore();
   const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('chest');
   
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
   
   const sections = useMemo(() => getSectionsByMuscle(selectedMuscle), [selectedMuscle]);
   
   const sectionReadinessMap = useMemo(() => {
     const map = new Map<MuscleSection, ReadinessState>();
     for (const section of sections) {
       const state = sectionStates.get(section.id);
       map.set(section.id, state ? getSectionReadiness(state) : 'READY');
     }
     return map;
   }, [sections, sectionStates]);
   
   const recommendations = useMemo(
     () => getRecommendedExercises([selectedMuscle], sectionStates).slice(0, 5),
     [selectedMuscle, sectionStates]
   );
   
   return (
     <div className="min-h-screen bg-background pb-24">
       <div className="px-4 pt-6 pb-4">
         <h1 className="text-2xl font-bold text-foreground">Muscle Groups</h1>
         <p className="text-muted-foreground mt-1">View recovery and weekly progress</p>
       </div>
       
       {/* Muscle Selector */}
       <div className="px-4 mb-6">
         <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
           {MUSCLES.map(muscle => (
             <MuscleChip
               key={muscle.id}
               muscle={muscle.id}
               readiness={getMuscleReadiness(muscle.id)}
               selected={selectedMuscle === muscle.id}
               onClick={() => setSelectedMuscle(muscle.id)}
             />
           ))}
         </div>
       </div>
       
       {/* Muscle Diagram */}
       <div className="px-4 mb-6">
         <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
           <h2 className="text-lg font-semibold mb-4 capitalize">{selectedMuscle}</h2>
           <MuscleDiagram
             muscle={selectedMuscle}
             sectionReadiness={sectionReadinessMap}
           />
         </div>
       </div>
       
       {/* Section Details */}
       <div className="px-4 mb-6">
         <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
           <TrendingUp className="w-4 h-4" />
           Weekly Progress
         </h3>
         <div className="space-y-3">
           {sections.map(section => {
             const state = sectionStates.get(section.id);
             const readiness = state ? getSectionReadiness(state) : 'READY';
             const zone = state ? getStimulusZone(state.weeklyStimulus) : 'undertrained';
             const progress = state ? getStimulusProgress(state.weeklyStimulus) : 0;
             const setsNeeded = state ? getSetsToOptimal(state.weeklyStimulus) : 10;
             
             return (
               <div key={section.id} className="bg-card rounded-xl p-4 border border-border">
                 <div className="flex items-center justify-between mb-2">
                   <span className="font-medium">{section.name}</span>
                   <ReadinessChip state={readiness} size="sm" />
                 </div>
                 <SegmentedProgress value={progress} variant="zone" size="sm" />
                 <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                   <span>{state?.weeklyStimulus ?? 0} sets this week</span>
                   <span className={zone === 'undertrained' ? 'text-zone-low' : zone === 'optimal' ? 'text-zone-optimal' : 'text-zone-overtrained'}>
                     {zone === 'undertrained' && `${setsNeeded} more to optimal`}
                     {zone === 'optimal' && 'In optimal range'}
                     {zone === 'overtrained' && 'Consider deload'}
                   </span>
                 </div>
               </div>
             );
           })}
         </div>
       </div>
       
       {/* Recommended Exercises */}
       <div className="px-4">
         <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
           <Dumbbell className="w-4 h-4" />
           Recommended Exercises
         </h3>
         <div className="space-y-2">
           {recommendations.map(({ exercise, reason }) => (
             <div key={exercise.id} className="bg-card rounded-xl p-4 border border-border">
               <div className="flex items-start justify-between">
                 <div>
                   <h4 className="font-medium">{exercise.name}</h4>
                   <p className="text-sm text-muted-foreground mt-0.5">{reason}</p>
                 </div>
               </div>
               {exercise.formTip && (
                 <p className="text-xs text-muted-foreground mt-2 italic">
                   💡 {exercise.formTip}
                 </p>
               )}
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 }