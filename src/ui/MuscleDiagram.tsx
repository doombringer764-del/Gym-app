 import { cn } from '@/lib/utils';
 import type { MuscleGroup, MuscleSection, ReadinessState } from '@/domain/types';
 import { getSectionsByMuscle } from '@/domain/taxonomy/muscles';
 
 interface MuscleDiagramProps {
   muscle: MuscleGroup;
   sectionReadiness: Map<MuscleSection, ReadinessState>;
   className?: string;
 }
 
 const readinessColors: Record<ReadinessState, string> = {
   RECOVERING: 'fill-recovering',
   CAUTION: 'fill-caution',
   READY: 'fill-ready',
   PRIMED: 'fill-primed',
 };
 
 // Simplified body part shapes (placeholder SVGs)
 const muscleShapes: Record<MuscleGroup, { viewBox: string; paths: { id: string; d: string }[] }> = {
   chest: {
     viewBox: '0 0 200 150',
     paths: [
       { id: 'upperChest', d: 'M40 20 Q100 0 160 20 L150 50 Q100 40 50 50 Z' },
       { id: 'midChest', d: 'M50 50 Q100 40 150 50 L145 90 Q100 80 55 90 Z' },
       { id: 'lowerChest', d: 'M55 90 Q100 80 145 90 L140 120 Q100 130 60 120 Z' },
     ],
   },
   back: {
     viewBox: '0 0 200 180',
     paths: [
       { id: 'upperBack', d: 'M50 10 L150 10 L145 50 L55 50 Z' },
       { id: 'lats', d: 'M30 50 L55 50 L60 130 L25 100 Z M170 50 L145 50 L140 130 L175 100 Z' },
       { id: 'lowerTraps', d: 'M70 50 L130 50 L125 80 L75 80 Z' },
       { id: 'erectors', d: 'M80 80 L120 80 L115 160 L85 160 Z' },
     ],
   },
   shoulders: {
     viewBox: '0 0 200 120',
     paths: [
       { id: 'frontDelt', d: 'M60 30 Q80 20 100 25 L95 70 L55 60 Z' },
       { id: 'lateralDelt', d: 'M20 40 Q40 20 60 30 L55 80 L15 70 Z M180 40 Q160 20 140 30 L145 80 L185 70 Z' },
       { id: 'rearDelt', d: 'M100 25 Q120 20 140 30 L145 70 L105 60 Z' },
     ],
   },
   legs: {
     viewBox: '0 0 200 220',
     paths: [
       { id: 'quads', d: 'M40 10 L80 10 L85 120 L35 120 Z M120 10 L160 10 L165 120 L115 120 Z' },
       { id: 'hamstrings', d: 'M45 130 L75 130 L70 200 L50 200 Z M125 130 L155 130 L150 200 L130 200 Z' },
       { id: 'glutes', d: 'M50 0 Q100 -10 150 0 L145 30 Q100 40 55 30 Z' },
       { id: 'calves', d: 'M55 180 L70 180 L68 215 L57 215 Z M130 180 L145 180 L143 215 L132 215 Z' },
     ],
   },
   biceps: {
     viewBox: '0 0 200 120',
     paths: [
       { id: 'biceps', d: 'M30 10 L70 10 Q80 50 75 100 L25 100 Q20 50 30 10 Z M130 10 L170 10 Q180 50 175 100 L125 100 Q120 50 130 10 Z' },
     ],
   },
   triceps: {
     viewBox: '0 0 200 120',
     paths: [
       { id: 'triceps', d: 'M25 10 L75 10 Q85 50 80 100 L20 100 Q15 50 25 10 Z M125 10 L175 10 Q185 50 180 100 L120 100 Q115 50 125 10 Z' },
     ],
   },
   forearms: {
     viewBox: '0 0 200 140',
     paths: [
       { id: 'forearms', d: 'M20 10 L60 10 Q70 70 65 130 L15 130 Q10 70 20 10 Z M140 10 L180 10 Q190 70 185 130 L135 130 Q130 70 140 10 Z' },
     ],
   },
 };
 
 export function MuscleDiagram({ muscle, sectionReadiness, className }: MuscleDiagramProps) {
   const shape = muscleShapes[muscle];
   const sections = getSectionsByMuscle(muscle);
   
   return (
     <div className={cn('relative', className)}>
       <svg viewBox={shape.viewBox} className="w-full h-auto">
         {/* Background shape */}
         <rect
           x="0"
           y="0"
           width="200"
           height={parseInt(shape.viewBox.split(' ')[3])}
           fill="hsl(var(--muted))"
           rx="12"
           opacity="0.3"
         />
         
         {/* Muscle sections */}
         {shape.paths.map((path) => {
           const sectionId = path.id as MuscleSection;
           const readiness = sectionReadiness.get(sectionId) ?? 'READY';
           
           return (
             <path
               key={path.id}
               d={path.d}
               className={cn(
                 'transition-all duration-300 stroke-background stroke-2',
                 readinessColors[readiness]
               )}
               opacity="0.9"
             />
           );
         })}
       </svg>
       
       {/* Section legend */}
       <div className="mt-4 grid grid-cols-2 gap-2">
         {sections.map((section) => {
           const readiness = sectionReadiness.get(section.id) ?? 'READY';
           return (
             <div key={section.id} className="flex items-center gap-2 text-sm">
               <span
                 className={cn(
                   'w-3 h-3 rounded-full',
                   readiness === 'RECOVERING' && 'bg-recovering',
                   readiness === 'CAUTION' && 'bg-caution',
                   readiness === 'READY' && 'bg-ready',
                   readiness === 'PRIMED' && 'bg-primed'
                 )}
               />
               <span className="text-foreground">{section.name}</span>
             </div>
           );
         })}
       </div>
     </div>
   );
 }