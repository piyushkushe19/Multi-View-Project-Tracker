import type { TaskPriority } from '../../types';
import { PRIORITY_LABELS } from '../../types';

interface Props {
  priority: TaskPriority;
}

const STYLES: Record<TaskPriority, { bg: string; color: string }> = {
  critical: { bg: 'rgba(226,75,74,0.18)',    color: '#f08080' },
  high:     { bg: 'rgba(239,159,39,0.18)',   color: '#f5b96e' },
  medium:   { bg: 'rgba(111,93,231,0.18)',   color: '#a898f8' },
  low:      { bg: 'rgba(29,158,117,0.18)',   color: '#5ecfab' },
};

export function PriorityBadge({ priority }: Props) {
  const s = STYLES[priority];
  return (
    <span
      style={{
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 20,
        fontFamily: 'DM Mono, monospace',
        fontWeight: 500,
        letterSpacing: '0.3px',
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
