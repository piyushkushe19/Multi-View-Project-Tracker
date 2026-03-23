import type { Task, SortState } from '../types';
import { PRIORITY_SORT_VALUE } from '../types';

export function sortTasks(tasks: Task[], sort: SortState): Task[] {
  if (!sort.col) return tasks;

  return [...tasks].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    switch (sort.col) {
      case 'title':
        return a.title.localeCompare(b.title) * dir;
      case 'priority':
        return (PRIORITY_SORT_VALUE[a.priority] - PRIORITY_SORT_VALUE[b.priority]) * dir;
      case 'dueDate':
        return a.dueDate.localeCompare(b.dueDate) * dir;
      default:
        return 0;
    }
  });
}
