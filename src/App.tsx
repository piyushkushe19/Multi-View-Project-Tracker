import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/Header';
import { FilterBar } from './components/filters/FilterBar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { ListView } from './components/list/ListView';
import { TimelineView } from './components/timeline/TimelineView';
import { useCollabSim } from './hooks/useCollabSim';

// Restore view + filters from URL on browser back/forward
function usePopState() {
  useEffect(() => {
    const handler = () => {
      // Force re-read from URL by refreshing the store
      // Simple approach: reload (in production you'd re-read URL params into store)
      window.location.reload();
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
}

export default function App() {
  const view = useAppStore(s => s.view);
  useCollabSim();
  usePopState();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <Header />
      <FilterBar />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {view === 'kanban'   && <KanbanBoard />}
        {view === 'list'     && <ListView />}
        {view === 'timeline' && <TimelineView />}
      </main>
    </div>
  );
}
