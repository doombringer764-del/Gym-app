import { useStore } from '@/state/store';
import { History, Dumbbell } from 'lucide-react';
import { MuscleChip } from '@/ui/MuscleChip';
import { formatDistanceToNow } from 'date-fns';

export function LastWorkoutCard() {
    const { sessions } = useStore();

    // Find last completed session
    const lastSession = sessions
        .filter(s => s.status === 'ended' && s.endedAt)
        .sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0))[0];

    if (!lastSession) return null;

    const durationMin = Math.round((lastSession.durationSeconds || 0) / 60);
    const dateStr = lastSession.endedAt
        ? formatDistanceToNow(lastSession.endedAt, { addSuffix: true })
        : 'Unknown date';

    // Generate summary string based on volume/intensity (placeholder logic)
    const exerciseCount = lastSession.exerciseEntries?.length || 0;
    const setCount = lastSession.sets?.length || 0;

    return (
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
            <div className="flex items-center gap-3 mb-3">
                <History className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground">Last Workout</h2>
                <span className="text-xs text-muted-foreground ml-auto">{dateStr}</span>
            </div>

            <div className="mb-3">
                <div className="flex flex-wrap gap-2 mb-2">
                    {lastSession.focusMuscles.map(m => (
                        <MuscleChip key={m} muscle={m} readiness="READY" size="sm" />
                    ))}
                </div>
                <p className="text-sm font-medium">
                    {durationMin} min • {exerciseCount} exercises • {setCount} sets
                </p>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                Completed {exerciseCount} exercises targeting {lastSession.focusMuscles.join(', ')}.
            </div>
        </div>
    );
}
