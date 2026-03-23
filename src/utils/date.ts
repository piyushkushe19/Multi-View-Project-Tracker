// Returns today's date as YYYY-MM-DD
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export type DueLabelResult = {
  label: string;
  variant: 'overdue' | 'today' | 'future' | 'normal';
};

export function getDueLabel(dueDate: string): DueLabelResult {
  const today = todayStr();
  if (dueDate === today) {
    return { label: 'Due Today', variant: 'today' };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diffDays = Math.round((now.getTime() - due.getTime()) / 86_400_000);

  if (diffDays > 0) {
    if (diffDays > 7) {
      return { label: `${diffDays}d overdue`, variant: 'overdue' };
    }
    return { label: `${diffDays}d overdue`, variant: 'overdue' };
  }

  const formatted = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { label: formatted, variant: 'normal' };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isoToMonthDay(iso: string): number {
  return parseInt(iso.slice(8), 10);
}

export function isoYearMonth(iso: string): string {
  return iso.slice(0, 7);
}
