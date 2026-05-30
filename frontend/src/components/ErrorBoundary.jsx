import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full glass rounded-3xl border border-white/5 p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-heading font-bold text-white">
              Something went wrong
            </h1>
            
            <p className="text-text-muted text-sm">
              We've encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-black/50 text-red-400 text-xs p-4 rounded-xl overflow-x-auto text-left font-mono">
                {this.state.error.toString()}
              </div>
            )}

            <Button 
              variant="primary" 
              className="w-full gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
