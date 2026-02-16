import { CONFIG } from '../config';
import type { LoggedSet, MuscleSection, SectionState } from '../types';
import { getExerciseById } from '../catalog/exercises';

/**
 * Calculate effort factor from RPE (Rate of Perceived Exertion)
 */
export function getEffortFactor(rpe: number): number {
  const { effortFactors } = CONFIG;
  if (rpe >= 10) return effortFactors.rpe10;
  if (rpe >= 9) return effortFactors.rpe9;
  if (rpe >= 8) return effortFactors.rpe8;
  if (rpe >= 7) return effortFactors.rpe7;
  if (rpe >= 6) return effortFactors.rpe6;
  return effortFactors.rpe5;
}

/**
 * Calculate fatigue gained from a single set
 */
export function calculateFatigueGain(
  set: LoggedSet,
  section: MuscleSection,
  userSensitivity: number = 1.0
): number {
  const exercise = getExerciseById(set.exerciseId);
  if (!exercise) return 0;

  const contributionWeight = exercise.contributions[section] ?? 0;
  if (contributionWeight === 0) return 0;

  const effortFactor = getEffortFactor(set.rpe);
  const { baseGainPerSet } = CONFIG.fatigue;

  return baseGainPerSet * contributionWeight * userSensitivity * effortFactor;
}

/**
 * Calculate recovery (fatigue reduction) over time
 */
export function calculateRecovery(
  currentFatigue: number,
  hoursSinceLastActivity: number
): number {
  const { recoveryPerHour, minFatigue } = CONFIG.fatigue;
  const recovered = hoursSinceLastActivity * recoveryPerHour;
  return Math.max(minFatigue, currentFatigue - recovered);
}

/**
 * Apply a set to a section state, returning updated fatigue
 */
export function applySetFatigue(
  sectionState: SectionState,
  set: LoggedSet,
  section: MuscleSection,
  userSensitivity: number = 1.0
): number {
  const gain = calculateFatigueGain(set, section, userSensitivity);
  const { maxFatigue } = CONFIG.fatigue;
  return Math.min(maxFatigue, sectionState.fatigue + gain);
}

/**
 * Get all sections affected by a set and their fatigue contributions
 */
export function getSetFatigueContributions(
  set: LoggedSet,
  userSensitivity: number = 1.0
): Map<MuscleSection, number> {
  const exercise = getExerciseById(set.exerciseId);
  if (!exercise) return new Map();

  const contributions = new Map<MuscleSection, number>();

  for (const [section, weight] of Object.entries(exercise.contributions)) {
    if (weight && weight > 0) {
      const fatigue = calculateFatigueGain(set, section as MuscleSection, userSensitivity);
      contributions.set(section as MuscleSection, Math.round(fatigue * 10) / 10);
    }
  }

  return contributions;
}

/**
 * Reconstruct current fatigue for a section by replaying session history
 */
export function calculateFatigueFromHistory(
  section: MuscleSection,
  sessions: import('../types').WorkoutSession[],
  userSensitivity: number = 1.0
): number {
  if (!sessions || sessions.length === 0) return 0;

  // Sort sessions by date ascending
  const sortedSessions = [...sessions].sort((a, b) => a.startedAt - b.startedAt);

  let currentFatigue = 0;
  let lastTimeIdx = sortedSessions[0].startedAt;

  for (const session of sortedSessions) {
    if (session.status !== 'ended') continue;

    // 1. Recover during time BEFORE this session
    const hoursSinceLast = (session.startedAt - lastTimeIdx) / (1000 * 60 * 60);
    if (hoursSinceLast > 0) {
      currentFatigue = calculateRecovery(currentFatigue, hoursSinceLast);
    }

    // 2. Add fatigue from this session
    for (const entry of session.exerciseEntries) {
      const exercise = getExerciseById(entry.exerciseId);
      if (!exercise || !exercise.contributions[section]) continue;

      for (const set of entry.sets) {
        // Construct legacy set for calculation
        const legacySet: LoggedSet = {
          id: set.id,
          exerciseId: entry.exerciseId,
          weight: set.weightKg * 2.20462,
          reps: set.reps,
          rpe: set.rpe,
          timestamp: set.createdAt
        };
        const gain = calculateFatigueGain(legacySet, section, userSensitivity);
        const { maxFatigue } = CONFIG.fatigue;
        currentFatigue = Math.min(maxFatigue, currentFatigue + gain);
      }
    }

    lastTimeIdx = session.endedAt || session.startedAt;
  }

  // 3. Recover time since last session until NOW
  const hoursSinceEnd = (Date.now() - lastTimeIdx) / (1000 * 60 * 60);
  if (hoursSinceEnd > 0) {
    currentFatigue = calculateRecovery(currentFatigue, hoursSinceEnd);
  }

  return currentFatigue;
}