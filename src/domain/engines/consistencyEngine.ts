import { ConsistencyState, WorkoutSession } from '../types';

export function computeConsistencyState(
    sessions: WorkoutSession[],
    targetPerWeek: number = 3
): ConsistencyState {
    const now = Date.now();

    // Filter ended sessions and sort by date desc
    const endedSessions = sessions
        .filter(s => s.status === 'ended' && s.endedAt)
        .sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0));

    if (endedSessions.length === 0) {
        return 'RESET';
    }

    const lastSession = endedSessions[0];
    const lastWorkoutEndedAt = lastSession.endedAt!;

    const daysSinceLastWorkout = Math.floor((now - lastWorkoutEndedAt) / (24 * 60 * 60 * 1000));

    // Calculate average interval from last few sessions
    let averageIntervalHours = 48; // Default fallback
    if (endedSessions.length >= 2) {
        // Compute last 5 intervals
        const recent = endedSessions.slice(0, 6);
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

    // Adaptive Logic or simple rules
    // For v1 we use simple rules based on average

    const avgDays = Math.max(1, Math.ceil(averageIntervalHours / 24));

    // Allow a bit more flexibility if target frequency is low
    // If target is 3x/week, expected is ~2.3 days.
    // If they wait 3 days, they are technically "on track" roughly.

    if (daysSinceLastWorkout <= avgDays + 1) {
        return 'ON_TRACK';
    } else if (daysSinceLastWorkout <= avgDays + 2) {
        return 'MISSED'; // Just missed the window
    } else if (daysSinceLastWorkout <= avgDays + 5) {
        return 'DRIFTING';
    } else {
        return 'RESET';
    }
}
