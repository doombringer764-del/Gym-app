import {
    WorkoutSession,
    UserCoachState,
    CoachBanner,
    ConsistencyState,
    RecoveryState,
    UserProfile
} from '../types';
import { computeConsistencyState } from './consistencyEngine';

interface CoachContext {
    sessions: WorkoutSession[];
    profile: UserProfile;
    now?: number;
}

export const RECOMMENDED_REST_HOURS = 24;

export function computeCoachState(context: CoachContext): UserCoachState {
    const now = context.now || Date.now();
    const { sessions, profile } = context;

    // 1. Get last session details
    const endedSessions = sessions
        .filter(s => s.status === 'ended' && s.endedAt)
        .sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0));

    const lastSession = endedSessions[0];
    const lastWorkoutEndedAt = lastSession?.endedAt || undefined;
    const lastEndedSessionId = lastSession?.id;

    // 2. Compute Recovery State
    let recoveryState: RecoveryState = 'READY';
    let nextRecommendedStartAt: number | undefined;
    let restHoursRecommended = RECOMMENDED_REST_HOURS; // Default fixed for v1

    if (lastWorkoutEndedAt) {
        nextRecommendedStartAt = lastWorkoutEndedAt + (restHoursRecommended * 60 * 60 * 1000);

        if (now < nextRecommendedStartAt) {
            recoveryState = 'REST';
        } else {
            recoveryState = 'READY';
        }
    }

    // 3. Compute Consistency State
    const consistencyState = computeConsistencyState(sessions, profile.daysPerWeek);

    // Helper vars for stats
    const daysSinceLastWorkout = lastWorkoutEndedAt
        ? Math.floor((now - lastWorkoutEndedAt) / (24 * 60 * 60 * 1000))
        : 0;

    // Re-calculate average for stats (duplicated logic for now, could export from consistency)
    let averageIntervalHours = 48;
    if (endedSessions.length >= 2) {
        const recent = endedSessions.slice(0, 6);
        let totalDiff = 0;
        let count = 0;
        for (let i = 0; i < recent.length - 1; i++) {
            totalDiff += (recent[i].endedAt! - recent[i + 1].endedAt!);
            count++;
        }
        if (count > 0) averageIntervalHours = (totalDiff / count) / (3600000);
    }

    // 4. Generate Coach Banner
    const coachBanner = generateCoachBanner(recoveryState, consistencyState, nextRecommendedStartAt, now);

    return {
        lastEndedSessionId,
        lastWorkoutEndedAt,
        nextRecommendedStartAt,
        restHoursRecommended,
        averageIntervalHours,
        daysSinceLastWorkout,
        consistencyState,
        recoveryState,
        coachBanner,
        updatedAt: now,
    };
}

function generateCoachBanner(
    recovery: RecoveryState,
    consistency: ConsistencyState,
    nextStart?: number,
    now: number = Date.now()
): CoachBanner {

    // Rule 1: Recovery takes precedence
    if (recovery === 'REST' && nextStart && nextStart > now) {
        return {
            title: 'Recovery Window',
            subtitle: 'Next recommended session in', // UI will append timer
            severity: 'warning',
            primaryCta: 'Recover (recommended)',
            secondaryCta: 'Start anyway'
        };
    }

    // Rule 2: Ready & Consistency
    if (consistency === 'ON_TRACK') {
        return {
            title: 'You’re Ready',
            subtitle: 'Keep your rhythm going',
            severity: 'success',
            primaryCta: 'Start Session',
            secondaryCta: 'View Plan'
        };
    }

    if (consistency === 'MISSED') {
        return {
            title: 'Back on Track Today',
            subtitle: 'Missed yesterday? No stress — a short session keeps momentum',
            severity: 'default',
            primaryCta: 'Start Session',
            secondaryCta: 'View Focus'
        };
    }

    if (consistency === 'DRIFTING') {
        return {
            title: 'Let’s Rebuild Your Rhythm',
            subtitle: 'Start light today — just show up',
            severity: 'warning',
            primaryCta: 'Start Light Session',
            secondaryCta: 'View Focus'
        };
    }

    // RESET or unknown
    return {
        title: 'Reset Day',
        subtitle: 'We’ll start small and build again',
        severity: 'default',
        primaryCta: 'Start Fresh',
        secondaryCta: 'View Focus'
    };
}
