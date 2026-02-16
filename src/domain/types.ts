// FatigueFit Domain Types

export type MuscleGroup = 'shoulders' | 'back' | 'chest' | 'legs' | 'biceps' | 'triceps' | 'forearms';

export type MuscleSection =
  // Shoulders
  // Shoulders
  | 'frontDelt' | 'lateralDelt' | 'rearDelt'
  // Back
  | 'lats' | 'upperBack' | 'lowerTraps' | 'erectors'
  // Chest
  | 'upperChest' | 'midChest' | 'lowerChest'
  // Legs
  | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  // Biceps, Triceps, Forearms (separate groups)
  | 'biceps' | 'triceps' | 'forearms';

export type ReadinessState = 'RECOVERING' | 'CAUTION' | 'READY' | 'PRIMED';

export type StimulusZone = 'undertrained' | 'optimal' | 'overtrained';

export type UserMode = 'beginner' | 'intermediate';

export type Goal = 'hypertrophy';

export type TimePreference = 'morning' | 'afternoon' | 'evening';

export type WeightUnit = 'lb' | 'kg';

export interface SectionState {
  fatigue: number; // 0-100
  weeklyStimulus: number; // accumulated hard sets
  lastTrainedAt: number | null; // timestamp
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  contributions: Partial<Record<MuscleSection, number>>; // 0-1 weights
  equipment?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  formTip?: string;
}

// New exercise-wise workout types
export interface SetEntry {
  id: string;
  weightKg: number; // Always stored in kg internally
  reps: number;
  rpe: number; // 1-10
  createdAt: number;
}

export interface ExerciseEntry {
  id: string;
  exerciseId: string;
  name: string;
  targets: MuscleSection[];
  sets: SetEntry[];
}

// Legacy LoggedSet kept for backward compatibility
export interface LoggedSet {
  id: string;
  exerciseId: string;
  weight: number; // In display unit (legacy)
  reps: number;
  rpe: number; // 1-10
  timestamp: number;
}

export interface UserSettings {
  units: WeightUnit;
  calibrationMode: boolean;
}

export interface WorkoutLocation {
  type: 'home' | 'gym' | 'other';
  label?: string;
}

export interface UserProfile {
  mode: UserMode;
  goal: Goal;
  daysPerWeek: number;
  sessionLength: number; // minutes
  timePreference: TimePreference;
  isOnboarded: boolean;
  isCalibrating: boolean; // Deprecated, use settings.calibrationMode
  fatigueSensitivity: number; // multiplier, default 1
  createdAt: number;
  weightUnit: WeightUnit; // Deprecated, use settings.units
  defaultWorkoutLocation?: WorkoutLocation;
}

export type SorenessMap = Partial<Record<MuscleSection, number>>; // 0-4

export interface WorkoutSession {
  id: string;
  startedAt: number;
  endedAt: number | null;
  startedLocation?: WorkoutLocation;
  durationSeconds?: number;
  status: 'in_progress' | 'ended';
  focusMuscles: MuscleGroup[];
  exerciseEntries: ExerciseEntry[];
  sets: LoggedSet[]; // Legacy, kept for backward compatibility
  preWorkoutSorenessSnapshot?: SorenessMap;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  requirement: string;
}

export interface UserStats {
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  prsUnlocked: number;
  heaviestLift: { exercise: string; weight: number } | null;
  favoriteMuscle: MuscleGroup | null;
  recoveryScore: number;
}

export interface PlanWarning {
  section: MuscleSection;
  state: ReadinessState;
  message: string;
  alternatives: Exercise[];
}

export interface ExerciseRecommendation {
  exercise: Exercise;
  reason: string;
  targetSections: MuscleSection[];
  priority: number;
}

export type ConsistencyState = 'ON_TRACK' | 'MISSED' | 'DRIFTING' | 'RESET';
export type RecoveryState = 'REST' | 'CAUTION' | 'READY';

export interface UserCoachState {
  lastEndedSessionId?: string;
  lastWorkoutEndedAt?: number;
  nextRecommendedStartAt?: number;
  restHoursRecommended?: number;
  averageIntervalHours?: number;
  daysSinceLastWorkout?: number;
  consistencyState: ConsistencyState;
  recoveryState: RecoveryState;
  coachBanner: CoachBanner;
  updatedAt: number;
}

export interface CoachBanner {
  title: string;
  subtitle: string;
  severity: 'default' | 'success' | 'warning' | 'destructive'; // Maps to UI colors
  primaryCta: string;
  secondaryCta?: string;
}