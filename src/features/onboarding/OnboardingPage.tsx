import { useState } from 'react';
import { useStore } from '@/state/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { WeightUnit } from '@/domain/types';

const STEPS = [
  'units',
  'age',
  'height',
  'weight',
  'experience'
] as const;

export function OnboardingPage() {
  const { setProfile, setSettings, profile, settings } = useStore();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);

  // Local state for inputs
  const [units, setUnits] = useState<WeightUnit>(settings.units);
  const [age, setAge] = useState<string>(profile.ageYears?.toString() || '');
  const [height, setHeight] = useState<string>(profile.heightCm?.toString() || '');
  const [weight, setWeight] = useState<string>(profile.weightKg?.toString() || '');
  // height in ft/in if pounds
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced' | ''>(profile.experienceLevel || '');

  const currentStep = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    // Validation logic could go here
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    // Save all data
    // Convert height if needed
    let finalHeightCm = 0;
    if (units === 'lb') {
      const ft = parseInt(heightFt) || 0;
      const inch = parseInt(heightIn) || 0;
      finalHeightCm = Math.round(((ft * 12) + inch) * 2.54);
    } else {
      finalHeightCm = parseInt(height) || 0;
    }

    setSettings({
      units,
      calibrationMode: true // Default
    });

    setProfile({
      ageYears: parseInt(age) || 0,
      heightCm: finalHeightCm,
      weightKg: parseInt(weight) || 0, // Inputs are in generic 'weight' but stored as kg? 
      // Wait, if user inputs lbs, we should store as kg internally?
      // The prompt said: "input uses selected units; store internally as kg"
      experienceLevel: experience as any,
      isOnboarded: true,
      fatigueSensitivity: experience === 'beginner' ? 0.8 : experience === 'advanced' ? 1.2 : 1.0
    });

    // We need to convert weight input to kg if units is lb
    const w = parseFloat(weight) || 0;
    const finalWeightKg = units === 'lb' ? w * 0.453592 : w;
    setProfile({ weightKg: finalWeightKg });

    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <Progress value={progress} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle(currentStep)}</CardTitle>
            <CardDescription>{getStepDescription(currentStep)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 'units' && (
              <div className="grid grid-cols-2 gap-4">
                <Button variant={units === 'kg' ? 'default' : 'outline'} onClick={() => setUnits('kg')}>KG / CM</Button>
                <Button variant={units === 'lb' ? 'default' : 'outline'} onClick={() => setUnits('lb')}>LBS / FT</Button>
              </div>
            )}

            {currentStep === 'age' && (
              <Input
                type="number"
                placeholder="Years (e.g. 25)"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            )}

            {currentStep === 'height' && units === 'kg' && (
              <Input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            )}

            {currentStep === 'height' && units === 'lb' && (
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Feet" value={heightFt} onChange={e => setHeightFt(e.target.value)} />
                <Input type="number" placeholder="Inches" value={heightIn} onChange={e => setHeightIn(e.target.value)} />
              </div>
            )}

            {currentStep === 'weight' && (
              <Input
                type="number"
                placeholder={`Weight (${units})`}
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            )}

            {currentStep === 'experience' && (
              <div className="space-y-2">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <Button
                    key={level}
                    variant={experience === level ? 'default' : 'outline'}
                    className="w-full capitalize"
                    onClick={() => setExperience(level as any)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            )}

            <Button className="w-full mt-6" onClick={handleNext} disabled={!isStepValid(currentStep, { age, height, heightFt, heightIn, weight, experience })}>
              {stepIndex === STEPS.length - 1 ? "Finish" : "Next"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStepTitle(step: string) {
  switch (step) {
    case 'units': return "Choose your units";
    case 'age': return "How young are you?";
    case 'height': return "What is your height?";
    case 'weight': return "What is your weight?";
    case 'experience': return "Training experience?";
    default: return "";
  }
}

function getStepDescription(step: string) {
  switch (step) {
    case 'units': return "Select your preferred measurement system.";
    case 'age': return "Used to calculate recovery capability.";
    case 'height': return "Helps us calibrate biometrics.";
    case 'weight': return "Track your body composition.";
    case 'experience': return "We'll adjust volume recommendations.";
    default: return "";
  }
}

function isStepValid(step: string, data: any) {
  switch (step) {
    case 'units': return true;
    case 'age': return !!data.age;
    case 'height': return (data.height || (data.heightFt && data.heightIn));
    case 'weight': return !!data.weight;
    case 'experience': return !!data.experience;
      return true;
  }
}