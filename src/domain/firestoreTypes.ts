import { MuscleGroup, MuscleSection, WeightUnit, WorkoutLocation } from './types';

// -- Firestore Document Interfaces --

export interface UserDocument {
    createdAt: number;
    lastLoginAt: number;
    onboardingCompleted: boolean;
    calibrationStatus: 'not_started' | 'in_progress' | 'done';

    // New fields
    ageYears?: number;
    heightCm?: number;
    weightKg?: number;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SettingsDocument {
    units: WeightUnit;
    defaultWorkoutLocation?: WorkoutLocation;
    preferredTrainingTime?: 'morning' | 'afternoon' | 'evening' | 'night';
    targetSessionsPerWeek: number;
    calibrationMode: boolean;
    goal: 'hypertrophy';
}

export interface FirestoreSetEntry {
    id: string;
    weightKg: number;
    reps: number;
    rpe: number;
    createdAt: number;
}

export interface FirestoreExerciseEntry {
    id: string;
    exerciseId: string;
    name: string;
    targets?: MuscleSection[];
    sets: FirestoreSetEntry[];
}

export interface SessionDocument {
    id: string;
    status: 'in_progress' | 'ended';
    startedAt: number;
    endedAt?: number;
    durationSeconds?: number;

    startedLocation?: WorkoutLocation;
    startedTimeBucket?: 'morning' | 'afternoon' | 'evening' | 'night';
    focusMuscles: MuscleGroup[];
    exerciseEntries: FirestoreExerciseEntry[];

    // Snapshot data
    preWorkoutSorenessSnapshot?: Partial<Record<MuscleSection, number>>;

    // Computed summary (stored once at end)
    computedSummary?: {
        totalExercises: number;
        totalSets: number;
        hardSetsApprox: number;
        loadScore: number;
        primaryMusclesHit: MuscleGroup[];
    };
}

export interface DailyDocument {
    dateKey: string; // YYYY-MM-DD
    sorenessBySectionKey: Partial<Record<MuscleSection, number>>; // 0-4
    updatedAt: number;
}

export interface CoachStateDocument {
    lastWorkoutEndedAt?: number;
    nextRecommendedStartAt?: number;
    restHoursRecommended: number;
    recoveryState: 'REST' | 'CAUTION' | 'READY';
    consistencyState: 'ON_TRACK' | 'MISSED' | 'DRIFTING' | 'RESET';
    averageIntervalHours: number;
    updatedAt: number;
}
