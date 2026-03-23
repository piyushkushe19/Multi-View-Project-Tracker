import type { Task, TaskPriority, TaskStatus } from '../types';
import { USERS } from './users';

// Seeded Linear Congruential Generator — deterministic, reproducible
function createRng(seed: number) {
  let s = seed;
  return (): number => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 4294967296;
  };
}

const TASK_PREFIXES = [
  'Implement', 'Refactor', 'Design', 'Fix', 'Migrate',
  'Update', 'Create', 'Review', 'Optimize', 'Deploy',
  'Test', 'Document', 'Integrate', 'Analyze', 'Configure',
];

const TASK_SUBJECTS = [
  'authentication flow', 'main dashboard', 'REST API endpoints',
  'database schema', 'UI component library', 'payment gateway',
  'notification system', 'full-text search', 'user profile page',
  'settings panel', 'data pipeline', 'cache layer', 'error handling',
  'logging system', 'email templates', 'mobile layout', 'dark mode toggle',
  'accessibility audit', 'performance profiling', 'security hardening',
  'CI/CD pipeline', 'metrics dashboard', 'onboarding flow',
  'CSV export feature', 'bulk import wizard', 'billing module',
  'admin control panel', 'report generator', 'webhook handler',
  'rate limiter middleware', 'feature flag system', 'A/B test framework',
];

const STATUSES: TaskStatus[] = ['todo', 'inprogress', 'inreview', 'done'];
const PRIORITIES: TaskPriority[] = ['critical', 'high', 'medium', 'low'];

function offsetDate(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateTasks(count = 500): Task[] {
  const rng = createRng(0xDEADBEEF);
  const now = new Date();
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const prefix = TASK_PREFIXES[Math.floor(rng() * TASK_PREFIXES.length)];
    const subject = TASK_SUBJECTS[Math.floor(rng() * TASK_SUBJECTS.length)];
    const title = `${prefix} ${subject}`;

    const assigneeId = USERS[Math.floor(rng() * USERS.length)].id;
    const priority = PRIORITIES[Math.floor(rng() * PRIORITIES.length)];
    const status = STATUSES[Math.floor(rng() * STATUSES.length)];

    // due date: -20 to +40 days from today (ensures some overdue tasks)
    const dueDelta = Math.floor(rng() * 60) - 20;
    const dueDate = offsetDate(now, dueDelta);

    // start date: 3–14 days before due; ~15% chance of null (edge case)
    let startDate: string | null = null;
    if (rng() > 0.15) {
      const startDelta = Math.floor(rng() * 12) + 3;
      startDate = offsetDate(new Date(dueDate), -startDelta);
    }

    tasks.push({
      id: `task-${i + 1}`,
      title,
      assigneeId,
      priority,
      status,
      dueDate,
      startDate,
    });
  }

  return tasks;
}
