// src/components/common/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-white/60 mb-6">
              {this.props.fallbackMessage || 
                "We're sorry, but something unexpected happened. Please try refreshing the page."}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-500/10 rounded-lg text-left">
                <p className="text-sm text-red-400 font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={this.handleReset}
                leftIcon={<RefreshCw size={18} />}
              >
                Try Again
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
