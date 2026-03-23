// ─── Domain Types ────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'inprogress' | 'inreview' | 'done';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type ViewMode = 'kanban' | 'list' | 'timeline';
export type SortDirection = 'asc' | 'desc';
export type SortColumn = 'title' | 'priority' | 'dueDate' | null;

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;       // ISO date string YYYY-MM-DD
  startDate: string | null; // ISO date string or null
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface FilterState {
  status: TaskStatus[];
  priority: TaskPriority[];
  assignee: string[];
  dateFrom: string;
  dateTo: string;
}

// ─── Sort Types ───────────────────────────────────────────────────────────────

export interface SortState {
  col: SortColumn;
  dir: SortDirection;
}

// ─── Collaboration Simulation ─────────────────────────────────────────────────

export interface SimUser {
  id: string;
  initials: string;
  color: string;
  taskId: string;
}

// ─── Drag State ───────────────────────────────────────────────────────────────

export interface DragInfo {
  taskId: string;
  sourceStatus: TaskStatus;
  ghostHeight: number;
}

// ─── UI Constants ─────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  inreview: 'In Review',
  done: 'Done',
};

export const STATUS_ORDER: TaskStatus[] = ['todo', 'inprogress', 'inreview', 'done'];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PRIORITY_ORDER: TaskPriority[] = ['critical', 'high', 'medium', 'low'];

export const PRIORITY_SORT_VALUE: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#5c5b72',
  inprogress: '#6f5de7',
  inreview: '#ef9f27',
  done: '#3db06a',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: '#e24b4a',
  high: '#ef9f27',
  medium: '#6f5de7',
  low: '#1d9e75',
};
