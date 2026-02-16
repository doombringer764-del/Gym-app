import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useStore } from "@/state/store";
import { WorkoutLocation, TimePreference } from "@/domain/types";
import { Sun, Moon, Sunset, Sunrise, Home, Building2, MapPin } from "lucide-react";

interface StartWorkoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (location: WorkoutLocation, timeBucket: TimePreference) => void;
}

export function StartWorkoutModal({ open, onOpenChange, onConfirm }: StartWorkoutModalProps) {
    const { profile } = useStore();

    // Default states
    const [locationType, setLocationType] = useState<'gym' | 'home' | 'other'>('gym');
    const [timeBucket, setTimeBucket] = useState<TimePreference>('afternoon');

    // Initialize with some smart defaults or user preference
    useEffect(() => {
        if (open) {
            if (profile.defaultWorkoutLocation) {
                setLocationType(profile.defaultWorkoutLocation.type);
            }

            // Auto-detect time of day
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) setTimeBucket('morning');
            else if (hour >= 12 && hour < 17) setTimeBucket('afternoon');
            else if (hour >= 17 && hour < 21) setTimeBucket('evening');
            else setTimeBucket('night');
        }
    }, [open, profile.defaultWorkoutLocation]);

    const handleConfirm = () => {
        onConfirm(
            { type: locationType },
            timeBucket
        );
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Log Session Context</DialogTitle>
                    <DialogDescription>
                        Where and when are you training?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">

                    {/* Location Selection */}
                    <div className="grid gap-3">
                        <Label>Location</Label>
                        <RadioGroup
                            value={locationType}
                            onValueChange={(v) => setLocationType(v as any)}
                            className="grid grid-cols-3 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="gym" id="gym" className="peer sr-only" />
                                <Label
                                    htmlFor="gym"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer"
                                >
                                    <Building2 className="mb-2 h-6 w-6" />
                                    Gym
                                </Label>
                            </div>

                            <div>
                                <RadioGroupItem value="home" id="home" className="peer sr-only" />
                                <Label
                                    htmlFor="home"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer"
                                >
                                    <Home className="mb-2 h-6 w-6" />
                                    Home
                                </Label>
                            </div>

                            <div>
                                <RadioGroupItem value="other" id="other" className="peer sr-only" />
                                <Label
                                    htmlFor="other"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer"
                                >
                                    <MapPin className="mb-2 h-6 w-6" />
                                    Other
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Time Bucket Selection */}
                    <div className="grid gap-3">
                        <Label>Time of Day</Label>
                        <Select value={timeBucket} onValueChange={(v) => setTimeBucket(v as TimePreference)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="morning">
                                    <div className="flex items-center"><Sunrise className="mr-2 h-4 w-4" /> Morning (5am - 12pm)</div>
                                </SelectItem>
                                <SelectItem value="afternoon">
                                    <div className="flex items-center"><Sun className="mr-2 h-4 w-4" /> Afternoon (12pm - 5pm)</div>
                                </SelectItem>
                                <SelectItem value="evening">
                                    <div className="flex items-center"><Sunset className="mr-2 h-4 w-4" /> Evening (5pm - 9pm)</div>
                                </SelectItem>
                                <SelectItem value="night">
                                    <div className="flex items-center"><Moon className="mr-2 h-4 w-4" /> Night (9pm - 5am)</div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                <DialogFooter>
                    <Button onClick={handleConfirm} className="w-full">Start Workout</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
