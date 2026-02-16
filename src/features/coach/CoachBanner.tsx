import { useEffect, useState } from 'react';
import { useStore } from '@/state/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, Zap, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

export function CoachBanner() {
    const { coach, recomputeCoachState } = useStore();
    const [timeLeft, setTimeLeft] = useState<string>('');

    // Recompute on mount to ensure freshness
    useEffect(() => {
        recomputeCoachState();
    }, [recomputeCoachState]);

    // Timer effect
    useEffect(() => {
        if (!coach?.nextRecommendedStartAt || coach.recoveryState !== 'REST') {
            setTimeLeft('');
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = coach.nextRecommendedStartAt! - now;

            if (diff <= 0) {
                recomputeCoachState(); // State changed to READY
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}h ${minutes}m`);
        }, 1000); // Update every second

        // Initial immediate update
        const diff = coach.nextRecommendedStartAt! - Date.now();
        if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}h ${minutes}m`);
        }

        return () => clearInterval(interval);
    }, [coach?.nextRecommendedStartAt, coach?.recoveryState, recomputeCoachState]);

    if (!coach) return null;

    const { coachBanner } = coach;

    const severityStyles = {
        default: 'bg-card border-border',
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
        destructive: 'bg-red-500/10 border-red-500/20 text-red-500',
    };

    const iconMap = {
        default: <RotateCcw className="w-5 h-5" />,
        success: <CheckCircle2 className="w-5 h-5" />,
        warning: <Clock className="w-5 h-5" />,
        destructive: <AlertCircle className="w-5 h-5" />,
    };

    return (
        <div className={cn(
            "rounded-2xl p-4 border mb-4 flex flex-col gap-3",
            severityStyles[coachBanner.severity]
        )}>
            <div className="flex items-start gap-3">
                <div className={cn(
                    "p-2 rounded-full bg-background/50",
                    coachBanner.severity === 'default' ? 'text-foreground' : 'text-current'
                )}>
                    {iconMap[coachBanner.severity]}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        {coachBanner.title}
                        {timeLeft && (
                            <span className="text-xs font-mono bg-background/50 px-1.5 py-0.5 rounded">
                                {timeLeft}
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {coachBanner.subtitle}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 pl-[44px]">
                {/* We don't render Primary CTA here because it typically triggers the main workout flow 
              which is handled by the main FAB. This banner is informational/nudge. 
              However, if we want specific actions like "View Recovery", we can add them.
          */}
                {coachBanner.secondaryCta && (
                    <button className="text-xs font-medium hover:underline opacity-80">
                        {coachBanner.secondaryCta}
                    </button>
                )}
            </div>
        </div>
    );
}
