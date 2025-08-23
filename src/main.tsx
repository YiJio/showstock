// packages
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// css
import './index.css';
import 'react-loading-skeleton/dist/skeleton.css'
// contexts/providers
import { PinnedProvider } from './contexts/pinned.context.tsx';
// components
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PinnedProvider>
      <App />
    </PinnedProvider>
  </StrictMode>,
);