import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkoutSession } from '@/domain/types';
import { format } from 'date-fns';
import { ChevronRight, Clock, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MuscleChip } from '@/ui/MuscleChip';

interface SessionHistoryListProps {
    sessions: WorkoutSession[];
}

export function SessionHistoryList({ sessions }: SessionHistoryListProps) {
    const navigate = useNavigate();

    const groupedSessions = useMemo(() => {
        // Sort by date desc
        const sorted = [...sessions]
            .filter(s => s.status === 'ended')
            .sort((a, b) => b.startedAt - a.startedAt);

        const groups: Record<string, WorkoutSession[]> = {};

        sorted.forEach(session => {
            const dateKey = format(session.startedAt, 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(session);
        });

        return Object.entries(groups).map(([date, sessions]) => ({
            date,
            title: format(new Date(date), 'EEEE'),
            isToday: format(new Date(date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
            sessions
        }));
    }, [sessions]);

    if (sessions.filter(s => s.status === 'ended').length === 0) {
        return (
            <div className="text-center py-10 px-4">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No history yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Complete your first workout to see it here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            {groupedSessions.map(group => (
                <div key={group.date}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 px-1">
                        {group.isToday ? 'Today' : group.title}
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="font-normal opacity-70">{group.sessions.length} session{group.sessions.length !== 1 ? 's' : ''}</span>
                    </h3>

                    <div className="space-y-3">
                        {group.sessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => navigate(`/workout/session/${session.id}`)}
                                className="w-full bg-card rounded-xl border border-border overflow-hidden hover:bg-muted/50 transition-colors text-left"
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-foreground font-medium mb-1">
                                                {format(session.startedAt, 'h:mm a')}
                                                <span className="text-muted-foreground font-normal">•</span>
                                                <span className="text-muted-foreground font-normal">
                                                    {Math.floor((session.durationSeconds || 0) / 60)} min
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {session.focusMuscles.slice(0, 3).map(m => (
                                                    <span key={m} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-semibold uppercase tracking-wide">
                                                        {m}
                                                    </span>
                                                ))}
                                                {session.focusMuscles.length > 3 && (
                                                    <span className="px-1.5 py-0.5 text-xs text-muted-foreground">+</span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3 mt-1">
                                        <span>
                                            {session.exerciseEntries?.length || 0} exercises
                                        </span>
                                        <span>
                                            {/* Calculate total sets */}
                                            {session.exerciseEntries?.reduce((acc, e) => acc + (e.sets?.length || 0), 0) || 0} sets
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
