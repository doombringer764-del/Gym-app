 // FatigueFit Configuration
 // All tuning constants in one place for easy adjustment
 
 export const CONFIG = {
   // Fatigue settings
   fatigue: {
     baseGainPerSet: 6, // base fatigue added per set
     recoveryPerHour: 1.5, // fatigue recovered per hour
     maxFatigue: 100,
     minFatigue: 0,
   },
   
   // RPE/RIR to effort factor mapping
   effortFactors: {
     rpe10: 1.5,  // RIR 0 - failure
     rpe9: 1.3,   // RIR 1
     rpe8: 1.1,   // RIR 2
     rpe7: 1.0,   // RIR 3
     rpe6: 0.85,  // RIR 4
     rpe5: 0.7,   // RIR 5+
   },
   
   // Weekly stimulus targets per section
   stimulus: {
     minSetsPerWeek: 6,  // undertrained threshold
     optimalSetsMin: 10, // optimal range start
     optimalSetsMax: 20, // optimal range end
     maxSetsPerWeek: 25, // overtrained threshold
     weekResetDay: 1, // Monday (0 = Sunday)
   },
   
   // Readiness thresholds
   readiness: {
     recoveringFatigueThreshold: 70,
     cautionFatigueThreshold: 50,
     readyFatigueThreshold: 30,
     primedMaxFatigue: 20,
     primedMaxStimulus: 4, // low weekly stimulus
     primedMinHoursSinceTrained: 48, // 2 days
   },
   
   // Time-of-day adjustments
   timeOfDay: {
     morningMultiplier: 0.95,
     afternoonMultiplier: 1.0,
     eveningMultiplier: 0.98,
     // If trained at unusual time, reduce readiness
     unusualTimeReduction: 0.9,
   },
   
   // Body readiness calculation weights
   bodyReadiness: {
     avgFatigueWeight: 0.6,
     sleepFactorWeight: 0.2, // placeholder for future
     timeFactorWeight: 0.2,
   },
   
   // UI settings
   ui: {
     maxFocusMuscles: 3,
     minFocusMuscles: 1,
     progressSegments: 10,
   },
   
   // Calibration settings
   calibration: {
     sessionsToComplete: 5,
     defaultSensitivity: 1.0,
   },
   
   // Radar chart axes
   radarAxes: ['Strength', 'Consistency', 'Recovery IQ', 'Balance', 'Hypertrophy'] as const,
 } as const;
 
 export type RadarAxis = typeof CONFIG.radarAxes[number];