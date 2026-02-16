 import type { Exercise } from '../types';
 
 export const EXERCISES: Exercise[] = [
   // Chest
   {
     id: 'bench-press',
     name: 'Bench Press',
     muscleGroup: 'chest',
     contributions: { midChest: 0.6, triceps: 0.25, frontDelt: 0.15 },
     equipment: ['barbell', 'bench'],
     difficulty: 'intermediate',
     formTip: 'Keep shoulder blades pinched and feet flat on the floor.',
   },
   {
     id: 'incline-press',
     name: 'Incline Press',
     muscleGroup: 'chest',
     contributions: { upperChest: 0.55, frontDelt: 0.25, triceps: 0.2 },
     equipment: ['barbell', 'incline bench'],
     difficulty: 'intermediate',
     formTip: 'Set bench to 30-45 degrees for optimal upper chest activation.',
   },
   {
     id: 'dumbbell-fly',
     name: 'Dumbbell Fly',
     muscleGroup: 'chest',
     contributions: { midChest: 0.7, upperChest: 0.2, lowerChest: 0.1 },
     equipment: ['dumbbells', 'bench'],
     difficulty: 'beginner',
     formTip: 'Keep a slight bend in elbows throughout the movement.',
   },
   {
     id: 'cable-crossover',
     name: 'Cable Crossover',
     muscleGroup: 'chest',
     contributions: { lowerChest: 0.5, midChest: 0.35, frontDelt: 0.15 },
     equipment: ['cable machine'],
     difficulty: 'intermediate',
     formTip: 'Squeeze at the bottom and control the negative.',
   },
   
   // Back
   {
     id: 'lat-pulldown',
     name: 'Lat Pulldown',
     muscleGroup: 'back',
     contributions: { lats: 0.7, biceps: 0.2, forearms: 0.1 },
     equipment: ['cable machine'],
     difficulty: 'beginner',
     formTip: 'Lead with your elbows and squeeze your lats at the bottom.',
   },
   {
     id: 'barbell-row',
     name: 'Barbell Row',
     muscleGroup: 'back',
     contributions: { upperBack: 0.55, lats: 0.25, biceps: 0.2 },
     equipment: ['barbell'],
     difficulty: 'intermediate',
     formTip: 'Keep your back flat and pull to your lower chest.',
   },
   {
     id: 'face-pull',
     name: 'Face Pull',
     muscleGroup: 'back',
     contributions: { rearDelt: 0.5, lowerTraps: 0.3, upperBack: 0.2 },
     equipment: ['cable machine', 'rope attachment'],
     difficulty: 'beginner',
     formTip: 'Pull to face level with external rotation at the end.',
   },
   {
     id: 'seated-row',
     name: 'Seated Cable Row',
     muscleGroup: 'back',
     contributions: { upperBack: 0.45, lats: 0.35, biceps: 0.15, forearms: 0.05 },
     equipment: ['cable machine'],
     difficulty: 'beginner',
     formTip: 'Keep chest up and squeeze shoulder blades together.',
   },
   {
     id: 'deadlift',
     name: 'Deadlift',
     muscleGroup: 'back',
     contributions: { erectors: 0.35, glutes: 0.25, hamstrings: 0.25, lats: 0.15 },
     equipment: ['barbell'],
     difficulty: 'advanced',
     formTip: 'Brace your core and keep the bar close to your body.',
   },
   
   // Shoulders
   {
     id: 'overhead-press',
     name: 'Overhead Press',
     muscleGroup: 'shoulders',
     contributions: { frontDelt: 0.55, lateralDelt: 0.25, triceps: 0.2 },
     equipment: ['barbell'],
     difficulty: 'intermediate',
     formTip: 'Squeeze glutes and brace core for stability.',
   },
   {
     id: 'lateral-raise',
     name: 'Lateral Raise',
     muscleGroup: 'shoulders',
     contributions: { lateralDelt: 0.85, rearDelt: 0.15 },
     equipment: ['dumbbells'],
     difficulty: 'beginner',
     formTip: 'Lead with your elbows, not your wrists.',
   },
   {
     id: 'rear-delt-fly',
     name: 'Rear Delt Fly',
     muscleGroup: 'shoulders',
     contributions: { rearDelt: 0.8, upperBack: 0.2 },
     equipment: ['dumbbells'],
     difficulty: 'beginner',
     formTip: 'Focus on squeezing your rear delts at the top.',
   },
   
   // Legs
   {
     id: 'squat',
     name: 'Squat',
     muscleGroup: 'legs',
     contributions: { quads: 0.5, glutes: 0.35, hamstrings: 0.15 },
     equipment: ['barbell', 'squat rack'],
     difficulty: 'intermediate',
     formTip: 'Keep your chest up and push knees out over toes.',
   },
   {
     id: 'rdl',
     name: 'Romanian Deadlift',
     muscleGroup: 'legs',
     contributions: { hamstrings: 0.55, glutes: 0.25, erectors: 0.2 },
     equipment: ['barbell'],
     difficulty: 'intermediate',
     formTip: 'Hinge at the hips and feel the stretch in hamstrings.',
   },
   {
     id: 'leg-press',
     name: 'Leg Press',
     muscleGroup: 'legs',
     contributions: { quads: 0.6, glutes: 0.25, hamstrings: 0.15 },
     equipment: ['leg press machine'],
     difficulty: 'beginner',
     formTip: 'Don\'t lock out knees at the top.',
   },
   {
     id: 'leg-curl',
     name: 'Leg Curl',
     muscleGroup: 'legs',
     contributions: { hamstrings: 0.9, calves: 0.1 },
     equipment: ['leg curl machine'],
     difficulty: 'beginner',
     formTip: 'Control the weight on the way down.',
   },
   {
     id: 'calf-raise',
     name: 'Calf Raise',
     muscleGroup: 'legs',
     contributions: { calves: 1.0 },
     equipment: ['calf raise machine'],
     difficulty: 'beginner',
     formTip: 'Pause at the top for maximum contraction.',
   },
   {
     id: 'hip-thrust',
     name: 'Hip Thrust',
     muscleGroup: 'legs',
     contributions: { glutes: 0.75, hamstrings: 0.25 },
     equipment: ['barbell', 'bench'],
     difficulty: 'intermediate',
     formTip: 'Squeeze glutes hard at the top and control the descent.',
   },
   
   // Biceps
   {
     id: 'bicep-curl',
     name: 'Bicep Curl',
     muscleGroup: 'biceps',
     contributions: { biceps: 0.85, forearms: 0.15 },
     equipment: ['dumbbells'],
     difficulty: 'beginner',
     formTip: 'Keep elbows pinned to your sides throughout.',
   },
   {
     id: 'hammer-curl',
     name: 'Hammer Curl',
     muscleGroup: 'biceps',
     contributions: { biceps: 0.6, forearms: 0.4 },
     equipment: ['dumbbells'],
     difficulty: 'beginner',
     formTip: 'Neutral grip targets brachialis and forearms.',
   },
   {
     id: 'preacher-curl',
     name: 'Preacher Curl',
     muscleGroup: 'biceps',
     contributions: { biceps: 0.9, forearms: 0.1 },
     equipment: ['ez-bar', 'preacher bench'],
     difficulty: 'beginner',
     formTip: 'Control the negative for maximum bicep stretch.',
   },
   
   // Triceps
   {
     id: 'tricep-pushdown',
     name: 'Tricep Pushdown',
     muscleGroup: 'triceps',
     contributions: { triceps: 0.9, forearms: 0.1 },
     equipment: ['cable machine'],
     difficulty: 'beginner',
     formTip: 'Keep elbows tight and squeeze at the bottom.',
   },
   {
     id: 'skull-crusher',
     name: 'Skull Crusher',
     muscleGroup: 'triceps',
     contributions: { triceps: 0.95, forearms: 0.05 },
     equipment: ['barbell', 'bench'],
     difficulty: 'intermediate',
     formTip: 'Lower the bar to your forehead with controlled motion.',
   },
   {
     id: 'tricep-dip',
     name: 'Tricep Dip',
     muscleGroup: 'triceps',
     contributions: { triceps: 0.7, frontDelt: 0.15, midChest: 0.15 },
     equipment: ['dip bars'],
     difficulty: 'intermediate',
     formTip: 'Keep elbows close to body for tricep emphasis.',
   },
   
   // Forearms
   {
     id: 'wrist-curl',
     name: 'Wrist Curl',
     muscleGroup: 'forearms',
     contributions: { forearms: 1.0 },
     equipment: ['dumbbells'],
     difficulty: 'beginner',
     formTip: 'Rest forearms on thighs and curl through full range.',
   },
   {
     id: 'reverse-curl',
     name: 'Reverse Curl',
     muscleGroup: 'forearms',
     contributions: { forearms: 0.7, biceps: 0.3 },
     equipment: ['barbell'],
     difficulty: 'beginner',
     formTip: 'Overhand grip emphasizes forearm extensors.',
   },
 ];
 
 export const getExerciseById = (id: string): Exercise | undefined =>
   EXERCISES.find(e => e.id === id);
 
 export const getExercisesByMuscle = (muscleGroup: string): Exercise[] =>
   EXERCISES.filter(e => e.muscleGroup === muscleGroup);
 
 export const getExercisesBySection = (section: string): Exercise[] =>
   EXERCISES.filter(e => section in e.contributions);