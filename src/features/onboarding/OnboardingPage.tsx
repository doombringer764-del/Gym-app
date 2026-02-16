import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Dumbbell,
  Target,
  Clock,
  Zap,
  ChevronRight,
  Scale,
  MapPin,
  Home,
  Building2,
  HelpCircle
} from 'lucide-react';
import type { UserMode, TimePreference, WeightUnit, WorkoutLocation } from '@/domain/types';

type Step = 'mode' | 'days' | 'time' | 'units' | 'location' | 'calibration';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { setProfile, setSettings } = useStore();

  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<UserMode>('intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [timePreference, setTimePreference] = useState<TimePreference>('afternoon');
  const [units, setUnits] = useState<WeightUnit>('lb');
  const [locationType, setLocationType] = useState<WorkoutLocation['type']>('gym');
  const [locationLabel, setLocationLabel] = useState('');

  const handleComplete = () => {
    setSettings({
      units,
      calibrationMode: true,
    });

    setProfile({
      mode,
      daysPerWeek,
      timePreference,
      defaultWorkoutLocation: {
        type: locationType,
        label: locationLabel || undefined,
      },
      isOnboarded: true,
      // Deprecated fields kept for compatibility if needed
      isCalibrating: true,
      weightUnit: units,
    });
    navigate('/');
  };

  const handleSkip = () => {
    setProfile({ isOnboarded: true });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/20 to-background">
      {/* Hero */}
      <div className="px-6 pt-12 pb-8 text-center">
        <div className="w-20 h-20 rounded-3xl gradient-primary mx-auto mb-6 flex items-center justify-center shadow-focus">
          <Dumbbell className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">FatigueFit</h1>
        <p className="text-muted-foreground">Smart training for busy lifters</p>
      </div>

      {/* Step Content */}
      <div className="px-6 pb-6">
        {step === 'mode' && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-xl font-semibold">Choose your mode</h2>
            <p className="text-sm text-muted-foreground">
              How do you prefer to plan your workouts?
            </p>

            <div className="space-y-3 mt-6">
              <button
                onClick={() => setMode('beginner')}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left transition-all',
                  mode === 'beginner'
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:bg-muted/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Guided Mode</p>
                    <p className="text-sm text-muted-foreground">
                      We'll suggest muscles and exercises each day
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('intermediate')}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left transition-all',
                  mode === 'intermediate'
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:bg-muted/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Flexible Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Pick your muscles, we'll guide the rest
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <Button
              onClick={() => setStep('days')}
              className="w-full mt-6 gradient-primary"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 'days' && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-xl font-semibold">Training frequency</h2>
            <p className="text-sm text-muted-foreground">
              How many days per week can you train?
            </p>

            <div className="grid grid-cols-4 gap-2 mt-6">
              {[2, 3, 4, 5, 6].map(days => (
                <button
                  key={days}
                  onClick={() => setDaysPerWeek(days)}
                  className={cn(
                    'p-4 rounded-2xl border text-center transition-all',
                    daysPerWeek === days
                      ? 'border-primary bg-primary/5 shadow-soft'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  <span className="text-2xl font-bold">{days}</span>
                  <p className="text-xs text-muted-foreground">days</p>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep('time')}
              className="w-full mt-6 gradient-primary"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 'time' && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-xl font-semibold">Preferred training time</h2>
            <p className="text-sm text-muted-foreground">
              When do you usually work out?
            </p>

            <div className="space-y-3 mt-6">
              {(['morning', 'afternoon', 'evening'] as TimePreference[]).map(time => (
                <button
                  key={time}
                  onClick={() => setTimePreference(time)}
                  className={cn(
                    'w-full p-4 rounded-2xl border text-left transition-all',
                    timePreference === time
                      ? 'border-primary bg-primary/5 shadow-soft'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium capitalize">{time}</span>
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep('units')}
              className="w-full mt-6 gradient-primary"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 'units' && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-xl font-semibold">Choose your specific unit</h2>
            <p className="text-sm text-muted-foreground">
              Which unit do you prefer for weight?
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setUnits('kg')}
                className={cn(
                  'p-6 rounded-2xl border text-center transition-all',
                  units === 'kg'
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:bg-muted/50'
                )}
              >
                <Scale className="w-8 h-8 text-primary mx-auto mb-2" />
                <span className="text-xl font-bold">KG</span>
                <p className="text-xs text-muted-foreground">Kilograms</p>
              </button>

              <button
                onClick={() => setUnits('lb')}
                className={cn(
                  'p-6 rounded-2xl border text-center transition-all',
                  units === 'lb'
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:bg-muted/50'
                )}
              >
                <Scale className="w-8 h-8 text-primary mx-auto mb-2" />
                <span className="text-xl font-bold">LB</span>
                <p className="text-xs text-muted-foreground">Pounds</p>
              </button>
            </div>

            <Button
              onClick={() => setStep('location')}
              className="w-full mt-6 gradient-primary"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 'location' && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-xl font-semibold">Where do you usually workout?</h2>
            <p className="text-sm text-muted-foreground">
              We'll default to this location for your sessions
            </p>

            <div className="space-y-3 mt-6">
              <button
                onClick={() => setLocationType('home')}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left transition-all',
                  locationType === 'home'
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-primary" />
                  <span className="font-medium">Home</span>
                </div>
              </button>

              <button
                onClick={() => setLocationType('gym')}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left transition-all',
                  locationType === 'gym'
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">Gym</span>
                </div>
              </button>

              <button
                onClick={() => setLocationType('other')}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left transition-all',
                  locationType === 'other'
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">Other</span>
                </div>
              </button>
            </div>

            {locationType === 'gym' && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                <Input
                  placeholder="Gym Name (optional)"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  className="bg-card"
                />
              </div>
            )}

            <Button
              onClick={() => setStep('calibration')}
              className="w-full mt-6 gradient-primary"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 'calibration' && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-xl font-semibold">Calibration Mode</h2>
            <p className="text-sm text-muted-foreground">
              We'll learn your fatigue sensitivity from your normal workouts.
            </p>

            <div className="bg-secondary/10 rounded-2xl p-5 mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <p className="font-medium">How it works</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Complete your first few workouts normally</li>
                <li>• We'll track your fatigue and recovery patterns</li>
                <li>• Predictions will get smarter over time</li>
              </ul>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full mt-6 gradient-primary"
            >
              Get Started
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Skip */}
      <div className="px-6 pb-8 text-center">
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}