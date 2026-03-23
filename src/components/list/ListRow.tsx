import type { Task, TaskStatus } from '../../types';
import { STATUS_LABELS, STATUS_ORDER } from '../../types';
import { getUserById } from '../../data/users';
import { AssigneeAvatar } from '../shared/AssigneeAvatar';
import { PriorityBadge } from '../shared/PriorityBadge';
import { DueLabel } from '../shared/DueLabel';
import { useAppStore } from '../../store/useAppStore';

const ROW_HEIGHT = 48;

interface Props {
  task: Task;
  index: number;
  top: number;
}

export function ListRow({ task, index, top }: Props) {
  const updateTaskStatus = useAppStore(s => s.updateTaskStatus);
  const user = getUserById(task.assigneeId);

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        height: ROW_HEIGHT,
        display: 'grid',
        gridTemplateColumns: '48px 1fr 110px 140px 160px 150px',
        alignItems: 'center',
        gap: 8,
        padding: '0 24px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg)',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg2)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg)';
      }}
    >
      {/* Row number */}
      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
        {index + 1}
      </span>

      {/* Title */}
      <span
        title={task.title}
        style={{
          fontSize: 13,
          color: 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {task.title}
      </span>

      {/* Priority */}
      <PriorityBadge priority={task.priority} />

      {/* Inline status dropdown */}
      <select
        value={task.status}
        onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
        style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border-dim)',
          color: 'var(--text2)',
          fontSize: 11,
          borderRadius: 6,
          padding: '4px 6px',
          fontFamily: 'DM Sans, sans-serif',
          outline: 'none',
          cursor: 'pointer',
          width: '100%',
          appearance: 'none',
          WebkitAppearance: 'none',
        }}
        onFocus={e => {
          (e.currentTarget as HTMLSelectElement).style.borderColor = 'var(--accent)';
        }}
        onBlur={e => {
          (e.currentTarget as HTMLSelectElement).style.borderColor = 'var(--border-dim)';
        }}
      >
        {STATUS_ORDER.map(s => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {/* Assignee */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <AssigneeAvatar user={user} size={22} />
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{user.name.split(' ')[0]}</span>
      </div>

      {/* Due date */}
      <DueLabel dueDate={task.dueDate} />
    </div>
  );
}

export { ROW_HEIGHT };
