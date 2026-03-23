import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { sortTasks } from '../../utils/sort';
import { useVirtualScroll } from './useVirtualScroll';
import { ListRow, ROW_HEIGHT } from './ListRow';
import type { SortColumn } from '../../types';

const COLUMNS: { key: SortColumn | '_num' | '_assignee'; label: string; sortable: boolean }[] = [
  { key: '_num',      label: '#',        sortable: false },
  { key: 'title',     label: 'Task',     sortable: true  },
  { key: 'priority',  label: 'Priority', sortable: true  },
  { key: null,        label: 'Status',   sortable: false },
  { key: '_assignee', label: 'Assignee', sortable: false },
  { key: 'dueDate',   label: 'Due Date', sortable: true  },
];

export function ListView() {
  const getFilteredTasks = useAppStore(s => s.getFilteredTasks);
  const sort             = useAppStore(s => s.sort);
  const setSort          = useAppStore(s => s.setSort);
  const clearFilters     = useAppStore(s => s.clearFilters);

  const filteredTasks = getFilteredTasks();
  const sortedTasks   = useMemo(
    () => sortTasks(filteredTasks, sort),
    [filteredTasks, sort]
  );

  const { startIndex, endIndex, totalHeight, onScroll, scrollerRef } = useVirtualScroll({
    rowHeight: ROW_HEIGHT,
    totalRows: sortedTasks.length,
  });

  const visibleRows = sortedTasks.slice(startIndex, endIndex + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Sticky column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 110px 140px 160px 150px',
          padding: '0 24px',
          height: 40,
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid var(--border-dim)',
          background: 'var(--bg)',
          flexShrink: 0,
        }}
      >
        {COLUMNS.map(col => {
          const isSortActive = col.sortable && sort.col === col.key;
          return (
            <div
              key={String(col.key)}
              onClick={() => col.sortable && col.key && setSort(col.key as SortColumn)}
              style={{
                fontSize: 11,
                fontFamily: 'DM Mono, monospace',
                color: isSortActive ? 'var(--accent-light)' : 'var(--text3)',
                cursor: col.sortable ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                userSelect: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => {
                if (col.sortable) (e.currentTarget as HTMLDivElement).style.color = 'var(--text2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.color = isSortActive
                  ? 'var(--accent-light)'
                  : 'var(--text3)';
              }}
            >
              {col.label}
              {isSortActive && (
                <span style={{ fontSize: 10 }}>
                  {sort.dir === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Virtual scroll container */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
      >
        {/* Full-height spacer to keep scrollbar correct */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {sortedTasks.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 240,
                gap: 12,
                color: 'var(--text3)',
              }}
            >
              <p style={{ fontSize: 15, color: 'var(--text2)', fontFamily: 'Syne, sans-serif' }}>
                No tasks match your filters
              </p>
              <button
                onClick={clearFilters}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  background: 'var(--accent-muted)',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent-light)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            visibleRows.map((task, i) => (
              <ListRow
                key={task.id}
                task={task}
                index={startIndex + i}
                top={(startIndex + i) * ROW_HEIGHT}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
