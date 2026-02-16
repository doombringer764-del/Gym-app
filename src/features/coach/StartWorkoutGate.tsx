import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore } from '@/state/store';
import { Clock, ArrowRight } from 'lucide-react';

interface StartWorkoutGateProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export function StartWorkoutGate({ open, onOpenChange, onConfirm, onCancel }: StartWorkoutGateProps) {
    const { coach } = useStore();

    if (!coach) return null;

    const { nextRecommendedStartAt } = coach;
    const now = Date.now();

    // Calculate time remaining for display
    const diff = (nextRecommendedStartAt || 0) - now;
    const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-500">
                        <Clock className="w-5 h-5" />
                        Rest Recommended
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Your body is still in the optimal recovery window. Training now might yield diminishing returns.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/50 rounded-xl p-4 my-2 border border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Recommended Start Time</div>
                    <div className="text-2xl font-bold font-mono">
                        In {hours}h {minutes}m
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
                    <Button onClick={onConfirm} variant="default" className="w-full gap-2">
                        Start Anyway
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button onClick={onCancel} variant="outline" className="w-full">
                        Wait for Recovery
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
