import { z } from 'zod';
import type { MuscleSection } from '@/domain/types';
import { SECTIONS } from '@/domain/taxonomy/muscles';

const STORAGE_KEY = 'fatiguefit-state';

// Zod schemas for validation
const SectionStateSchema = z.object({
  fatigue: z.number().min(0).max(100),
  weeklyStimulus: z.number().min(0),
  lastTrainedAt: z.number().nullable(),
});

const WorkoutLocationSchema = z.object({
  type: z.enum(['home', 'gym', 'other']),
  label: z.string().optional(),
});

const UserSettingsSchema = z.object({
  units: z.enum(['lb', 'kg']),
  calibrationMode: z.boolean(),
});

const ProfileSchema = z.object({
  mode: z.enum(['beginner', 'intermediate']),
  goal: z.literal('hypertrophy'),
  daysPerWeek: z.number().min(1).max(7),
  sessionLength: z.number().min(15).max(180),
  timePreference: z.enum(['morning', 'afternoon', 'evening']),
  isOnboarded: z.boolean(),
  isCalibrating: z.boolean(), // Deprecated
  fatigueSensitivity: z.number().min(0.5).max(2),
  createdAt: z.number(),
  weightUnit: z.enum(['lb', 'kg']), // Deprecated
  defaultWorkoutLocation: WorkoutLocationSchema.optional(),
});

const LoggedSetSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  weight: z.number().min(0),
  reps: z.number().min(1),
  rpe: z.number().min(1).max(10),
  timestamp: z.number(),
});

const SorenessMapSchema = z.record(z.string(), z.number().min(0).max(4));

const SessionSchema = z.object({
  id: z.string(),
  startedAt: z.number(),
  endedAt: z.number().nullable(),
  startedLocation: WorkoutLocationSchema.optional(),
  durationSeconds: z.number().optional(),
  status: z.enum(['in_progress', 'ended']).optional(),
  focusMuscles: z.array(z.enum(['shoulders', 'back', 'chest', 'legs', 'biceps', 'triceps', 'forearms'])),
  sets: z.array(LoggedSetSchema),
  exerciseEntries: z.array(z.any()).optional(), // Add validation later if needed
  preWorkoutSorenessSnapshot: SorenessMapSchema.optional(),
});

const StatsSchema = z.object({
  totalSessions: z.number(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  prsUnlocked: z.number(),
  heaviestLift: z.object({
    exercise: z.string(),
    weight: z.number(),
  }).nullable(),
  favoriteMuscle: z.enum(['shoulders', 'back', 'chest', 'legs', 'biceps', 'triceps', 'forearms']).nullable(),
  recoveryScore: z.number(),
});

const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.number().nullable(),
  requirement: z.string(),
});

const StoredStateSchema = z.object({
  profile: ProfileSchema,
  settings: UserSettingsSchema.optional(),
  sectionStates: z.record(z.string(), SectionStateSchema),
  dailySoreness: SorenessMapSchema.optional(),
  dailySorenessUpdatedAt: z.number().optional(),
  focusMuscles: z.array(z.enum(['shoulders', 'back', 'chest', 'legs', 'biceps', 'triceps', 'forearms'])),
  sessions: z.array(SessionSchema),
  stats: StatsSchema,
  badges: z.array(BadgeSchema),
  lastWeeklyReset: z.number(),
});

type StoredState = z.infer<typeof StoredStateSchema>;

export function saveState(state: any): void {
  try {
    // Convert Map to object for JSON storage
    const sectionStatesObj: Record<string, any> = {};
    for (const [key, value] of state.sectionStates) {
      sectionStatesObj[key] = value;
    }

    const toStore: StoredState = {
      profile: state.profile,
      settings: state.settings,
      sectionStates: sectionStatesObj,
      dailySoreness: state.dailySoreness,
      dailySorenessUpdatedAt: state.dailySorenessUpdatedAt,
      focusMuscles: state.focusMuscles,
      sessions: state.sessions,
      stats: state.stats,
      badges: state.badges,
      lastWeeklyReset: state.lastWeeklyReset,
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'SecurityError') {
      console.warn('Failed to save state:', error);
    }
  }
}

export function loadState(): any | null {
  try {
    if (typeof localStorage === 'undefined') return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    let parsed = JSON.parse(stored);

    // Migration: Convert old 'arms' references to new muscle groups
    parsed = migrateArmsData(parsed);

    const validated = StoredStateSchema.parse(parsed);

    // Convert object back to Map
    const sectionStates = new Map<MuscleSection, any>();
    for (const section of SECTIONS) {
      const state = validated.sectionStates[section.id];
      if (state) {
        sectionStates.set(section.id, state);
      } else {
        sectionStates.set(section.id, {
          fatigue: 0,
          weeklyStimulus: 0,
          lastTrainedAt: null,
        });
      }
    }

    return {
      profile: validated.profile,
      settings: validated.settings,
      sectionStates,
      dailySoreness: validated.dailySoreness,
      dailySorenessUpdatedAt: validated.dailySorenessUpdatedAt,
      focusMuscles: validated.focusMuscles,
      currentSession: null,
      sessions: validated.sessions,
      stats: validated.stats,
      badges: validated.badges,
      lastWeeklyReset: validated.lastWeeklyReset,
    };
  } catch (error) {
    if (error instanceof Error && error.name !== 'SecurityError') {
      console.warn('Failed to load state:', error);
    }
    return null;
  }
}

/**
 * Migrate old 'arms' data to biceps/triceps/forearms
 */
function migrateArmsData(data: any): any {
  // Migrate focusMuscles
  if (data.focusMuscles && Array.isArray(data.focusMuscles)) {
    data.focusMuscles = data.focusMuscles.flatMap((m: string) =>
      m === 'arms' ? ['biceps', 'triceps'] : [m]
    );
  }

  // Migrate session focusMuscles
  if (data.sessions && Array.isArray(data.sessions)) {
    data.sessions = data.sessions.map((session: any) => ({
      ...session,
      focusMuscles: session.focusMuscles?.flatMap((m: string) =>
        m === 'arms' ? ['biceps', 'triceps'] : [m]
      ) ?? [],
    }));
  }

  // Migrate favoriteMuscle
  if (data.stats?.favoriteMuscle === 'arms') {
    data.stats.favoriteMuscle = 'biceps';
  }

  return data;
}