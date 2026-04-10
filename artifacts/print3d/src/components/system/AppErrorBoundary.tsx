import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("frontendUnhandledError", { error, errorInfo });
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
