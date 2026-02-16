import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { FocusCard, FocusCardHeader, FocusCardMetric } from '@/ui/FocusCard';
import { MuscleChip } from '@/ui/MuscleChip';
import { ReadinessChip } from '@/ui/ReadinessChip';
import { SegmentedProgress } from '@/ui/SegmentedProgress';
import { Button } from '@/components/ui/button';
import { Edit2, Zap, Info } from 'lucide-react';
import { MUSCLES } from '@/domain/taxonomy/muscles';
import { CoachBanner } from '../coach/CoachBanner';
import { StartWorkoutGate } from '../coach/StartWorkoutGate';
import { getSectionReadiness, calculateBodyReadiness } from '@/domain/engines/readinessEngine';
import { getSuggestedFocus } from '@/domain/engines/planEngine';
import type { MuscleGroup, ReadinessState } from '@/domain/types';
import { EditFocusSheet } from './EditFocusSheet';
import { SorenessCheckin } from '@/features/workout/SorenessCheckin';
import { LastWorkoutCard } from '@/features/workout/LastWorkoutCard';
import { useState } from 'react';

export function TodayPage() {
  const navigate = useNavigate();
  const { profile, sectionStates, focusMuscles, applyRecovery, currentSession, sessions, coach } = useStore();
  const [showEditFocus, setShowEditFocus] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  // Apply recovery on mount
  useEffect(() => {
    applyRecovery();
  }, [applyRecovery]);

  // Calculate body readiness
  const lastSession = sessions[sessions.length - 1];
  const bodyReadiness = useMemo(
    () => calculateBodyReadiness(sectionStates, profile.timePreference, lastSession?.endedAt ?? null),
    [sectionStates, profile.timePreference, lastSession]
  );

  // Get readiness for each focus muscle
  const getMuscleReadiness = (muscle: MuscleGroup): ReadinessState => {
    const muscleData = MUSCLES.find(m => m.id === muscle);
    if (!muscleData) return 'READY';

    // Use the worst readiness among sections
    const states: ReadinessState[] = muscleData.sections.map(s => {
      const state = sectionStates.get(s.id);
      return state ? getSectionReadiness(state) : 'READY';
    });

    if (states.includes('RECOVERING')) return 'RECOVERING';
    if (states.includes('CAUTION')) return 'CAUTION';
    if (states.includes('PRIMED')) return 'PRIMED';
    return 'READY';
  };

  // Get suggested focus muscles
  const suggestedFocus = useMemo(() => getSuggestedFocus(sectionStates), [sectionStates]);

  // DERIVE HEADLINE CONTEXT
  const context = useMemo(() => {
    if (focusMuscles.length === 0) {
      if (bodyReadiness > 80) return { title: "You're suitable to push", subtitle: "Recovery looks strong — push intensity today." };
      if (bodyReadiness > 50) return { title: "Check your soreness", subtitle: "Moderate fatigue detected." };
      return { title: "Focus on recovery", subtitle: "High systemic fatigue." };
    }

    const readinesses = focusMuscles.map(m => getMuscleReadiness(m));
    const allPrimed = readinesses.every(r => r === 'PRIMED');
    const anyRecovering = readinesses.some(r => r === 'RECOVERING');
    const names = focusMuscles.map(m => MUSCLES.find(md => md.id === m)?.name ?? m).join(' & ');

    if (anyRecovering) return { title: `${names} need rest`, subtitle: "High local fatigue detected." };
    if (allPrimed) return { title: `${names} are PRIMED`, subtitle: "You're in a great spot to push." };

    return { title: `${names} are Ready`, subtitle: "Good conditions for training." };
  }, [focusMuscles, sectionStates, bodyReadiness]);

  const handleStartWorkout = () => {
    if (focusMuscles.length === 0) {
      setShowEditFocus(true);
      return;
    }

    if (coach?.recoveryState === 'REST') {
      setIsGateOpen(true);
      return;
    }

    navigate('/workout');
  };

  const handleGateConfirm = () => {
    setIsGateOpen(false);
    navigate('/workout');
  };

  const getCtaText = () => {
    if (currentSession) return 'Workout in Progress';
    if (focusMuscles.length === 0) return 'Select Focus Muscles';

    const names = focusMuscles.map(m => MUSCLES.find(md => md.id === m)?.name ?? m);
    if (names.length <= 2) return `Start ${names.join(' + ')} Session`;
    return 'Start Today\'s Session';
  };

  return (
    <div className="min-h-screen bg-background pb-[160px]">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Today's Focus</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Primary Readiness Decision Card */}
      {/* Coach Banner */}
      <div className="px-4 mb-4">
        <CoachBanner />
      </div>

      {/* Primary Readiness Decision Card */}
      <div className="px-4 mb-4">
        <FocusCard>
          <div className="relative">


            <FocusCardHeader
              size="lg"
              title={context.title}
              subtitle={context.subtitle}
            />

            <div className="mt-8 flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white/90 leading-none">{bodyReadiness}%</span>
                <span className="text-xs text-white/60 mt-2 font-medium">Training Readiness</span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="w-32 opacity-90 scale-90 origin-right">
                  <SegmentedProgress value={bodyReadiness} variant="zone" size="lg" />
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Recovery Spectrum</span>
              </div>
            </div>
          </div>
        </FocusCard>
      </div>

      {/* Soreness Check-in (Interactive) */}
      <div className="px-4 mb-4">
        <SorenessCheckin />
      </div>

      {/* Focus Muscles (Chips Only) */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Focus Muscles</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditFocus(true)}
              className="gap-1.5"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          </div>

          {focusMuscles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {focusMuscles.map(muscle => (
                <MuscleChip
                  key={muscle}
                  muscle={muscle}
                  readiness={getMuscleReadiness(muscle)}
                  selected
                  showStatusText={true}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No focus muscles selected.</p>
          )}
        </div>
      </div>

      {/* Last Workout Summary */}
      <div className="px-4 mb-4">
        <LastWorkoutCard />
      </div>

      {/* Suggested Focus */}
      {
        suggestedFocus.length > 0 && (
          <div className="px-4 mb-4">
            <div className="bg-muted/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primed" />
                <span className="text-sm font-medium text-foreground">Suggested Focus</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedFocus.map(muscle => (
                  <MuscleChip
                    key={muscle}
                    muscle={muscle}
                    readiness={getMuscleReadiness(muscle)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>
        )
      }

      {/* Sticky Start Workout CTA */}
      <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <Button
          onClick={handleStartWorkout}
          className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity shadow-lg"
          disabled={!!currentSession && currentSession.status === 'in_progress'}
        >
          {getCtaText()}
        </Button>
      </div>

      <EditFocusSheet open={showEditFocus} onOpenChange={setShowEditFocus} />

      <StartWorkoutGate
        open={isGateOpen}
        onOpenChange={setIsGateOpen}
        onConfirm={handleGateConfirm}
        onCancel={() => setIsGateOpen(false)}
      />
    </div >
  );
}