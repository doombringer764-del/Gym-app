import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "@/state/store";
import { BottomNav } from "@/ui/BottomNav";
import { TodayPage } from "@/features/today/TodayPage";
import { WorkoutPage } from "@/features/workout/WorkoutPage";
import { SessionDetailPage } from "@/features/workout/SessionDetailPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { AuthPage } from "@/features/auth/AuthPage";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { MusclePage } from "@/features/muscle/MusclePage";

const queryClient = new QueryClient();

function AppContent() {
  const { profile, hydrate, initializeAuthListener } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    hydrate();
    initializeAuthListener();
  }, [hydrate, initializeAuthListener]);

  // Check if onboarding is needed
  useEffect(() => {
    if (!profile.isOnboarded && location.pathname !== '/onboarding' && location.pathname !== '/auth') {
      navigate('/onboarding');
    }
  }, [profile.isOnboarded, navigate, location.pathname]);

  const isWorkoutMode = useStore(state => !!state.currentSession);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20">
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/muscles" element={<MusclePage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/workout/session/:sessionId" element={<SessionDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
      {!isWorkoutMode && <BottomNav />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
