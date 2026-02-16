 import type { MuscleSection, SectionState, WorkoutSession } from '@/domain/types';
 import { SECTIONS } from '@/domain/taxonomy/muscles';
import { getExerciseById } from '@/domain/catalog/exercises';
 
 /**
  * Creates seed section states with realistic initial values
  * Simulates a user who trained chest/back 2 days ago, legs yesterday
  */
 export function createSeedSectionStates(): Map<MuscleSection, SectionState> {
   const now = Date.now();
   const twoDaysAgo = now - 48 * 60 * 60 * 1000;
   const oneDayAgo = now - 24 * 60 * 60 * 1000;
   
   const states = new Map<MuscleSection, SectionState>();
   
   // Shoulders - mixed states
   states.set('frontDelt', { fatigue: 25, weeklyStimulus: 4, lastTrainedAt: twoDaysAgo });
   states.set('lateralDelt', { fatigue: 10, weeklyStimulus: 2, lastTrainedAt: twoDaysAgo });
   states.set('rearDelt', { fatigue: 15, weeklyStimulus: 3, lastTrainedAt: twoDaysAgo });
   
   // Back - mostly recovered, some PRIMED
   states.set('lats', { fatigue: 18, weeklyStimulus: 6, lastTrainedAt: twoDaysAgo });
   states.set('upperBack', { fatigue: 12, weeklyStimulus: 5, lastTrainedAt: twoDaysAgo });
   states.set('lowerTraps', { fatigue: 8, weeklyStimulus: 2, lastTrainedAt: twoDaysAgo });
   states.set('erectors', { fatigue: 30, weeklyStimulus: 3, lastTrainedAt: oneDayAgo });
   
   // Chest - recovering from recent workout
   states.set('upperChest', { fatigue: 45, weeklyStimulus: 8, lastTrainedAt: twoDaysAgo });
   states.set('midChest', { fatigue: 55, weeklyStimulus: 10, lastTrainedAt: twoDaysAgo });
   states.set('lowerChest', { fatigue: 35, weeklyStimulus: 4, lastTrainedAt: twoDaysAgo });
   
   // Legs - fatigued from yesterday
   states.set('quads', { fatigue: 65, weeklyStimulus: 8, lastTrainedAt: oneDayAgo });
   states.set('hamstrings', { fatigue: 55, weeklyStimulus: 6, lastTrainedAt: oneDayAgo });
   states.set('glutes', { fatigue: 50, weeklyStimulus: 7, lastTrainedAt: oneDayAgo });
   states.set('calves', { fatigue: 40, weeklyStimulus: 4, lastTrainedAt: oneDayAgo });
   
   // Biceps - PRIMED (not trained recently)
   states.set('biceps', { fatigue: 5, weeklyStimulus: 2, lastTrainedAt: twoDaysAgo });
   
   // Triceps - some fatigue from pressing movements
   states.set('triceps', { fatigue: 15, weeklyStimulus: 4, lastTrainedAt: twoDaysAgo });
   
   // Forearms - low stimulus
   states.set('forearms', { fatigue: 8, weeklyStimulus: 2, lastTrainedAt: twoDaysAgo });
   
   return states;
 }
 
 /**
  * Creates seed workout sessions for history
  */
 export function createSeedSessions(): WorkoutSession[] {
   const now = Date.now();
   const twoDaysAgo = now - 48 * 60 * 60 * 1000;
   const oneDayAgo = now - 24 * 60 * 60 * 1000;
   
  const benchPress = getExerciseById('bench-press');
  const inclinePress = getExerciseById('incline-press');
  const latPulldown = getExerciseById('lat-pulldown');
  const barbellRow = getExerciseById('barbell-row');
  const squat = getExerciseById('squat');
  const rdl = getExerciseById('rdl');
  const legPress = getExerciseById('leg-press');
  const legCurl = getExerciseById('leg-curl');

   return [
     {
       id: 'seed-session-1',
       startedAt: twoDaysAgo,
       endedAt: twoDaysAgo + 60 * 60 * 1000, // 1 hour
       focusMuscles: ['chest', 'back'],
      exerciseEntries: [
        {
          id: 'ee1',
          exerciseId: 'bench-press',
          name: benchPress?.name ?? 'Bench Press',
          targets: Object.keys(benchPress?.contributions ?? {}) as MuscleSection[],
          sets: [
            { id: 'se1', weightKg: 61.2, reps: 10, rpe: 8, createdAt: twoDaysAgo },
            { id: 'se2', weightKg: 70.3, reps: 8, rpe: 9, createdAt: twoDaysAgo + 5 * 60000 },
          ],
        },
        {
          id: 'ee2',
          exerciseId: 'incline-press',
          name: inclinePress?.name ?? 'Incline Press',
          targets: Object.keys(inclinePress?.contributions ?? {}) as MuscleSection[],
          sets: [
            { id: 'se3', weightKg: 52.2, reps: 10, rpe: 8, createdAt: twoDaysAgo + 15 * 60000 },
          ],
        },
        {
          id: 'ee3',
          exerciseId: 'lat-pulldown',
          name: latPulldown?.name ?? 'Lat Pulldown',
          targets: Object.keys(latPulldown?.contributions ?? {}) as MuscleSection[],
          sets: [
            { id: 'se4', weightKg: 54.4, reps: 12, rpe: 7, createdAt: twoDaysAgo + 30 * 60000 },
          ],
        },
        {
          id: 'ee4',
          exerciseId: 'barbell-row',
          name: barbellRow?.name ?? 'Barbell Row',
          targets: Object.keys(barbellRow?.contributions ?? {}) as MuscleSection[],
          sets: [
            { id: 'se5', weightKg: 61.2, reps: 10, rpe: 8, createdAt: twoDaysAgo + 45 * 60000 },
          ],
        },
      ],
       sets: [
         { id: 's1', exerciseId: 'bench-press', weight: 135, reps: 10, rpe: 8, timestamp: twoDaysAgo },
         { id: 's2', exerciseId: 'bench-press', weight: 155, reps: 8, rpe: 9, timestamp: twoDaysAgo + 5 * 60000 },
         { id: 's3', exerciseId: 'incline-press', weight: 115, reps: 10, rpe: 8, timestamp: twoDaysAgo + 15 * 60000 },
         { id: 's4', exerciseId: 'lat-pulldown', weight: 120, reps: 12, rpe: 7, timestamp: twoDaysAgo + 30 * 60000 },
         { id: 's5', exerciseId: 'barbell-row', weight: 135, reps: 10, rpe: 8, timestamp: twoDaysAgo + 45 * 60000 },
       ],
     },
     {
       id: 'seed-session-2',
       startedAt: oneDayAgo,
       endedAt: oneDayAgo + 75 * 60 * 1000, // 1.25 hours
       focusMuscles: ['legs'],
      exerciseEntries: [
        {
          id: 'ee5',
          exerciseId: 'squat',
          name: squat?.name ?? 'Squat',
          targets: Object.keys(squat?.contributions ?? {}) as MuscleSection[],
          sets: [
            { id: 'se6', weightKg: 83.9, reps: 8, rpe: 9, createdAt: oneDayAgo },
            { id: 'se7', weightKg: 93.0, reps: 6, rpe: 9, createdAt: oneDayAgo + 10 * 60000 },
          ],
        },
        {
          id: 'ee6',
          exerciseId: 'rdl',
          name: rdl?.name ?? 'Romanian Deadlift',
          targets: Object.keys(rdl?.contributions ?? {}) as MuscleSection[],
          sets: [
            { id: 'se8', weightKg: 70.3, reps: 10, rpe: 8, createdAt: oneDayAgo + 25 * 60000 },
          ],
        },
        {
          id: 'ee7',
          exerciseId: 'leg-press',
          name: legPress?.name ?? 'Leg Press',
          targets: Object.keys(legPress?.contributions ?? {}) as MuscleSection[],
          sets: [
            { id: 'se9', weightKg: 122.5, reps: 12, rpe: 8, createdAt: oneDayAgo + 40 * 60000 },
          ],
        },
        {
          id: 'ee8',
          exerciseId: 'leg-curl',
          name: legCurl?.name ?? 'Leg Curl',
          targets: Object.keys(legCurl?.contributions ?? {}) as MuscleSection[],
          sets: [
            { id: 'se10', weightKg: 40.8, reps: 12, rpe: 7, createdAt: oneDayAgo + 55 * 60000 },
          ],
        },
      ],
       sets: [
         { id: 's6', exerciseId: 'squat', weight: 185, reps: 8, rpe: 9, timestamp: oneDayAgo },
         { id: 's7', exerciseId: 'squat', weight: 205, reps: 6, rpe: 9, timestamp: oneDayAgo + 10 * 60000 },
         { id: 's8', exerciseId: 'rdl', weight: 155, reps: 10, rpe: 8, timestamp: oneDayAgo + 25 * 60000 },
         { id: 's9', exerciseId: 'leg-press', weight: 270, reps: 12, rpe: 8, timestamp: oneDayAgo + 40 * 60000 },
         { id: 's10', exerciseId: 'leg-curl', weight: 90, reps: 12, rpe: 7, timestamp: oneDayAgo + 55 * 60000 },
       ],
     },
   ];
 }