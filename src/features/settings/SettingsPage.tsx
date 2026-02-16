import { useStore } from '@/state/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, RotateCcw, User, Clock, Scale, LogOut, LogIn } from 'lucide-react';
import type { TimePreference, UserMode, WeightUnit } from '@/domain/types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { profile, settings, setProfile, setSettings, resetAllData, user, logout } = useStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const navigate = useNavigate();

  const handleResetData = () => {
    resetAllData();
    setShowResetDialog(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your experience</p>
      </div>

      {/* Account Section */}
      <div className="px-4 mb-6">
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>

          <div className="space-y-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Signed in as:</span>
                  <div className="font-medium text-foreground">{user.email}</div>
                </div>
                <Button variant="outline" onClick={handleLogout} className="w-full gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">Sign in to sync your data across devices.</p>
                <Button onClick={() => navigate('/auth')} className="w-full gap-2 gradient-primary">
                  <LogIn className="w-4 h-4" />
                  Sign In / Create Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Training Mode */}
      <div className="px-4 mb-6">
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Training Mode</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Mode</Label>
                <p className="text-sm text-muted-foreground">How workouts are planned</p>
              </div>
              <Select
                value={profile.mode}
                onValueChange={(value: UserMode) => setProfile({ mode: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Guided</SelectItem>
                  <SelectItem value="intermediate">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Calibration Mode</Label>
                <p className="text-sm text-muted-foreground">Learning your patterns</p>
              </div>
              <Switch
                checked={settings.calibrationMode}
                onCheckedChange={(checked) => setSettings({ calibrationMode: checked })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="px-4 mb-6">
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Schedule</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Days per week</Label>
                <p className="text-sm text-muted-foreground">Training frequency</p>
              </div>
              <Select
                value={String(profile.daysPerWeek)}
                onValueChange={(value) => setProfile({ daysPerWeek: parseInt(value) })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7].map(d => (
                    <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Time preference</Label>
                <p className="text-sm text-muted-foreground">When you usually train</p>
              </div>
              <Select
                value={profile.timePreference}
                onValueChange={(value: TimePreference) => setProfile({ timePreference: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Units */}
      <div className="px-4 mb-6">
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Units</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Weight Unit</Label>
              <RadioGroup
                value={settings.units}
                onValueChange={(value: WeightUnit) => setSettings({ units: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lb" id="lb" />
                  <Label htmlFor="lb" className="cursor-pointer">Pounds (lb)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kg" id="kg" />
                  <Label htmlFor="kg" className="cursor-pointer">Kilograms (kg)</Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground mt-2">
                Weights are stored internally in kg and converted for display.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="px-4">
        <div className="bg-destructive/5 rounded-2xl p-5 border border-destructive/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            This will permanently delete all your workout history, stats, and settings.
          </p>

          <Button
            variant="destructive"
            onClick={() => setShowResetDialog(true)}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Data
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Data?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your workout history, stats, badges, and settings will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetData}>
              Yes, Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}