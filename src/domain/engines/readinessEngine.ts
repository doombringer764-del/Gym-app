
import { CONFIG } from '../config';
import type { MuscleSection, ReadinessState, SectionState, TimePreference } from '../types';

/**
 * Determine readiness state for a single section
 */
export function getSectionReadiness(state: SectionState, sorenessLevel: number = 0): ReadinessState {
  const { readiness } = CONFIG;
  const hoursSinceTrained = state.lastTrainedAt
    ? (Date.now() - state.lastTrainedAt) / (1000 * 60 * 60)
    : Infinity;

  // Apply soreness penalty to fatigue for calculation
  // Scale: 0=0, 1=5, 2=15, 3=30, 4=50
  const sorenessPenalty = [0, 5, 15, 30, 50][sorenessLevel] || 0;
  const effectiveFatigue = state.fatigue + sorenessPenalty;

  // PRIMED: Low fatigue + low stimulus + enough time passed
  // Soreness must be low (<= 1) to be primed
  if (
    effectiveFatigue <= readiness.primedMaxFatigue &&
    state.weeklyStimulus <= readiness.primedMaxStimulus &&
    hoursSinceTrained >= readiness.primedMinHoursSinceTrained &&
    sorenessLevel <= 1
  ) {
    return 'PRIMED';
  }

  // RECOVERING: High fatigue
  if (effectiveFatigue >= readiness.recoveringFatigueThreshold) {
    return 'RECOVERING';
  }

  // CAUTION: Moderate fatigue
  if (effectiveFatigue >= readiness.cautionFatigueThreshold) {
    return 'CAUTION';
  }

  // READY: Low-moderate fatigue
  return 'READY';
}

/**
 * Get color class for readiness state
 */
export function getReadinessColor(state: ReadinessState): string {
  switch (state) {
    case 'RECOVERING': return 'bg-recovering text-white';
    case 'CAUTION': return 'bg-caution text-white';
    case 'READY': return 'bg-ready text-white';
    case 'PRIMED': return 'bg-primed text-white';
  }
}

/**
 * Get dot color for readiness chip
 */
export function getReadinessDotColor(state: ReadinessState): string {
  switch (state) {
    case 'RECOVERING': return 'bg-recovering';
    case 'CAUTION': return 'bg-caution';
    case 'READY': return 'bg-ready';
    case 'PRIMED': return 'bg-primed';
  }
}

/**
 * Calculate overall body readiness percentage
 */
export function calculateBodyReadiness(
  sectionStates: Map<MuscleSection, SectionState>,
  timePreference: TimePreference,
  lastSessionEndTime: number | null
): number {
  const { bodyReadiness, timeOfDay } = CONFIG;

  // Calculate average fatigue across all sections
  const states = Array.from(sectionStates.values());
  if (states.length === 0) return 100;

  const avgFatigue = states.reduce((sum, s) => sum + s.fatigue, 0) / states.length;
  const fatigueScore = Math.max(0, 100 - avgFatigue);

  // Time-of-day multiplier
  const currentHour = new Date().getHours();
  let timeMultiplier: number = timeOfDay.afternoonMultiplier;

  if (currentHour >= 5 && currentHour < 12) {
    timeMultiplier = timeOfDay.morningMultiplier;
  } else if (currentHour >= 18 || currentHour < 5) {
    timeMultiplier = timeOfDay.eveningMultiplier;
  }

  // Check for unusual training time (e.g., trained late, now training early)
  if (lastSessionEndTime) {
    const hoursSinceSession = (Date.now() - lastSessionEndTime) / (1000 * 60 * 60);
    if (hoursSinceSession < 12) {
      timeMultiplier *= timeOfDay.unusualTimeReduction;
    }
  }

  // Weighted calculation
  const readiness = (
    fatigueScore * bodyReadiness.avgFatigueWeight +
    100 * bodyReadiness.sleepFactorWeight + // Placeholder: assume good sleep
    100 * timeMultiplier * bodyReadiness.timeFactorWeight
  );

  return Math.round(Math.min(100, Math.max(0, readiness)));
}

/**
 * Sort sections by readiness priority (PRIMED first, then READY, CAUTION, RECOVERING)
 */
export function sortByReadiness(
  sections: MuscleSection[],
  states: Map<MuscleSection, SectionState>
): MuscleSection[] {
  const priority: Record<ReadinessState, number> = {
    PRIMED: 0,
    READY: 1,
    CAUTION: 2,
    RECOVERING: 3,
  };

  return [...sections].sort((a, b) => {
    const stateA = states.get(a);
    const stateB = states.get(b);
    const readinessA = stateA ? getSectionReadiness(stateA) : 'READY';
    const readinessB = stateB ? getSectionReadiness(stateB) : 'READY';
    return priority[readinessA] - priority[readinessB];
  });
}