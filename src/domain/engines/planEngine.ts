 import { CONFIG } from '../config';
 import type {
   Exercise,
   ExerciseRecommendation,
   MuscleGroup,
   MuscleSection,
   PlanWarning,
   SectionState,
 } from '../types';
 import { EXERCISES, getExercisesBySection } from '../catalog/exercises';
 import { getSectionsByMuscle } from '../taxonomy/muscles';
 import { getSectionReadiness } from './readinessEngine';
 import { getStimulusZone } from './stimulusEngine';
 
 /**
  * Get recommended exercises for selected focus muscles
  */
 export function getRecommendedExercises(
   focusMuscles: MuscleGroup[],
   sectionStates: Map<MuscleSection, SectionState>
 ): ExerciseRecommendation[] {
   const recommendations: ExerciseRecommendation[] = [];
   const addedExercises = new Set<string>();
   
   for (const muscle of focusMuscles) {
     const sections = getSectionsByMuscle(muscle);
     
     for (const section of sections) {
       const state = sectionStates.get(section.id);
       const readiness = state ? getSectionReadiness(state) : 'READY';
       const zone = state ? getStimulusZone(state.weeklyStimulus) : 'undertrained';
       
       // Prioritize undertrained sections and PRIMED/READY sections
       const shouldRecommend = 
         zone === 'undertrained' || 
         readiness === 'PRIMED' || 
         readiness === 'READY';
       
       if (!shouldRecommend) continue;
       
       const exercises = getExercisesBySection(section.id);
       
       for (const exercise of exercises) {
         if (addedExercises.has(exercise.id)) continue;
         
         const contribution = exercise.contributions[section.id] ?? 0;
         if (contribution < 0.3) continue; // Skip if not a primary target
         
         addedExercises.add(exercise.id);
         
         const priority = calculateExercisePriority(exercise, sectionStates);
         const reason = generateExerciseReason(exercise, section.id, readiness, zone);
         
         recommendations.push({
           exercise,
           reason,
           targetSections: Object.keys(exercise.contributions) as MuscleSection[],
           priority,
         });
       }
     }
   }
   
   return recommendations.sort((a, b) => b.priority - a.priority);
 }
 
 /**
  * Calculate priority score for an exercise
  */
 function calculateExercisePriority(
   exercise: Exercise,
   sectionStates: Map<MuscleSection, SectionState>
 ): number {
   let priority = 0;
   
   for (const [section, weight] of Object.entries(exercise.contributions)) {
     const state = sectionStates.get(section as MuscleSection);
     if (!state) continue;
     
     const readiness = getSectionReadiness(state);
     const zone = getStimulusZone(state.weeklyStimulus);
     
     // Higher priority for PRIMED sections
     if (readiness === 'PRIMED') priority += weight! * 3;
     else if (readiness === 'READY') priority += weight! * 2;
     
     // Higher priority for undertrained sections
     if (zone === 'undertrained') priority += weight! * 2;
   }
   
   return priority;
 }
 
 /**
  * Generate reason text for why an exercise is recommended
  */
 function generateExerciseReason(
   exercise: Exercise,
   section: MuscleSection,
   readiness: string,
   zone: string
 ): string {
   if (readiness === 'PRIMED' && zone === 'undertrained') {
     return `Perfect timing! ${section} is primed and needs more volume.`;
   }
   if (readiness === 'PRIMED') {
     return `${section} is fully recovered and ready for growth.`;
   }
   if (zone === 'undertrained') {
     return `Helps fill your weekly ${section} volume gap.`;
   }
   return `Good compound movement for ${section}.`;
 }
 
 /**
  * Get warnings for selected focus muscles
  */
 export function getWarnings(
   focusMuscles: MuscleGroup[],
   sectionStates: Map<MuscleSection, SectionState>
 ): PlanWarning[] {
   const warnings: PlanWarning[] = [];
   
   for (const muscle of focusMuscles) {
     const sections = getSectionsByMuscle(muscle);
     
     for (const section of sections) {
       const state = sectionStates.get(section.id);
       if (!state) continue;
       
       const readiness = getSectionReadiness(state);
       
       if (readiness === 'RECOVERING' || readiness === 'CAUTION') {
         const alternatives = findAlternatives(section.id, sectionStates);
         warnings.push({
           section: section.id,
           state: readiness,
           message: readiness === 'RECOVERING'
             ? `${section.name} is still recovering. Consider resting or lighter work.`
             : `${section.name} is approaching fatigue. Monitor intensity.`,
           alternatives,
         });
       }
     }
   }
   
   return warnings;
 }
 
 /**
  * Find alternative exercises that target similar goals with less fatigue
  */
 function findAlternatives(
   section: MuscleSection,
   sectionStates: Map<MuscleSection, SectionState>
 ): Exercise[] {
   return EXERCISES.filter(exercise => {
     // Must still hit the target section
     const contribution = exercise.contributions[section];
     if (!contribution || contribution < 0.2) return false;
     
     // Check if secondary muscles are less fatigued
     let betterOption = true;
     for (const [sec, weight] of Object.entries(exercise.contributions)) {
       if (sec === section) continue;
       const state = sectionStates.get(sec as MuscleSection);
       if (state && state.fatigue > 50 && weight! > 0.2) {
         betterOption = false;
         break;
       }
     }
     
     return betterOption;
   }).slice(0, 3);
 }
 
 /**
  * Get suggested focus muscles based on PRIMED status and weekly gaps
  */
 export function getSuggestedFocus(
   sectionStates: Map<MuscleSection, SectionState>
 ): MuscleGroup[] {
   const muscleScores = new Map<MuscleGroup, number>();
   
   for (const [section, state] of sectionStates) {
     const readiness = getSectionReadiness(state);
     const zone = getStimulusZone(state.weeklyStimulus);
     
     // Find which muscle group this section belongs to
     const muscleGroup = getMuscleGroupForSection(section);
     if (!muscleGroup) continue;
     
     const currentScore = muscleScores.get(muscleGroup) ?? 0;
     let score = currentScore;
     
     if (readiness === 'PRIMED') score += 3;
     else if (readiness === 'READY') score += 1;
     else if (readiness === 'CAUTION') score -= 1;
     else if (readiness === 'RECOVERING') score -= 3;
     
     if (zone === 'undertrained') score += 2;
     else if (zone === 'overtrained') score -= 2;
     
     muscleScores.set(muscleGroup, score);
   }
   
   // Sort by score and return top 3
   return Array.from(muscleScores.entries())
     .sort((a, b) => b[1] - a[1])
     .slice(0, CONFIG.ui.maxFocusMuscles)
     .map(([muscle]) => muscle);
 }
 
 function getMuscleGroupForSection(section: MuscleSection): MuscleGroup | null {
   const map: Record<MuscleSection, MuscleGroup> = {
     frontDelt: 'shoulders',
     lateralDelt: 'shoulders',
     rearDelt: 'shoulders',
     lats: 'back',
     upperBack: 'back',
     lowerTraps: 'back',
     erectors: 'back',
     upperChest: 'chest',
     midChest: 'chest',
     lowerChest: 'chest',
     quads: 'legs',
     hamstrings: 'legs',
     glutes: 'legs',
     calves: 'legs',
     biceps: 'biceps',
     triceps: 'triceps',
     forearms: 'forearms',
   };
   return map[section] ?? null;
 }