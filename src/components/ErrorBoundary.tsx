import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleReset = () => {
        localStorage.removeItem("fatiguefit-state");
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border border-destructive/20 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-4 text-destructive">
                            <AlertTriangle className="w-8 h-8" />
                            <h2 className="text-xl font-bold">Something went wrong</h2>
                        </div>

                        <p className="text-muted-foreground mb-4">
                            The application encountered an unexpected error.
                        </p>

                        {this.state.error && (
                            <div className="bg-muted/50 rounded-lg p-3 mb-6 overflow-auto max-h-40 text-xs font-mono">
                                <p className="font-bold text-destructive mb-1">{this.state.error.toString()}</p>
                                {this.state.errorInfo && (
                                    <pre className="text-muted-foreground">{this.state.errorInfo.componentStack}</pre>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button onClick={this.handleReload} className="w-full gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Reload Page
                            </Button>

                            <Button variant="outline" onClick={this.handleReset} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                                Clear Data & Reset
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                Use "Clear Data" if reloading doesn't fix the issue.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
