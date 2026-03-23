import { create } from 'zustand';
import type {
  Task, TaskStatus, ViewMode, FilterState, SortState,
  SimUser, SortColumn,
} from '../types';
import { generateTasks } from '../data/seedTasks';

// ─── URL helpers ──────────────────────────────────────────────────────────────

function readFiltersFromURL(): Partial<FilterState> {
  const p = new URLSearchParams(window.location.search);
  return {
    status: p.get('status') ? (p.get('status')!.split(',') as TaskStatus[]) : [],
    priority: p.get('priority') ? (p.get('priority')!.split(',') as FilterState['priority']) : [],
    assignee: p.get('assignee') ? p.get('assignee')!.split(',') : [],
    dateFrom: p.get('from') ?? '',
    dateTo: p.get('to') ?? '',
  };
}

function readViewFromURL(): ViewMode {
  const p = new URLSearchParams(window.location.search);
  const v = p.get('view');
  if (v === 'list' || v === 'kanban' || v === 'timeline') return v;
  return 'kanban';
}

function pushFiltersToURL(filters: FilterState, view: ViewMode): void {
  const p = new URLSearchParams();
  if (filters.status.length)   p.set('status',   filters.status.join(','));
  if (filters.priority.length) p.set('priority', filters.priority.join(','));
  if (filters.assignee.length) p.set('assignee', filters.assignee.join(','));
  if (filters.dateFrom)        p.set('from',     filters.dateFrom);
  if (filters.dateTo)          p.set('to',       filters.dateTo);
  if (view !== 'kanban')       p.set('view',     view);
  const qs = p.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

// ─── Store shape ──────────────────────────────────────────────────────────────

interface AppStore {
  // Data
  tasks: Task[];

  // View
  view: ViewMode;
  setView: (v: ViewMode) => void;

  // Filters
  filters: FilterState;
  setFilterMulti: <K extends 'status' | 'priority' | 'assignee'>(
    key: K, value: FilterState[K][number]
  ) => void;
  setDateFilter: (key: 'dateFrom' | 'dateTo', value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;

  // Sort (list view)
  sort: SortState;
  setSort: (col: SortColumn) => void;

  // Task mutations
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;

  // Filtered tasks (computed via selector)
  getFilteredTasks: () => Task[];

  // Collaboration simulation
  simUsers: SimUser[];
  setSimUsers: (users: SimUser[] | ((prev: SimUser[]) => SimUser[])) => void;
}

// ─── Default filter state ─────────────────────────────────────────────────────

const EMPTY_FILTERS: FilterState = {
  status: [],
  priority: [],
  assignee: [],
  dateFrom: '',
  dateTo: '',
};

// ─── Store creation ───────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>((set, get) => ({
  tasks: generateTasks(500),
  view: readViewFromURL(),

  filters: {
    ...EMPTY_FILTERS,
    ...readFiltersFromURL(),
  },

  sort: { col: null, dir: 'asc' },

  simUsers: [],

  setView: (v) => {
    set({ view: v });
    pushFiltersToURL(get().filters, v);
  },

  setFilterMulti: (key, value) => {
    const prev = get().filters[key] as string[];
    const idx = prev.indexOf(value as string);
    const next = idx === -1
      ? [...prev, value]
      : prev.filter((_, i) => i !== idx);
    const filters = { ...get().filters, [key]: next };
    set({ filters });
    pushFiltersToURL(filters, get().view);
  },

  setDateFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value };
    set({ filters });
    pushFiltersToURL(filters, get().view);
  },

  clearFilters: () => {
    const filters = { ...EMPTY_FILTERS };
    set({ filters });
    pushFiltersToURL(filters, get().view);
  },

  hasActiveFilters: () => {
    const { status, priority, assignee, dateFrom, dateTo } = get().filters;
    return !!(status.length || priority.length || assignee.length || dateFrom || dateTo);
  },

  setSort: (col) => {
    const { sort } = get();
    set({
      sort: {
        col,
        dir: sort.col === col && sort.dir === 'asc' ? 'desc' : 'asc',
      },
    });
  },

  updateTaskStatus: (taskId, status) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t),
    }));
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter(t => {
      if (filters.status.length && !filters.status.includes(t.status)) return false;
      if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
      if (filters.assignee.length && !filters.assignee.includes(t.assigneeId)) return false;
      if (filters.dateFrom && t.dueDate < filters.dateFrom) return false;
      if (filters.dateTo && t.dueDate > filters.dateTo) return false;
      return true;
    });
  },

  setSimUsers: (users) => {
    if (typeof users === 'function') {
      set(state => ({ simUsers: (users as (prev: SimUser[]) => SimUser[])(state.simUsers) }));
    } else {
      set({ simUsers: users });
    }
  },
}));
