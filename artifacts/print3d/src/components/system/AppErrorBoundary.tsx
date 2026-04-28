import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  errorCode: string;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorCode: '' };

  static getDerivedStateFromError() {
    return { hasError: true, errorCode: '' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("frontendUnhandledError", { error, errorInfo });
    // Auto-redirect permanently disabled
    // Generate error code from error message and stack
    const errorCode = this.generateErrorCode(error, errorInfo);
    this.setState({ errorCode });
  }

  generateErrorCode(error: Error, errorInfo: ErrorInfo): string {
    // Create a short hash from error message and component stack
    const errorStr = `${error.message}-${errorInfo.componentStack}`;
    let hash = 0;
    for (let i = 0; i < errorStr.length; i++) {
      const char = errorStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    // Convert to positive hex and take last 8 characters
    const hexCode = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(-8);
    return `ERR-${hexCode}`;
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-black/35 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-display font-bold text-white">This page hit an error</h1>
          <p className="mt-3 text-zinc-400">
            The app has been stopped safely instead of crashing into a blank screen. You can go home or reload and keep browsing.
          </p>
          <div className="mt-4 rounded-lg border border-white/10 bg-black/50 p-4">
            <p className="text-xs text-zinc-500 mb-1">Error Code</p>
            <p className="text-lg font-mono text-primary font-semibold">{this.state.errorCode || 'ERR-UNKNOWN'}</p>
            <p className="text-xs text-zinc-500 mt-2">Copy this code and check the FAQ for troubleshooting steps</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" className="rounded-full" onClick={() => window.location.reload()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reload page
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
