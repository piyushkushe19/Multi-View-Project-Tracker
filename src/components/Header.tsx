import { useAppStore } from '../store/useAppStore';
import type { ViewMode } from '../types';

const TABS: { id: ViewMode; label: string }[] = [
  { id: 'kanban',   label: 'Kanban'   },
  { id: 'list',     label: 'List'     },
  { id: 'timeline', label: 'Timeline' },
];

export function Header() {
  const view     = useAppStore(s => s.view);
  const setView  = useAppStore(s => s.setView);
  const simUsers = useAppStore(s => s.simUsers);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 24px',
        height: 56,
        minHeight: 56,
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg)',
        position: 'relative',
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: 'var(--text)',
        }}
      >
        Velo<span style={{ color: 'var(--accent-light)' }}>zity</span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-dim)', flexShrink: 0 }} />

      {/* Presence bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {simUsers.slice(0, 3).map((u, i) => (
            <div
              key={u.id}
              title={u.initials}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: u.color + '22',
                color: u.color,
                border: `2px solid var(--bg)`,
                marginLeft: i === 0 ? 0 : -6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontFamily: 'DM Mono, monospace',
                fontWeight: 500,
                transition: 'transform 0.2s',
                zIndex: 3 - i,
                position: 'relative',
              }}
            >
              {u.initials}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>
          {simUsers.length} people viewing
        </span>
      </div>

      {/* View tabs */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          marginLeft: 'auto',
          background: 'var(--bg3)',
          borderRadius: 8,
          padding: 3,
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              color: view === tab.id ? 'var(--text)' : 'var(--text2)',
              background: view === tab.id ? 'var(--bg4)' : 'none',
              border: 'none',
              transition: 'all 0.15s',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
