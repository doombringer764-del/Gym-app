import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import {
    UserProfile,
    UserSettings,
    WorkoutSession,
    UserCoachState
} from '@/domain/types';

// -- User Settings --
export async function saveUserSettings(userId: string, settings: UserSettings) {
    await setDoc(doc(db, 'users', userId, 'settings', 'main'), settings, { merge: true });
}

export async function loadUserSettings(userId: string): Promise<UserSettings | null> {
    const snap = await getDoc(doc(db, 'users', userId, 'settings', 'main'));
    return snap.exists() ? (snap.data() as UserSettings) : null;
}

// -- User Profile --
export async function saveUserProfile(userId: string, profile: UserProfile) {
    await setDoc(doc(db, 'users', userId), { profile }, { merge: true });
}

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? (snap.data().profile as UserProfile) : null;
}

// -- Workout Sessions --
export async function saveWorkoutSession(userId: string, session: WorkoutSession) {
    await setDoc(doc(db, 'users', userId, 'sessions', session.id), session);
}

export async function loadRecentSessions(userId: string, limitCount = 50): Promise<WorkoutSession[]> {
    const q = query(
        collection(db, 'users', userId, 'sessions'),
        orderBy('startedAt', 'desc'),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as WorkoutSession);
}

// -- Coach State --
export async function saveCoachState(userId: string, state: UserCoachState) {
    await setDoc(doc(db, 'users', userId, 'coach', 'state'), state);
}

export async function loadCoachState(userId: string): Promise<UserCoachState | null> {
    const snap = await getDoc(doc(db, 'users', userId, 'coach', 'state'));
    return snap.exists() ? (snap.data() as UserCoachState) : null;
}
