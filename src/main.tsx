import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/global.css';

const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: THREE_DAYS,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'mystocks-query-cache',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: THREE_DAYS }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
);
