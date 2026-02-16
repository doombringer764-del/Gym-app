import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    googleProvider,
    auth
} from '@/lib/firebase';
import { useStore } from '@/state/store';
import { FocusCard, FocusCardHeader } from '@/ui/FocusCard';
import { Dumbbell, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuthPage() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Google authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-2">
                        <Dumbbell className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Welcome to Muscle Readiness</h1>
                    <p className="text-muted-foreground">Sign in to sync your progress and coach settings.</p>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={cn(
                                "flex-1 py-4 text-sm font-medium transition-colors",
                                isLogin ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={cn(
                                "flex-1 py-4 text-sm font-medium transition-colors",
                                !isLogin ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-background"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-background"
                                    disabled={isLoading}
                                />
                            </div>

                            <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            className="w-full gap-2"
                            onClick={handleGoogleAuth}
                            disabled={isLoading}
                        >
                            <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Google
                        </Button>
                    </div>
                </div>

                {/* Optional: Skip for now if user wants to just try the app? */}
                <div className="text-center">
                    <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                        Skip for now (Offline Mode)
                    </button>
                </div>
            </div>
        </div>
    );
}
