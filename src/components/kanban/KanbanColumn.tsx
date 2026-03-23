import type { Task, TaskStatus, SimUser } from '../../types';
import { STATUS_LABELS, STATUS_COLORS } from '../../types';
import { TaskCard } from './TaskCard';

interface Props {
  status: TaskStatus;
  tasks: Task[];
  simUsers: SimUser[];
  draggingTaskId: string | null;
  onDragStart: (e: React.PointerEvent, task: Task, el: HTMLDivElement) => void;
}

export function KanbanColumn({ status, tasks, simUsers, draggingTaskId, onDragStart }: Props) {
  const dotColor = STATUS_COLORS[status];

  return (
    <div
      data-kanban-col={status}
      style={{
        flex: '0 0 280px',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg2)',
        border: '1px solid var(--border-dim)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: '14px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-dim)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: dotColor,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
            }}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 20,
            background: 'var(--bg3)',
            color: 'var(--text2)',
            fontFamily: 'DM Mono, monospace',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Column body — drop target */}
      <div
        data-kanban-body={status}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minHeight: 80,
        }}
      >
        {tasks.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 16px',
              color: 'var(--text3)',
              textAlign: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 24, opacity: 0.35 }}>◻</span>
            <span style={{ fontSize: 12 }}>No tasks here</span>
          </div>
        )}
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            simUsers={simUsers}
            isDragging={draggingTaskId === task.id}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}
