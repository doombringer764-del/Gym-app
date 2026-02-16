import { Button } from "@/components/ui/button";
import { useStore } from "@/state/store";
import { Dumbbell } from "lucide-react";

export function AuthPage() {
    const { login } = useStore();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
            <div className="w-full max-w-sm space-y-8 text-center">

                {/* Logo / Branding */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Dumbbell className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">FatigueFit</h1>
                    <p className="text-muted-foreground text-lg">
                        Train smarter. Recover smarter.
                    </p>
                </div>

                {/* Auth Options */}
                <div className="space-y-4 pt-8">
                    <Button
                        size="lg"
                        className="w-full h-12 text-base font-semibold"
                        onClick={() => login()}
                    >
                        Continue with Google
                    </Button>
                </div>

            </div>
        </div>
    );
}
