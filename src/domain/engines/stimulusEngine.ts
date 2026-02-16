 import { CONFIG } from '../config';
 import type { LoggedSet, MuscleSection, SectionState, StimulusZone } from '../types';
 import { getExerciseById } from '../catalog/exercises';
 
 /**
  * Determine if a set counts as a "hard set" (effective for hypertrophy)
  * Generally RPE 7+ or RIR 3 or less
  */
 export function isHardSet(rpe: number): boolean {
   return rpe >= 7;
 }
 
 /**
  * Calculate stimulus points from a set for each affected section
  */
 export function calculateStimulusFromSet(
   set: LoggedSet
 ): Map<MuscleSection, number> {
   const exercise = getExerciseById(set.exerciseId);
   if (!exercise) return new Map();
   
   const stimulus = new Map<MuscleSection, number>();
   
   // Only hard sets contribute to hypertrophy stimulus
   if (!isHardSet(set.rpe)) return stimulus;
   
   for (const [section, weight] of Object.entries(exercise.contributions)) {
     if (weight && weight > 0) {
       // Weight the stimulus by contribution (primary movers get more credit)
       const points = weight >= 0.5 ? 1 : weight >= 0.2 ? 0.5 : 0.25;
       stimulus.set(section as MuscleSection, points);
     }
   }
   
   return stimulus;
 }
 
 /**
  * Get the stimulus zone for a section based on weekly stimulus
  */
 export function getStimulusZone(weeklyStimulus: number): StimulusZone {
   const { stimulus } = CONFIG;
   
   if (weeklyStimulus < stimulus.minSetsPerWeek) return 'undertrained';
   if (weeklyStimulus > stimulus.maxSetsPerWeek) return 'overtrained';
   return 'optimal';
 }
 
 /**
  * Get color for stimulus zone
  */
 export function getStimulusZoneColor(zone: StimulusZone): string {
   switch (zone) {
     case 'undertrained': return 'bg-zone-low';
     case 'optimal': return 'bg-zone-optimal';
     case 'overtrained': return 'bg-zone-overtrained';
   }
 }
 
 /**
  * Calculate sets remaining to reach optimal zone
  */
 export function getSetsToOptimal(weeklyStimulus: number): number {
   const { stimulus } = CONFIG;
   if (weeklyStimulus >= stimulus.optimalSetsMin) return 0;
   return stimulus.optimalSetsMin - weeklyStimulus;
 }
 
 /**
  * Calculate progress through the stimulus range as percentage
  */
 export function getStimulusProgress(weeklyStimulus: number): number {
   const { stimulus } = CONFIG;
   return Math.min(100, (weeklyStimulus / stimulus.optimalSetsMax) * 100);
 }
 
 /**
  * Check if it's time to reset weekly stimulus (start of new week)
  */
 export function shouldResetWeeklyStimulus(lastResetTimestamp: number): boolean {
   const { stimulus } = CONFIG;
   const now = new Date();
   const lastReset = new Date(lastResetTimestamp);
   
   // Get the most recent reset day
   const currentDay = now.getDay();
   const daysSinceReset = (currentDay - stimulus.weekResetDay + 7) % 7;
   
   // If we're past the reset day and last reset was before this week
   const thisWeekReset = new Date(now);
   thisWeekReset.setDate(now.getDate() - daysSinceReset);
   thisWeekReset.setHours(0, 0, 0, 0);
   
   return lastReset < thisWeekReset;
 }