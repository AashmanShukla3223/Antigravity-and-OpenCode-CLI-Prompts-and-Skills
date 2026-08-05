import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  appId?: string;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.appId ? `:${this.props.appId}` : ''}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#1a1a2e]/90">
          <div className="text-4xl mb-3">💥</div>
          <h2 className="text-white text-sm font-semibold mb-2">
            {this.props.appId ? `${this.props.appId} crashed` : 'Something went wrong'}
          </h2>
          <pre className="text-red-400 text-[10px] max-w-full overflow-auto max-h-20 mb-3 select-text">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
