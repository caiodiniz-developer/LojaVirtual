import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled app error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold">Algo deu errado</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Encontramos um erro inesperado. Tente novamente em instantes.
          </p>
        </div>
        <Button onClick={() => this.setState({ hasError: false })}>
          <RotateCcw className="h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );
  }
}
