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
import { AppGate } from "@/features/auth/AppGate";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20">
      <Routes>
        <Route element={<AppGate />}>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route path="/" element={
            <>
              <TodayPage />
              <BottomNav />
            </>
          } />

          <Route path="/muscles" element={
            <>
              <MusclePage />
              <BottomNav />
            </>
          } />

          <Route path="/workout" element={
            <>
              <WorkoutPage />
              <BottomNav />
            </>
          } />

          <Route path="/workout/session/:sessionId" element={<SessionDetailPage />} />

          <Route path="/profile" element={
            <>
              <ProfilePage />
              <BottomNav />
            </>
          } />

          <Route path="/settings" element={
            <>
              <SettingsPage />
              <BottomNav />
            </>
          } />
        </Route>
      </Routes>
    </div>
  );
};

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
