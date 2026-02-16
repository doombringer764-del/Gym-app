import { useState } from 'react';
import { useStore } from '@/state/store';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { SECTIONS } from '@/domain/taxonomy/muscles';
import type { MuscleSection } from '@/domain/types';
import { cn } from '@/lib/utils';

export function SorenessCheckin() {
    const { focusMuscles, dailySoreness, setSoreness } = useStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    // Determine relevant sections based on focus muscles
    const relevantSections = SECTIONS.filter(s =>
        focusMuscles.includes(s.muscleGroup)
    );

    const getSorenessLabel = (level: number) => {
        switch (level) {
            case 0: return 'None';
            case 1: return 'Light';
            case 2: return 'Medium';
            case 3: return 'High';
            case 4: return 'Very High';
            default: return 'None';
        }
    };

    const getSorenessColor = (level: number) => {
        switch (level) {
            case 0: return 'text-muted-foreground';
            case 1: return 'text-ready';
            case 2: return 'text-caution';
            case 3: return 'text-orange-500';
            case 4: return 'text-destructive';
            default: return 'text-muted-foreground';
        }
    };

    const handleSorenessChange = (id: MuscleSection, val: number) => {
        setSoreness(id, val);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
    };

    // Generate summary string
    const summary = relevantSections.length > 0
        ? relevantSections.map(s => {
            const level = dailySoreness[s.id] || 0;
            return `${s.name}: ${getSorenessLabel(level)}`;
        }).join(' • ')
        : "No focus muscles selected";

    return (
        <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5"
            >
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">Soreness Check-in</span>
                    </div>

                    {!isExpanded && (
                        <p className="text-sm text-muted-foreground text-left ml-6">
                            {summary}
                        </p>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
            </button>

            {isExpanded && (
                <div className="p-5 pt-0 space-y-6 animate-in slide-in-from-top-2 border-t border-border/50">
                    {showFeedback && (
                        <div className="flex justify-center -mt-3 mb-2">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full animate-pulse">
                                Readiness adjusted based on soreness
                            </span>
                        </div>
                    )}

                    {relevantSections.map((section) => {
                        const level = dailySoreness[section.id] || 0;
                        return (
                            <div key={section.id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{section.name}</label>
                                    <span className={cn("text-xs font-semibold", getSorenessColor(level))}>
                                        {getSorenessLabel(level)}
                                    </span>
                                </div>
                                <Slider
                                    value={[level]}
                                    min={0}
                                    max={4}
                                    step={1}
                                    onValueChange={(vals) => handleSorenessChange(section.id, vals[0])}
                                    className="py-2"
                                />
                                <div className="flex justify-between px-1">
                                    {[0, 1, 2, 3, 4].map((tick) => (
                                        <div
                                            key={tick}
                                            className={cn(
                                                "w-1 h-1 rounded-full transition-colors",
                                                tick <= level ? (tick === level ? "bg-primary scale-125" : "bg-primary/50") : "bg-border"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {relevantSections.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                            Select focus muscles to see soreness sliders.
                        </p>
                    )}

                    <div className="pt-2 flex justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground"
                            onClick={() => setIsExpanded(false)}
                        >
                            Collapse
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
