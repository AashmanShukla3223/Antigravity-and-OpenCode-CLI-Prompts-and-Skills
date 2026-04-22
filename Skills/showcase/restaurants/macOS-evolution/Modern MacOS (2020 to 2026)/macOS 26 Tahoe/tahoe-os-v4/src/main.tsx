import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { SystemProvider } from './contexts/SystemContext.tsx';
import { FileSystemProvider } from './contexts/FileSystemContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FileSystemProvider>
      <SystemProvider>
        <App />
      </SystemProvider>
    </FileSystemProvider>
  </StrictMode>
);
