import { useMemo } from 'react';
import { WorkoutSession } from '@/domain/types';
import { Dumbbell, Calendar, Zap } from 'lucide-react';

interface WeeklyStatsProps {
    sessions: WorkoutSession[];
}

export function WeeklyStats({ sessions }: WeeklyStatsProps) {
    const stats = useMemo(() => {
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        // Filter sessions from last 7 days
        const recentSessions = sessions.filter(s => s.startedAt >= oneWeekAgo && s.status === 'ended');

        const count = recentSessions.length;
        const totalDuration = recentSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);

        // Calculate top muscles
        const muscleCounts: Record<string, number> = {};
        recentSessions.flatMap(s => s.focusMuscles).forEach(m => {
            muscleCounts[m] = (muscleCounts[m] || 0) + 1;
        });

        const topMuscles = Object.entries(muscleCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([m]) => m);

        return { count, hours, minutes, topMuscles };
    }, [sessions]);

    return (
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">This Week</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">{stats.count}</span>
                        <span className="text-sm text-muted-foreground">sessions</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">{stats.hours}</span>
                        <span className="text-sm text-muted-foreground">h {stats.minutes}m</span>
                    </div>
                </div>
            </div>

            {stats.topMuscles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Zap className="w-3 h-3" />
                        <span>Top Focus</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {stats.topMuscles.map(m => (
                            <span key={m} className="px-2 py-1 bg-muted rounded-md text-xs font-medium capitalize text-foreground">
                                {m}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
