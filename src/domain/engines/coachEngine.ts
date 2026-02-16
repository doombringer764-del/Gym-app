import {
    WorkoutSession,
    UserCoachState,
    CoachBanner,
    ConsistencyState,
    RecoveryState,
    UserProfile
} from '../types';

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
    // Calculate average interval
    let averageIntervalHours = 48; // Default fallback
    if (endedSessions.length >= 2) {
        // Compute last 5 intervals
        const recent = endedSessions.slice(0, 6); // need 6 to get 5 intervals
        let totalDiff = 0;
        let count = 0;

        for (let i = 0; i < recent.length - 1; i++) {
            const current = recent[i].endedAt!;
            const prev = recent[i + 1].endedAt!;
            totalDiff += (current - prev);
            count++;
        }

        if (count > 0) {
            averageIntervalHours = (totalDiff / count) / (1000 * 60 * 60);
        }
    }

    const daysSinceLastWorkout = lastWorkoutEndedAt
        ? Math.floor((now - lastWorkoutEndedAt) / (24 * 60 * 60 * 1000))
        : 0;

    const targetFreq = profile.daysPerWeek || 3;
    // Estimated max gap allowed based on frequency (e.g. 3 days/week -> ~2.3 days gap avg)
    // For v1 we stick to the simple rules from requirements
    // ON_TRACK: daysSince <= ceil(avg/24)
    // MISSED: daysSince == ceil + 1
    // DRIFTING: daysSince +2 ... +3
    // RESET: >= +4

    const avgDays = Math.ceil(averageIntervalHours / 24);

    let consistencyState: ConsistencyState = 'ON_TRACK';
    if (!lastWorkoutEndedAt) {
        consistencyState = 'RESET'; // New user effectively
    } else if (daysSinceLastWorkout <= avgDays) {
        consistencyState = 'ON_TRACK';
    } else if (daysSinceLastWorkout === avgDays + 1) {
        consistencyState = 'MISSED';
    } else if (daysSinceLastWorkout <= avgDays + 3) {
        consistencyState = 'DRIFTING';
    } else {
        consistencyState = 'RESET';
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
