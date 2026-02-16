import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useStore } from '@/state/store';

export function AppGate() {
    const { user, profile, isSyncing, hydrate, initializeAuthListener } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        hydrate();
        initializeAuthListener();
    }, [hydrate, initializeAuthListener]);

    useEffect(() => {
        // If syncing (loading initial data), maybe show a loader or just wait?
        // For now we let it render, but we might want to block strict redirects until sync is done if we want to be safe.
        // However, isSyncing is mainly for Firestore data. Auth state (user) comes from firebase listener.

        if (!user) {
            // If not logged in, only allow /auth
            if (location.pathname !== '/auth') {
                navigate('/auth');
            }
            return;
        }

        // If logged in
        if (location.pathname === '/auth') {
            // If on auth page but logged in, go to home or onboarding
            if (!profile.isOnboarded) {
                navigate('/onboarding');
            } else {
                navigate('/');
            }
            return;
        }

        if (!profile.isOnboarded) {
            // If not onboarded, only allow /onboarding
            if (location.pathname !== '/onboarding') {
                navigate('/onboarding');
            }
        } else {
            // If onboarded, block /onboarding
            if (location.pathname === '/onboarding') {
                navigate('/');
            }
        }

    }, [user, profile.isOnboarded, location.pathname, navigate, isSyncing]);

    if (isSyncing && !profile.isOnboarded) {
        // Optional: Show loading state if we are syncing and potentially checking onboarding status
        // return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return <Outlet />;
}
