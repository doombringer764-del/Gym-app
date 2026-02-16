import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { Button } from '@/components/ui/button';
import { FocusCard, FocusCardHeader } from '@/ui/FocusCard';
import { MuscleChip } from '@/ui/MuscleChip';
import { getRecommendedExercises } from '@/domain/engines/planEngine';
import { MUSCLES } from '@/domain/taxonomy/muscles';
import { getSectionReadiness } from '@/domain/engines/readinessEngine';
import type { MuscleGroup, ReadinessState, ExerciseEntry } from '@/domain/types';
import { Play, Square, Plus, Dumbbell, ListPlus, MapPin, Building2, Home, HelpCircle } from 'lucide-react';
import { LogSetSheet } from './LogSetSheet';
import { AddExerciseSheet } from './AddExerciseSheet';
import { ExerciseCard } from './ExerciseCard';
import { SessionSummary } from './SessionSummary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { saveState } from '@/state/persistence';
import { SorenessCheckin } from './SorenessCheckin';
import { LastWorkoutCard } from './LastWorkoutCard';
import { WeeklyStats } from './history/WeeklyStats';
import { SessionHistoryList } from './history/SessionHistoryList';
import { CoachBanner } from '../coach/CoachBanner';
import { StartWorkoutGate } from '../coach/StartWorkoutGate';
import { StartWorkoutModal } from './StartWorkoutModal';
import { WorkoutLocation, TimePreference } from '@/domain/types';

export function WorkoutPage() {
  const navigate = useNavigate();
  const {
    sectionStates,
    focusMuscles,
    currentSession,
    startSession,
    endSession,
    addExerciseEntry,
    sessions,
    coach,

    // We need to access the store state directly for direct updates to session
    // This is a bit of a hack to update location without a specific action
    // In a real app we'd add updateSessionLocation action
  } = useStore();

  const [selectedEntry, setSelectedEntry] = useState<ExerciseEntry | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const exerciseRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Gate state
  const [isGateOpen, setIsGateOpen] = useState(false);

  /* Removed duplicate block */
  useEffect(() => {
    if (!currentSession?.startedAt) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - currentSession.startedAt) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);

    // Initial set
    setElapsedSeconds(Math.floor((Date.now() - currentSession.startedAt) / 1000));

    return () => clearInterval(interval);
  }, [currentSession?.startedAt]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getMuscleReadiness = (muscle: MuscleGroup): ReadinessState => {
    const muscleData = MUSCLES.find(m => m.id === muscle);
    if (!muscleData) return 'READY';

    const states: ReadinessState[] = muscleData.sections.map(s => {
      const state = sectionStates.get(s.id);
      return state ? getSectionReadiness(state) : 'READY';
    });

    if (states.includes('RECOVERING')) return 'RECOVERING';
    if (states.includes('CAUTION')) return 'CAUTION';
    if (states.includes('PRIMED')) return 'PRIMED';
    return 'READY';
  };

  const recommendations = useMemo(
    () => getRecommendedExercises(focusMuscles, sectionStates),
    [focusMuscles, sectionStates]
  );

  const handleStartSession = (location: WorkoutLocation, timeBucket: TimePreference) => {
    startSession(focusMuscles, location, timeBucket);
  };

  const handleStartClick = () => {
    if (coach?.recoveryState === 'REST') {
      setIsGateOpen(true);
    } else {
      setShowStartModal(true);
    }
  };

  // When gate confirms, we show the modal
  const handleGateConfirm = () => {
    setIsGateOpen(false);
    setShowStartModal(true);
  };

  const handleEndSession = () => {
    endSession();
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    navigate('/');
  };

  const handleAddRecommendedExercise = (exerciseId: string) => {
    const entry = addExerciseEntry(exerciseId);
    if (entry) {
      setTimeout(() => {
        const ref = exerciseRefs.current.get(entry.id);
        ref?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSelectedEntry(entry);
      }, 100);
    }
  };

  const handleAddExercise = (exerciseId: string) => {
    const entry = addExerciseEntry(exerciseId);
    if (entry) {
      setTimeout(() => {
        const ref = exerciseRefs.current.get(entry.id);
        ref?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSelectedEntry(entry);
      }, 100);
    }
  };

  // Temporary function to update location
  // Effectively patching the session in state
  const handleUpdateLocation = (location: WorkoutLocation) => {
    if (!currentSession) return;

    useStore.setState(state => ({
      currentSession: state.currentSession ? {
        ...state.currentSession,
        startedLocation: location
      } : null
    }));

    // Persist
    saveState(useStore.getState());
    setShowLocationDialog(false);
  };

  // Update selected entry reference when currentSession changes
  useEffect(() => {
    if (selectedEntry && currentSession) {
      const updated = currentSession.exerciseEntries.find(e => e.id === selectedEntry.id);
      if (updated) {
        setSelectedEntry(updated);
      }
    }
  }, [currentSession?.exerciseEntries]);

  // No active session
  // No active session (Workout Hub View)
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-background pb-[160px]">
        {/* Workout Hub Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Workout</h1>
          <p className="text-muted-foreground mt-1">Your sessions & history</p>
        </div>

        <div className="px-4 mb-4">
          <CoachBanner />
        </div>

        <div className="px-4">
          {/* Weekly Stats */}
          <WeeklyStats sessions={sessions} />

          {/* History List */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent History</h2>
            <SessionHistoryList sessions={sessions} />
          </div>
        </div>

        {/* Sticky Start Button */}
        <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <Button
            onClick={handleStartClick}
            className="w-full h-14 text-lg font-semibold gradient-primary gap-2 shadow-lg"
          >
            <Play className="w-5 h-5" />
            Start Workout
          </Button>
        </div>

        {showSummary && <SessionSummary onClose={handleCloseSummary} />}

        <StartWorkoutGate
          open={isGateOpen}
          onOpenChange={setIsGateOpen}
          onConfirm={handleGateConfirm}
          onCancel={() => setIsGateOpen(false)}
        />

        <StartWorkoutModal
          open={showStartModal}
          onOpenChange={setShowStartModal}
          onConfirm={handleStartSession}
        />
      </div>
    );
  }

  // Active session
  const totalSets = currentSession.exerciseEntries.reduce((sum, e) => sum + e.sets.length, 0);
  const locationLabel = currentSession.startedLocation?.label
    || (currentSession.startedLocation?.type === 'gym' ? 'Gym' :
      currentSession.startedLocation?.type === 'home' ? 'Home' : 'Other');

  return (
    <div className="min-h-screen bg-background pb-[160px]">
      {/* Session Header */}
      <div className="px-4 pt-6 pb-4">
        <FocusCard>
          <FocusCardHeader
            title="Workout in Progress"
            subtitle={
              <div className="flex items-center gap-2">
                <span>{formatTime(elapsedSeconds)} • {totalSets} sets</span>
                <button
                  onClick={() => setShowLocationDialog(true)}
                  className="inline-flex items-center gap-1 bg-muted/50 hover:bg-muted px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  {locationLabel}
                </button>
              </div>
            }
            action={
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndSession}
                className="gap-1"
              >
                <Square className="w-4 h-4" />
                End
              </Button>
            }
          />
          <div className="flex flex-wrap gap-2">
            {currentSession.focusMuscles.map(muscle => (
              <MuscleChip
                key={muscle}
                muscle={muscle}
                readiness={getMuscleReadiness(muscle)}
                size="sm"
              />
            ))}
          </div>
        </FocusCard>
      </div>

      {/* Your Workout (Exercise Entries) */}
      {currentSession.exerciseEntries.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Your Workout ({currentSession.exerciseEntries.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddExercise(true)}
              className="gap-1 text-primary"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {currentSession.exerciseEntries.map((entry) => (
              <div
                key={entry.id}
                ref={(el) => {
                  if (el) exerciseRefs.current.set(entry.id, el);
                }}
              >
                <ExerciseCard
                  entry={entry}
                  onLogSet={() => setSelectedEntry(entry)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Exercise CTA (when no exercises yet) */}
      {currentSession.exerciseEntries.length === 0 && (
        <div className="px-4 mb-6">
          <Button
            onClick={() => setShowAddExercise(true)}
            variant="outline"
            className="w-full h-14 gap-2"
          >
            <ListPlus className="w-5 h-5" />
            Add Exercise
          </Button>
        </div>
      )}

      {/* Recommended Exercises */}
      <div className="px-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Dumbbell className="w-4 h-4" />
          Recommended Exercises
        </h3>
        <div className="space-y-2">
          {recommendations.map(({ exercise, reason }) => {
            const alreadyAdded = currentSession.exerciseEntries.some(e => e.exerciseId === exercise.id);
            return (
              <button
                key={exercise.id}
                onClick={() => handleAddRecommendedExercise(exercise.id)}
                disabled={alreadyAdded}
                className={`w-full bg-card rounded-xl p-4 border border-border text-left transition-colors ${alreadyAdded ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-muted-foreground">{reason}</p>
                  </div>
                  {alreadyAdded ? (
                    <span className="text-xs text-muted-foreground">Added</span>
                  ) : (
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <LogSetSheet
        exerciseEntry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />

      <AddExerciseSheet
        open={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onSelect={handleAddExercise}
      />

      {showSummary && <SessionSummary onClose={handleCloseSummary} />}

      {/* Location Selector Dialog */}
      <LocationSelectorDialog
        open={showLocationDialog}
        onOpenChange={setShowLocationDialog}
        currentLocation={currentSession.startedLocation}
        onSelect={handleUpdateLocation}
      />
    </div>
  );
}

function LocationSelectorDialog({
  open,
  onOpenChange,
  currentLocation,
  onSelect
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocation?: WorkoutLocation;
  onSelect: (location: WorkoutLocation) => void;
}) {
  const [type, setType] = useState<WorkoutLocation['type']>(currentLocation?.type || 'gym');
  const [label, setLabel] = useState(currentLocation?.label || '');

  // Reset when opened
  useEffect(() => {
    if (open && currentLocation) {
      setType(currentLocation.type);
      setLabel(currentLocation.label || '');
    }
  }, [open, currentLocation]);

  const handleSave = () => {
    onSelect({ type, label: label || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Location</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <button
              onClick={() => setType('home')}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all',
                type === 'home'
                  ? 'border-primary bg-primary/5 shadow-soft'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-primary" />
                <span className="font-medium">Home</span>
              </div>
            </button>

            <button
              onClick={() => setType('gym')}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all',
                type === 'gym'
                  ? 'border-primary bg-primary/5 shadow-soft'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-medium">Gym</span>
              </div>
            </button>

            <button
              onClick={() => setType('other')}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all',
                type === 'other'
                  ? 'border-primary bg-primary/5 shadow-soft'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span className="font-medium">Other</span>
              </div>
            </button>
          </div>

          {type === 'gym' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <Input
                placeholder="Gym Name (optional)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>Update Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}