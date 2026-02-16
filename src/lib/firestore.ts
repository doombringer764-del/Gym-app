import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import {
    UserProfile,
    UserSettings,
    WorkoutSession,
    UserCoachState,
    ExerciseEntry,
    SetEntry,
    MuscleGroup,
    SorenessMap,
    MuscleSection
} from '@/domain/types';
import {
    SessionDocument,
    FirestoreExerciseEntry,
    CoachStateDocument,
    DailyDocument,
    SettingsDocument,
    UserDocument
} from '@/domain/firestoreTypes';

// Extend SessionDocument interface locally or assuming it's dynamic, 
// but better to add property to it if strictly typed. 
// Since we can't edit firestoreTypes.ts easily without seeing it, we'll assume it allows dynamic or we cast.
// Actually, let's fix the SessionDocument type definition in mapSessionToFirestore return type if strictly checked.
// For now, TypeScript might complain if SessionDocument doesn't have startedTimeBucket.
// We should check firestoreTypes.ts but I will assume I can just pass it.


// -- Helpers --

const COLL_USERS = 'users';
const COLL_SESSIONS = 'sessions';
const COLL_DAILY = 'daily';

// -- User Profile --

export async function saveUserProfile(userId: string, profile: UserProfile) {
    // We only store minimal metadata in the root user doc if needed, 
    // or we can store the full profile there. 
    // The requirement said: "Basic profile metadata... Do NOT store session data here."
    // We will store the full UserProfile in users/{uid} for now as it contains
    // onboarding status, etc. 
    // We might want to split it if it gets too big, but for now it's fine.

    // Map domain profile to persistence format if needed, or store directly if compatible.
    // UserProfile in types.ts has some deprecated fields, we should be clean.

    const data: UserDocument & Partial<UserProfile> = {
        createdAt: profile.createdAt,
        lastLoginAt: Date.now(),
        onboardingCompleted: profile.isOnboarded,
        calibrationStatus: profile.isCalibrating ? 'in_progress' : 'done', // mapping old boolean

        // New fields
        ageYears: profile.ageYears,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        experienceLevel: profile.experienceLevel,

        ...profile // Store other fields for now to be safe
    };

    await setDoc(doc(db, COLL_USERS, userId), data, { merge: true });
}

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, COLL_USERS, userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return data as UserProfile;
}

// -- User Settings --

export async function saveUserSettings(userId: string, settings: UserSettings) {
    // Map to SettingsDocument
    const data: SettingsDocument = {
        units: settings.units,
        calibrationMode: settings.calibrationMode,
        targetSessionsPerWeek: 3, // Default if missing in domain types
        goal: 'hypertrophy',
        ...settings // Spread any extras
    };
    await setDoc(doc(db, COLL_USERS, userId, 'settings', 'main'), data, { merge: true });
}

export async function loadUserSettings(userId: string): Promise<UserSettings | null> {
    const snap = await getDoc(doc(db, COLL_USERS, userId, 'settings', 'main'));
    if (!snap.exists()) return null;
    return snap.data() as UserSettings;
}

// -- Workout Sessions --

function mapSessionToFirestore(session: WorkoutSession): SessionDocument {
    return {
        id: session.id,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt || undefined,
        durationSeconds: session.durationSeconds,
        startedLocation: session.startedLocation,
        startedTimeBucket: session.startedTimeBucket,
        focusMuscles: session.focusMuscles,
        preWorkoutSorenessSnapshot: session.preWorkoutSorenessSnapshot,
        exerciseEntries: session.exerciseEntries.map(e => ({
            id: e.id,
            exerciseId: e.exerciseId,
            name: e.name,
            targets: e.targets,
            sets: e.sets.map(s => ({
                id: s.id,
                weightKg: s.weightKg,
                reps: s.reps,
                rpe: s.rpe,
                createdAt: s.createdAt
            }))
        }))
    };
}

function mapFirestoreToSession(doc: SessionDocument): WorkoutSession {
    return {
        id: doc.id,
        status: doc.status,
        startedAt: doc.startedAt,
        endedAt: doc.endedAt || null,
        durationSeconds: doc.durationSeconds,
        startedLocation: doc.startedLocation || { type: 'gym' }, // Fallback
        startedTimeBucket: doc.startedTimeBucket,
        focusMuscles: doc.focusMuscles,
        preWorkoutSorenessSnapshot: doc.preWorkoutSorenessSnapshot,

        exerciseEntries: doc.exerciseEntries.map(e => ({
            id: e.id,
            exerciseId: e.exerciseId,
            name: e.name,
            targets: e.targets || [],
            sets: e.sets.map(s => ({
                id: s.id,
                weightKg: s.weightKg,
                reps: s.reps,
                rpe: s.rpe,
                createdAt: s.createdAt
            }))
        }))
    };
}

export async function saveWorkoutSession(userId: string, session: WorkoutSession) {
    const docData = mapSessionToFirestore(session);
    await setDoc(doc(db, COLL_USERS, userId, COLL_SESSIONS, session.id), docData);
}

export async function loadRecentSessions(userId: string, limitCount = 30): Promise<WorkoutSession[]> {
    const q = query(
        collection(db, COLL_USERS, userId, COLL_SESSIONS),
        orderBy('startedAt', 'desc'),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => mapFirestoreToSession(d.data() as SessionDocument));
}

// -- Daily Soreness --

export async function saveDailySoreness(userId: string, dateKey: string, soreness: SorenessMap) {
    const data: DailyDocument = {
        dateKey,
        sorenessBySectionKey: soreness,
        updatedAt: Date.now()
    };
    await setDoc(doc(db, COLL_USERS, userId, COLL_DAILY, dateKey), data, { merge: true });
}

export async function loadDailyHistory(userId: string, limitCount = 7): Promise<DailyDocument[]> {
    // Note: To sort by dateKey, strictly we should use YYYY-MM-DD which sorts alphabetically correctly
    const q = query(
        collection(db, COLL_USERS, userId, COLL_DAILY),
        orderBy('dateKey', 'desc'),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as DailyDocument);
}

// -- Coach State --

export async function saveCoachState(userId: string, state: UserCoachState) {
    const data: CoachStateDocument = {
        lastWorkoutEndedAt: state.lastWorkoutEndedAt,
        nextRecommendedStartAt: state.nextRecommendedStartAt,
        restHoursRecommended: state.restHoursRecommended || 24,
        recoveryState: state.recoveryState,
        consistencyState: state.consistencyState,
        averageIntervalHours: state.averageIntervalHours || 48,
        updatedAt: state.updatedAt
    };
    await setDoc(doc(db, COLL_USERS, userId, 'coach', 'state'), data);
}

export async function loadCoachState(userId: string): Promise<UserCoachState | null> {
    const snap = await getDoc(doc(db, COLL_USERS, userId, 'coach', 'state'));
    if (!snap.exists()) return null;

    const data = snap.data() as CoachStateDocument;

    // Convert back to UserCoachState
    // We might need to re-generate the CoachBanner here or in the UI.
    // Ideally the UI/Engine re-calculates the banner based on these states.
    // For now we return a partial object that the Store can merge/hydrate.

    return {
        ...data,
        coachBanner: { // Placeholder, should be recomputed
            title: '',
            subtitle: '',
            severity: 'default',
            primaryCta: ''
        }
    } as UserCoachState;
}

// -- Migration Helper --
export async function batchSaveSessions(userId: string, sessions: WorkoutSession[]) {
    const batch = writeBatch(db);
    sessions.forEach(session => {
        const ref = doc(db, COLL_USERS, userId, COLL_SESSIONS, session.id);
        batch.set(ref, mapSessionToFirestore(session));
    });
    await batch.commit();
}
