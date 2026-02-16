import { create } from 'zustand';
import { calculateFatigueGain, calculateRecovery, calculateFatigueFromHistory } from '@/domain/engines/fatigueEngine';
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
import { auth, googleProvider, onAuthStateChanged, signInWithPopup, signInAnonymously, signOut } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
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
  startSession: (focusMuscles: MuscleGroup[], location?: WorkoutLocation, timeBucket?: import('@/domain/types').TimePreference) => void;
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
  recomputeReadiness: () => void;
  recomputeCoachState: () => void;
  initializeAuthListener: () => void;
  login: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
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

    const user = get().user;
    if (user) {
      FirestoreService.saveUserProfile(user.uid, get().profile);
    }
  },

  setSettings: (update) => {
    set((state) => ({
      settings: { ...state.settings, ...update },
    }));
    saveState(get());

    const user = get().user;
    if (user) {
      FirestoreService.saveUserSettings(user.uid, get().settings);
    }
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

    const user = get().user;
    if (user) {
      // We assume one update per day key
      const dateKey = new Date().toISOString().split('T')[0];
      FirestoreService.saveDailySoreness(user.uid, dateKey, get().dailySoreness);
      // Recompute coach when soreness changes
      get().recomputeCoachState();
    }
  },

  startSession: (focusMuscles, location, timeBucket) => {
    const { profile } = get();
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      startedAt: Date.now(),
      endedAt: undefined, // undefined for Firestore compatibility (optional)
      startedLocation: location || profile.defaultWorkoutLocation || { type: 'gym' },
      startedTimeBucket: timeBucket,
      status: 'in_progress',
      focusMuscles,
      preWorkoutSorenessSnapshot: get().dailySoreness,
      exerciseEntries: [],

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
    const updatedSessions = [...sessions, completedSession];
    set({
      currentSession: null,
      sessions: updatedSessions,
      stats: newStats,
      badges: updatedBadges,
    });

    // 2. Recompute Coach & Update Local State
    const { profile } = get();
    const coach = computeCoachState({ sessions: updatedSessions, profile });
    set({ coach });

    // 3. Persist to Firestore if logged in
    const user = get().user;
    if (user) {
      FirestoreService.saveWorkoutSession(user.uid, completedSession);
      FirestoreService.saveCoachState(user.uid, coach);
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
      },
    });
    saveState(get());
  },

  removeExerciseEntry: (exerciseEntryId) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const updatedEntries = currentSession.exerciseEntries.filter(e => e.id !== exerciseEntryId);

    set({
      currentSession: {
        ...currentSession,
        exerciseEntries: updatedEntries,
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
      coach: null, // Reset coach state
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
        // Hydrate coach state if available locally, otherwise null
        coach: loaded.coach ?? null
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

  recomputeReadiness: () => {
    const { sessions, profile, sectionStates } = get();
    const newStates = new Map(sectionStates);

    for (const section of SECTIONS) {
      const sectionId = section.id;
      const current = newStates.get(sectionId);

      // Calculate fatigue from history
      const fatigue = calculateFatigueFromHistory(sectionId, sessions, profile.fatigueSensitivity);

      // Determine last trained at
      // We can find the last session that hit this muscle
      let lastTrainedAt = current?.lastTrainedAt || null;

      // Search backwards for latest session hitting this muscle
      // This is a bit expensive but done once on load
      for (let i = sessions.length - 1; i >= 0; i--) {
        const s = sessions[i];
        if (s.status === 'ended' && s.endedAt) {
          const hitsMuscle = s.exerciseEntries.some(e => {
            const ex = getExerciseById(e.exerciseId);
            return ex && ex.contributions[sectionId];
          });
          if (hitsMuscle) {
            lastTrainedAt = s.endedAt;
            break;
          }
        }
      }

      newStates.set(sectionId, {
        ...current!,
        fatigue,
        lastTrainedAt
      });
    }

    set({ sectionStates: newStates });
    saveState(get());
  },

  recomputeCoachState: () => {
    const { sessions, profile } = get();
    const coach = computeCoachState({ sessions, profile });
    set({ coach });

    const user = get().user;
    if (user) {
      FirestoreService.saveCoachState(user.uid, coach);
    }
  },

  initializeAuthListener: () => {
    onAuthStateChanged(auth, async (user) => {
      set({ user });

      if (user) {
        // LOGIN
        try {
          set({ isSyncing: true });

          // 1. Load Remote Data
          const [remoteSettings, remoteProfile, remoteSessions, remoteCoach, remoteDaily] = await Promise.all([
            FirestoreService.loadUserSettings(user.uid),
            FirestoreService.loadUserProfile(user.uid),
            FirestoreService.loadRecentSessions(user.uid),
            FirestoreService.loadCoachState(user.uid),
            FirestoreService.loadDailyHistory(user.uid)
          ]);

          const localSessions = get().sessions;

          // 2. Migration: If remote is empty but local has data, push local data
          // We check if we have remote sessions. If not, and we have local sessions, migrate them.
          if (remoteSessions.length === 0 && localSessions.length > 0) {
            console.log("Migrating local sessions to Firestore...");
            await FirestoreService.batchSaveSessions(user.uid, localSessions);
            await FirestoreService.saveUserProfile(user.uid, get().profile);
            await FirestoreService.saveUserSettings(user.uid, get().settings);
            // We can assume coach state will be recomputed/saved on next action or now
          }

          // 3. Merge Sessions (Remote wins, but we dedup by ID)
          let mergedSessions = remoteSessions;
          if (remoteSessions.length === 0 && localSessions.length > 0) {
            // We just migrated, so local is the source of truth effectively, 
            // although we just pushed them. For safety, just use them.
            mergedSessions = localSessions;
          } else if (remoteSessions.length > 0 && localSessions.length > 0) {
            // Merge lists, prefer remote, uniq by ID
            const remoteIds = new Set(remoteSessions.map(s => s.id));
            // Find sessions that are LOCAL ONLY (created offline perhaps?)
            const localOnly = localSessions.filter(s => !remoteIds.has(s.id));

            if (localOnly.length > 0) {
              // Push them to remote
              await FirestoreService.batchSaveSessions(user.uid, localOnly);
              // Add them to our merged list
              mergedSessions = [...remoteSessions, ...localOnly].sort((a, b) => b.startedAt - a.startedAt);
            } else {
              // Nothing new locally, just trust remote
              mergedSessions = remoteSessions;
            }
          } else if (remoteSessions.length > 0) {
            mergedSessions = remoteSessions;
          }

          // 4. Update Store
          set((state) => ({
            settings: remoteSettings || state.settings,
            profile: remoteProfile || state.profile,
            sessions: mergedSessions,
            coach: remoteCoach || state.coach, // Remote coach state might be stale, we recompute below
            isSyncing: false
          }));

          // 5. Recompute Coach & Save properly
          // This ensures if we migrated local sessions, the coach state in firestore is updated too
          get().recomputeCoachState();

          // 6. Recompute Readiness from history
          get().recomputeReadiness();

        } catch (error) {
          console.error("Data sync failed", error);
          set({ isSyncing: false });
        }
      } else {
        // LOGOUT
        // Clear local sensitive state, keep basic app structure
        set({
          sessions: [], // clear history
          coach: null,
          user: null,
          // We might want to keep profile/settings default or reset them
        });
        // We do NOT reset all data effectively clearing usage history but keeping the app open
        // Local storage should probably be cleared of sensitive data
        localStorage.removeItem('fatiguefit-state');
        set({
          profile: createInitialProfile(),
          settings: createInitialSettings(),
          stats: createInitialStats(),
        });
      }
    });
  },

  login: async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  },

  loginAsGuest: async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Guest login failed", error);
    }
  },

  logout: async () => {
    await signOut(auth);
    // State clearing handled by listener
  }
}));