import { create } from 'zustand';
import { calculateFatigueGain, calculateRecovery } from '@/domain/engines/fatigueEngine';
import { calculateStimulusFromSet } from '@/domain/engines/stimulusEngine';
import { getExerciseById } from '@/domain/catalog/exercises';
import type {
  Badge,
  ExerciseEntry,
  LoggedSet,
  MuscleGroup,
  MuscleSection,
  SectionState,
  SetEntry,
  UserProfile,
  UserSettings,
  UserStats,
  WorkoutLocation,
  WorkoutSession,
} from '@/domain/types';
import { SECTIONS } from '@/domain/taxonomy/muscles';
import { loadState, saveState } from './persistence';
import { computeCoachState } from '@/domain/engines/coachEngine';
import { UserCoachState } from '@/domain/types';
import { auth, googleProvider, onAuthStateChanged } from '@/lib/firebase';
import { signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import * as FirestoreService from '@/lib/firestore';

export interface AppState {
  // User profile & settings
  profile: UserProfile;
  settings: UserSettings;

  // Section states (fatigue, stimulus, last trained)
  sectionStates: Map<MuscleSection, SectionState>;

  // Today's focus
  focusMuscles: MuscleGroup[];

  // Daily soreness tracking
  dailySoreness: Record<string, number>; // key is MuscleSection
  dailySorenessUpdatedAt: number;

  // Current workout session
  currentSession: WorkoutSession | null;

  // Session history
  sessions: WorkoutSession[];

  // Stats
  stats: UserStats;

  // Badges
  badges: Badge[];

  // Coach State
  coach: UserCoachState | null;

  // Auth & Sync
  user: FirebaseUser | null;
  isSyncing: boolean;

  // Last weekly reset timestamp
  lastWeeklyReset: number;

  // Actions
  setProfile: (profile: Partial<UserProfile>) => void;
  setSettings: (settings: Partial<UserSettings>) => void;
  setFocusMuscles: (muscles: MuscleGroup[]) => void;
  setSoreness: (section: MuscleSection, level: number) => void;
  startSession: (focusMuscles: MuscleGroup[], location?: WorkoutLocation) => void;
  endSession: () => void;
  addExerciseEntry: (exerciseId: string) => ExerciseEntry | null;
  logSetToExercise: (exerciseEntryId: string, set: Omit<SetEntry, 'id' | 'createdAt'>) => void;
  updateSet: (exerciseEntryId: string, setId: string, update: Partial<Omit<SetEntry, 'id' | 'createdAt'>>) => void;
  deleteSet: (exerciseEntryId: string, setId: string) => void;
  removeExerciseEntry: (exerciseEntryId: string) => void;
  updateSectionState: (section: MuscleSection, update: Partial<SectionState>) => void;
  applyRecovery: () => void;
  resetWeeklyStimulus: () => void;
  resetAllData: () => void;
  hydrate: () => void;
  getLastSetForExercise: (exerciseId: string) => SetEntry | null;

  // New Actions
  recomputeCoachState: () => void;
  initializeAuthListener: () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const createInitialSectionStates = (): Map<MuscleSection, SectionState> => {
  const states = new Map<MuscleSection, SectionState>();
  for (const section of SECTIONS) {
    states.set(section.id, {
      fatigue: 0,
      weeklyStimulus: 0,
      lastTrainedAt: null,
    });
  }
  return states;
};

const createInitialProfile = (): UserProfile => ({
  mode: 'intermediate',
  goal: 'hypertrophy',
  daysPerWeek: 4,
  sessionLength: 60,
  timePreference: 'afternoon',
  isOnboarded: false,
  isCalibrating: true, // Deprecated
  fatigueSensitivity: 1.0,
  createdAt: Date.now(),
  weightUnit: 'lb', // Deprecated
  defaultWorkoutLocation: { type: 'gym' },
});

const createInitialSettings = (): UserSettings => ({
  units: 'lb',
  calibrationMode: true,
});

const createInitialStats = (): UserStats => ({
  totalSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  prsUnlocked: 0,
  heaviestLift: null,
  favoriteMuscle: null,
  recoveryScore: 100,
});

const createInitialBadges = (): Badge[] => [
  {
    id: 'first-workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🏋️',
    unlockedAt: null,
    requirement: 'Complete 1 workout',
  },
  {
    id: 'consistency-7',
    name: 'Week Warrior',
    description: 'Train for 7 days straight',
    icon: '🔥',
    unlockedAt: null,
    requirement: '7 day streak',
  },
  {
    id: 'full-body',
    name: 'Full Body Focus',
    description: 'Hit all muscle groups in one week',
    icon: '💪',
    unlockedAt: null,
    requirement: 'Train all 5 muscle groups',
  },
  {
    id: 'pr-crusher',
    name: 'PR Crusher',
    description: 'Set a new personal record',
    icon: '🏆',
    unlockedAt: null,
    requirement: 'Beat a previous best',
  },
  {
    id: 'recovery-master',
    name: 'Recovery Master',
    description: 'Maintain high body readiness for a week',
    icon: '🧘',
    unlockedAt: null,
    requirement: 'Keep readiness above 80%',
  },
];

export const useStore = create<AppState>((set, get) => ({
  profile: createInitialProfile(),
  settings: createInitialSettings(),
  sectionStates: createInitialSectionStates(),
  focusMuscles: ['chest', 'biceps'],
  dailySoreness: {},
  dailySorenessUpdatedAt: Date.now(),
  currentSession: null,
  sessions: [],
  stats: createInitialStats(),
  badges: createInitialBadges(),
  lastWeeklyReset: Date.now(),
  coach: null,
  user: null,
  isSyncing: false,

  setProfile: (update) => {
    set((state) => ({
      profile: { ...state.profile, ...update },
    }));
    saveState(get());
  },

  setSettings: (update) => {
    set((state) => ({
      settings: { ...state.settings, ...update },
    }));
    saveState(get());
  },

  setFocusMuscles: (muscles) => {
    set({ focusMuscles: muscles });
    saveState(get());
  },

  setSoreness: (section, level) => {
    set((state) => ({
      dailySoreness: { ...state.dailySoreness, [section]: level },
      dailySorenessUpdatedAt: Date.now(),
    }));
    saveState(get());
  },

  startSession: (focusMuscles, location) => {
    const { profile } = get();
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      startedAt: Date.now(),
      endedAt: null,
      startedLocation: location || profile.defaultWorkoutLocation,
      status: 'in_progress',
      focusMuscles,
      preWorkoutSorenessSnapshot: get().dailySoreness,
      exerciseEntries: [],
      sets: [],
    };
    set({ currentSession: session, focusMuscles });
    saveState(get());
  },

  endSession: () => {
    const { currentSession, sessions, stats, badges } = get();
    if (!currentSession) return;

    const endedAt = Date.now();
    const durationSeconds = Math.round((endedAt - currentSession.startedAt) / 1000);

    const completedSession: WorkoutSession = {
      ...currentSession,
      endedAt,
      durationSeconds,
      status: 'ended',
    };

    // Update stats
    const newStats = { ...stats };
    newStats.totalSessions += 1;
    newStats.currentStreak += 1;
    if (newStats.currentStreak > newStats.longestStreak) {
      newStats.longestStreak = newStats.currentStreak;
    }

    // Check for first workout badge
    const updatedBadges = badges.map((badge) => {
      if (badge.id === 'first-workout' && !badge.unlockedAt && newStats.totalSessions >= 1) {
        return { ...badge, unlockedAt: Date.now() };
      }
      if (badge.id === 'consistency-7' && !badge.unlockedAt && newStats.currentStreak >= 7) {
        return { ...badge, unlockedAt: Date.now() };
      }
      return badge;
    });

    // 1. Update Local State
    set({
      currentSession: null,
      sessions: [...sessions, completedSession],
      stats: newStats,
      badges: updatedBadges,
    });

    // 2. Recompute Coach
    get().recomputeCoachState();

    // 3. Persist to Firestore if logged in
    const user = get().user;
    if (user) {
      FirestoreService.saveWorkoutSession(user.uid, completedSession);
      // We could save stats too, but respecting YAGNI for now based on prompt scope
    }

    saveState(get());
  },

  addExerciseEntry: (exerciseId) => {
    const { currentSession } = get();
    if (!currentSession) return null;

    // Check if exercise already exists
    const existing = currentSession.exerciseEntries.find(e => e.exerciseId === exerciseId);
    if (existing) return existing;

    const exercise = getExerciseById(exerciseId);
    if (!exercise) return null;

    const entry: ExerciseEntry = {
      id: crypto.randomUUID(),
      exerciseId,
      name: exercise.name,
      targets: Object.keys(exercise.contributions) as MuscleSection[],
      sets: [],
    };

    set({
      currentSession: {
        ...currentSession,
        exerciseEntries: [...currentSession.exerciseEntries, entry],
      },
    });
    saveState(get());
    return entry;
  },

  logSetToExercise: (exerciseEntryId, setData) => {
    const { currentSession, sectionStates, stats, profile } = get();
    if (!currentSession) return;

    const entryIndex = currentSession.exerciseEntries.findIndex(e => e.id === exerciseEntryId);
    if (entryIndex === -1) return;

    const entry = currentSession.exerciseEntries[entryIndex];
    const exercise = getExerciseById(entry.exerciseId);
    if (!exercise) return;

    const newSet: SetEntry = {
      id: crypto.randomUUID(),
      weightKg: setData.weightKg,
      reps: setData.reps,
      rpe: setData.rpe,
      createdAt: Date.now(),
    };

    // Create legacy LoggedSet for fatigue calculation compatibility
    const legacySet: LoggedSet = {
      id: newSet.id,
      exerciseId: entry.exerciseId,
      weight: setData.weightKg * 2.20462, // Convert to lb for legacy
      reps: setData.reps,
      rpe: setData.rpe,
      timestamp: newSet.createdAt,
    };

    // Update section states
    const newSectionStates = new Map(sectionStates);

    for (const [section, weight] of Object.entries(exercise.contributions)) {
      if (weight && (weight as number) > 0) {
        const currentState = newSectionStates.get(section as MuscleSection)!;
        const fatigueGain = calculateFatigueGain(legacySet, section as MuscleSection, profile.fatigueSensitivity);

        const stimulusMap = calculateStimulusFromSet(legacySet);
        const stimulusGain = stimulusMap.get(section as MuscleSection) ?? 0;

        newSectionStates.set(section as MuscleSection, {
          fatigue: Math.min(100, currentState.fatigue + fatigueGain),
          weeklyStimulus: currentState.weeklyStimulus + stimulusGain,
          lastTrainedAt: Date.now(),
        });
      }
    }

    // Check for heaviest lift (in lb for display)
    const newStats = { ...stats };
    const weightLb = setData.weightKg * 2.20462;
    if (!newStats.heaviestLift || weightLb > newStats.heaviestLift.weight) {
      newStats.heaviestLift = {
        exercise: exercise.name,
        weight: weightLb,
      };
      newStats.prsUnlocked += 1;
    }

    // Update exercise entry with new set
    const updatedEntries = [...currentSession.exerciseEntries];
    updatedEntries[entryIndex] = {
      ...entry,
      sets: [...entry.sets, newSet],
    };

    set({
      currentSession: {
        ...currentSession,
        exerciseEntries: updatedEntries,
        sets: [...currentSession.sets, legacySet],
      },
      sectionStates: newSectionStates,
      stats: newStats,
    });
    saveState(get());
  },

  updateSet: (exerciseEntryId, setId, update) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const entryIndex = currentSession.exerciseEntries.findIndex(e => e.id === exerciseEntryId);
    if (entryIndex === -1) return;

    const entry = currentSession.exerciseEntries[entryIndex];
    const updatedSets = entry.sets.map(s =>
      s.id === setId ? { ...s, ...update } : s
    );

    const updatedEntries = [...currentSession.exerciseEntries];
    updatedEntries[entryIndex] = { ...entry, sets: updatedSets };

    set({
      currentSession: {
        ...currentSession,
        exerciseEntries: updatedEntries,
      },
    });
    saveState(get());
  },

  deleteSet: (exerciseEntryId, setId) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const entryIndex = currentSession.exerciseEntries.findIndex(e => e.id === exerciseEntryId);
    if (entryIndex === -1) return;

    const entry = currentSession.exerciseEntries[entryIndex];
    const updatedSets = entry.sets.filter(s => s.id !== setId);

    const updatedEntries = [...currentSession.exerciseEntries];
    updatedEntries[entryIndex] = { ...entry, sets: updatedSets };

    set({
      currentSession: {
        ...currentSession,
        exerciseEntries: updatedEntries,
        sets: currentSession.sets.filter(s => s.id !== setId),
      },
    });
    saveState(get());
  },

  removeExerciseEntry: (exerciseEntryId) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const entry = currentSession.exerciseEntries.find(e => e.id === exerciseEntryId);
    if (!entry) return;

    const setIds = new Set(entry.sets.map(s => s.id));

    set({
      currentSession: {
        ...currentSession,
        exerciseEntries: currentSession.exerciseEntries.filter(e => e.id !== exerciseEntryId),
        sets: currentSession.sets.filter(s => !setIds.has(s.id)),
      },
    });
    saveState(get());
  },

  updateSectionState: (section, update) => {
    const { sectionStates } = get();
    const newStates = new Map(sectionStates);
    const current = newStates.get(section);
    if (current) {
      newStates.set(section, { ...current, ...update });
    }
    set({ sectionStates: newStates });
    saveState(get());
  },

  applyRecovery: () => {
    const { sectionStates } = get();
    const newStates = new Map(sectionStates);

    for (const [section, state] of newStates) {
      if (state.lastTrainedAt && state.fatigue > 0) {
        const hoursSince = (Date.now() - state.lastTrainedAt) / (1000 * 60 * 60);
        newStates.set(section, {
          ...state,
          fatigue: calculateRecovery(state.fatigue, hoursSince),
        });
      }
    }

    set({ sectionStates: newStates });
    saveState(get());
  },

  resetWeeklyStimulus: () => {
    const { sectionStates } = get();
    const newStates = new Map(sectionStates);

    for (const [section, state] of newStates) {
      newStates.set(section, { ...state, weeklyStimulus: 0 });
    }

    set({ sectionStates: newStates, lastWeeklyReset: Date.now() });
    saveState(get());
  },

  resetAllData: () => {
    set({
      profile: createInitialProfile(),
      settings: createInitialSettings(),
      sectionStates: createInitialSectionStates(),
      focusMuscles: ['chest', 'biceps'],
      dailySoreness: {},
      dailySorenessUpdatedAt: Date.now(),
      currentSession: null,
      sessions: [],
      stats: createInitialStats(),
      badges: createInitialBadges(),
      lastWeeklyReset: Date.now(),
    });
    localStorage.removeItem('fatiguefit-state');
  },

  hydrate: () => {
    const loaded = loadState();
    if (loaded) {
      // Ensure profile has defaultWorkoutLocation
      const profile = {
        ...loaded.profile,
        defaultWorkoutLocation: loaded.profile.defaultWorkoutLocation ?? { type: 'gym' },
      };

      // Ensure settings exist (migration)
      const settings = loaded.settings ?? {
        units: loaded.profile.weightUnit ?? 'lb',
        calibrationMode: loaded.profile.isCalibrating ?? true,
      };

      // Ensure sessions have status/location/duration
      const sessions = loaded.sessions?.map((s: any) => ({
        ...s,
        exerciseEntries: s.exerciseEntries ?? [],
        status: s.status ?? 'ended',
        durationSeconds: s.durationSeconds ?? (s.endedAt ? Math.round((s.endedAt - s.startedAt) / 1000) : 0),
        startedLocation: s.startedLocation ?? profile.defaultWorkoutLocation,
      })) ?? [];

      // Ensure currentSession has new fields
      const currentSession = loaded.currentSession
        ? {
          ...loaded.currentSession,
          exerciseEntries: loaded.currentSession.exerciseEntries ?? [],
          status: 'in_progress' as const,
          startedLocation: loaded.currentSession.startedLocation ?? profile.defaultWorkoutLocation,
        }
        : null;

      set({
        ...loaded,
        profile,
        settings,
        sessions,
        currentSession,
        dailySoreness: loaded.dailySoreness ?? {},
        dailySorenessUpdatedAt: loaded.dailySorenessUpdatedAt ?? Date.now(),
      });
    }
  },

  getLastSetForExercise: (exerciseId) => {
    const { sessions, currentSession } = get();

    // Check current session first
    if (currentSession) {
      const entry = currentSession.exerciseEntries.find(e => e.exerciseId === exerciseId);
      if (entry && entry.sets.length > 0) {
        return entry.sets[entry.sets.length - 1];
      }
    }

    // Check past sessions (most recent first)
    for (let i = sessions.length - 1; i >= 0; i--) {
      const session = sessions[i];
      const entry = session.exerciseEntries?.find(e => e.exerciseId === exerciseId);
      if (entry && entry.sets.length > 0) {
        return entry.sets[entry.sets.length - 1];
      }
    }

    return null;
  },

  // -- Coach & Auth --

  // -- Coach & Auth --

  recomputeCoachState: () => {
    const { sessions, profile } = get();
    const coach = computeCoachState({ sessions, profile });

    set({ coach });

    // Persist if logged in
    const user = get().user;
    if (user) {
      FirestoreService.saveCoachState(user.uid, coach);
    }
  },

  // Initialize Auth Listener - Call this once on app mount
  initializeAuthListener: () => {
    onAuthStateChanged(auth, async (user) => {
      set({ user });

      if (user) {
        try {
          set({ isSyncing: true });
          // Load data from Firestore
          const [remoteSettings, remoteProfile, remoteSessions, remoteCoach] = await Promise.all([
            FirestoreService.loadUserSettings(user.uid),
            FirestoreService.loadUserProfile(user.uid),
            FirestoreService.loadRecentSessions(user.uid),
            FirestoreService.loadCoachState(user.uid)
          ]);

          // Merge logic (Remote wins if exists, otherwise keep local)
          set((state) => ({
            settings: remoteSettings || state.settings,
            profile: remoteProfile || state.profile,
            sessions: remoteSessions.length > 0 ? remoteSessions : state.sessions,
            coach: remoteCoach || state.coach,
            isSyncing: false
          }));

          // Trigger recompute to ensure fresh state
          get().recomputeCoachState();
        } catch (error) {
          console.error("Data sync failed", error);
          set({ isSyncing: false });
        }
      }
    });
  },

  login: async () => {
    // Deprecated in favor of direct firebase calls + listener
    // But keeping for compatibility if invoked manually
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
    // Keep local data for specific UX preference
  }
}));