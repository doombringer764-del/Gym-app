import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { ChevronLeft, Calendar, Clock, MapPin, Share2, Copy, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MuscleChip } from '@/ui/MuscleChip';
import { ExerciseCard } from './ExerciseCard';

export function SessionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { sessions, startSession } = useStore();

    const session = sessions.find(s => s.id === id);

    if (!session) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h1 className="text-xl font-bold mb-2">Session Not Found</h1>
                <Button onClick={() => navigate('/workout')}>Back to Workout Hub</Button>
            </div>
        );
    }

    const handleCopyWorkout = () => {
        // Start a new session with the same exercises
        startSession(session.focusMuscles, session.startedLocation);

        // Add exercises to the new session (need to do this after startSession completes/state updates)
        // For now, we'll just navigate to workout page where user can add them
        // Ideally we'd have a 'duplicateSession' action in store

        // Simplification: Just start with same focus muscles
        navigate('/workout');
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/workout')}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="font-semibold">Session Detail</span>
                </div>
                <div className="flex gap-2">
                    {/* Placeholder for Share 
          <Button variant="ghost" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          */}
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Session Info Card */}
                <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-1">
                                {format(session.startedAt, 'EEEE, MMM d')}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{Math.floor((session.durationSeconds || 0) / 60)} min</span>
                                </div>
                                {session.startedLocation && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{session.startedLocation.label || session.startedLocation.type}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {session.focusMuscles.map(m => (
                            <MuscleChip key={m} muscle={m} selected size="sm" />
                        ))}
                    </div>
                </div>

                {/* Exercises */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider px-1">Exercises</h3>
                    <div className="space-y-4">
                        {session.exerciseEntries?.map(entry => (
                            <div key={entry.id} className="bg-card rounded-xl p-4 border border-border">
                                <h4 className="font-semibold text-foreground mb-2">{entry.name}</h4>
                                <div className="space-y-1">
                                    {entry.sets.map((set, idx) => (
                                        <div key={set.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                                            <span className="text-muted-foreground w-6 font-medium">{idx + 1}</span>
                                            <span className="font-medium text-foreground">
                                                {set.weightKg ? (set.weightKg * 2.20462).toFixed(1) : 0} <span className="text-xs text-muted-foreground font-normal">lb</span>
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {set.reps} <span className="text-xs text-muted-foreground font-normal">reps</span>
                                            </span>
                                            <span className="text-xs text-muted-foreground w-12 text-right">RPE {set.rpe}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {(!session.exerciseEntries || session.exerciseEntries.length === 0) && (
                            <p className="text-sm text-muted-foreground italic px-1">No exercises logged.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4">
                    <Button onClick={handleCopyWorkout} className="w-full gap-2" variant="outline">
                        <Copy className="w-4 h-4" />
                        Copy Workout (Start New)
                    </Button>
                </div>
            </div>
        </div>
    );
}
