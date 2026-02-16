 import type { MuscleGroup, MuscleSection } from '../types';
 
 export interface MuscleDefinition {
   id: MuscleGroup;
   name: string;
   sections: SectionDefinition[];
   color: string;
 }
 
 export interface SectionDefinition {
   id: MuscleSection;
   name: string;
   muscleGroup: MuscleGroup;
 }
 
 export const MUSCLES: MuscleDefinition[] = [
   {
     id: 'shoulders',
     name: 'Shoulders',
     color: 'hsl(174 72% 40%)', // Primary teal
     sections: [
       { id: 'frontDelt', name: 'Front Delts', muscleGroup: 'shoulders' },
       { id: 'lateralDelt', name: 'Lateral Delts', muscleGroup: 'shoulders' },
       { id: 'rearDelt', name: 'Rear Delts', muscleGroup: 'shoulders' },
     ],
   },
   {
     id: 'back',
     name: 'Back',
     color: 'hsl(210 70% 55%)', // Blue
     sections: [
       { id: 'lats', name: 'Lats', muscleGroup: 'back' },
       { id: 'upperBack', name: 'Upper Back', muscleGroup: 'back' },
       { id: 'lowerTraps', name: 'Lower Traps', muscleGroup: 'back' },
       { id: 'erectors', name: 'Erectors', muscleGroup: 'back' },
     ],
   },
   {
     id: 'chest',
     name: 'Chest',
     color: 'hsl(0 72% 55%)', // Red
     sections: [
       { id: 'upperChest', name: 'Upper Chest', muscleGroup: 'chest' },
       { id: 'midChest', name: 'Mid Chest', muscleGroup: 'chest' },
       { id: 'lowerChest', name: 'Lower Chest', muscleGroup: 'chest' },
     ],
   },
   {
     id: 'legs',
     name: 'Legs',
     color: 'hsl(142 70% 45%)', // Green
     sections: [
       { id: 'quads', name: 'Quads', muscleGroup: 'legs' },
       { id: 'hamstrings', name: 'Hamstrings', muscleGroup: 'legs' },
       { id: 'glutes', name: 'Glutes', muscleGroup: 'legs' },
       { id: 'calves', name: 'Calves', muscleGroup: 'legs' },
     ],
   },
   {
     id: 'biceps',
     name: 'Biceps',
     color: 'hsl(38 92% 50%)', // Amber
     sections: [
       { id: 'biceps', name: 'Biceps', muscleGroup: 'biceps' },
     ],
   },
   {
     id: 'triceps',
     name: 'Triceps',
     color: 'hsl(280 70% 55%)', // Purple
     sections: [
       { id: 'triceps', name: 'Triceps', muscleGroup: 'triceps' },
     ],
   },
   {
     id: 'forearms',
     name: 'Forearms',
     color: 'hsl(330 70% 55%)', // Pink
     sections: [
       { id: 'forearms', name: 'Forearms', muscleGroup: 'forearms' },
     ],
   },
 ];
 
 export const SECTIONS: SectionDefinition[] = MUSCLES.flatMap(m => m.sections);
 
 export const getMuscleById = (id: MuscleGroup): MuscleDefinition | undefined =>
   MUSCLES.find(m => m.id === id);
 
 export const getSectionById = (id: MuscleSection): SectionDefinition | undefined =>
   SECTIONS.find(s => s.id === id);
 
 export const getSectionsByMuscle = (muscleId: MuscleGroup): SectionDefinition[] =>
   MUSCLES.find(m => m.id === muscleId)?.sections ?? [];