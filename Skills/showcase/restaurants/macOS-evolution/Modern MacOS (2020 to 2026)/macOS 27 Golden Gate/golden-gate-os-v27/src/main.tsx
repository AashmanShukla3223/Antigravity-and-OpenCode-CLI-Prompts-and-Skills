import { createRoot } from 'react-dom/client';
import { StrictMode, Component, type ReactNode } from 'react';
import './index.css';
import './cursors.css';
import App from './App.tsx';
import { SystemProvider } from './contexts/SystemContext.tsx';
import { FileSystemProvider } from './contexts/FileSystemContext.tsx';
// Debug utilities - available globally in console
import './utils/bootLogger.ts';
import './utils/iconDebugger.ts';

class BootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  render() {
    const error = this.state.error;
    if (error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#000',
            color: '#fff',
            fontFamily: 'system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Boot Error</h1>
          <pre
            style={{
              fontSize: '0.875rem',
              color: '#f87171',
              maxWidth: '80vw',
              overflow: 'auto',
              userSelect: 'text',
              WebkitUserSelect: 'text',
            }}
          >
            {error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BootErrorBoundary>
      <FileSystemProvider>
        <SystemProvider>
          <App />
        </SystemProvider>
      </FileSystemProvider>
    </BootErrorBoundary>
  </StrictMode>,
);
