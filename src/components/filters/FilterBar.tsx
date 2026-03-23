import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  STATUS_LABELS, STATUS_ORDER,
  PRIORITY_LABELS, PRIORITY_ORDER,
} from '../../types';
import { USERS } from '../../data/users';

type FilterKey = 'status' | 'priority' | 'assignee';

interface DropdownOption { value: string; label: string }

interface FilterChipProps {
  label: string;
  selectedCount: number;
  isOpen: boolean;
  onToggle: () => void;
  options: DropdownOption[];
  selectedValues: string[];
  onToggleOption: (v: string) => void;
}

function FilterChip({
  label, selectedCount, isOpen, onToggle, options, selectedValues, onToggleOption,
}: FilterChipProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 8,
          background: selectedCount > 0 ? 'var(--accent-muted)' : 'var(--bg3)',
          border: `1px solid ${selectedCount > 0 ? 'var(--accent)' : 'var(--border-dim)'}`,
          color: selectedCount > 0 ? 'var(--text)' : 'var(--text2)',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
      >
        {label}
        {selectedCount > 0
          ? (
            <span style={{
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 20,
              padding: '1px 6px',
              fontSize: 10,
              fontFamily: 'DM Mono, monospace',
            }}>
              {selectedCount}
            </span>
          )
          : <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
        }
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: 190,
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 6,
            zIndex: 300,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {options.map(opt => {
            const checked = selectedValues.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => onToggleOption(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: checked ? 'var(--accent-light)' : 'var(--text2)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                    background: checked ? 'var(--accent)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.1s',
                  }}
                >
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <polyline points="2,5 4,7 8,3" fill="none" stroke="white" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FilterBar() {
  const filters         = useAppStore(s => s.filters);
  const setFilterMulti  = useAppStore(s => s.setFilterMulti);
  const setDateFilter   = useAppStore(s => s.setDateFilter);
  const clearFilters    = useAppStore(s => s.clearFilters);
  const hasActiveFilters = useAppStore(s => s.hasActiveFilters);

  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenFilter(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const toggle = (key: FilterKey) => {
    setOpenFilter(prev => (prev === key ? null : key));
  };

  const chips: { key: FilterKey; label: string; options: DropdownOption[] }[] = [
    {
      key: 'status',
      label: 'Status',
      options: STATUS_ORDER.map(s => ({ value: s, label: STATUS_LABELS[s] })),
    },
    {
      key: 'priority',
      label: 'Priority',
      options: PRIORITY_ORDER.map(p => ({ value: p, label: PRIORITY_LABELS[p] })),
    },
    {
      key: 'assignee',
      label: 'Assignee',
      options: USERS.map(u => ({ value: u.id, label: u.name })),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 24px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg)',
        flexWrap: 'wrap',
      }}
      onClick={e => e.stopPropagation()}
    >
      <span
        style={{
          fontSize: 10,
          color: 'var(--text3)',
          fontFamily: 'DM Mono, monospace',
          letterSpacing: '0.5px',
          marginRight: 4,
        }}
      >
        FILTER
      </span>

      {chips.map(chip => (
        <FilterChip
          key={chip.key}
          label={chip.label}
          selectedCount={filters[chip.key].length}
          isOpen={openFilter === chip.key}
          onToggle={() => toggle(chip.key)}
          options={chip.options}
          selectedValues={filters[chip.key] as string[]}
          onToggleOption={(v) => {
            // Cast through unknown to satisfy the union constraint
            (setFilterMulti as (key: FilterKey, v: string) => void)(chip.key, v);
          }}
        />
      ))}

      {/* Date range */}
      <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', marginLeft: 8 }}>
        FROM
      </span>
      <input
        type="date"
        value={filters.dateFrom}
        onChange={e => setDateFilter('dateFrom', e.target.value)}
        style={{
          padding: '4px 8px',
          borderRadius: 8,
          background: 'var(--bg3)',
          border: '1px solid var(--border-dim)',
          color: 'var(--text)',
          fontSize: 12,
          fontFamily: 'DM Sans, sans-serif',
          outline: 'none',
          colorScheme: 'dark',
        }}
      />
      <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>TO</span>
      <input
        type="date"
        value={filters.dateTo}
        onChange={e => setDateFilter('dateTo', e.target.value)}
        style={{
          padding: '4px 8px',
          borderRadius: 8,
          background: 'var(--bg3)',
          border: '1px solid var(--border-dim)',
          color: 'var(--text)',
          fontSize: 12,
          fontFamily: 'DM Sans, sans-serif',
          outline: 'none',
          colorScheme: 'dark',
        }}
      />

      {hasActiveFilters() && (
        <button
          onClick={clearFilters}
          style={{
            marginLeft: 'auto',
            padding: '4px 10px',
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid #e24b4a',
            color: '#e24b4a',
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(226,75,74,0.1)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          ✕ Clear all
        </button>
      )}
    </div>
  );
}
